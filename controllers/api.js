const passport = require('passport');
const fs = require('fs');
// multer required for the file uploads
var multer = require('multer');

 var config = require('../config/environment')
 // stripe key
 var stripe = require('stripe')(config.stripe.apiKey);
 
// set the directory for the uploads to the uploaded to
var DIR = './uploads/';
//define the type of upload multer would be doing and pass in its destination, in our case, its a single file with the name photo
var upload = multer({ dest: DIR }).single('image');

const User = require('../models/User');

/**
 * POST /api/login
 * Sign in using email and password.
 */
exports.login = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    console.log(errors);
    return res.status(401).json({errors:{'email or password': ["is invalid"]}});
  }

  passport.authenticate('local', (err, user, info) => {
    const error = err || info;
    if (error) {
      console.log(error);
      return res.status(401).json({errors:{'email or password': ["is invalid"]}});
    }
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ errors: {'message': ['Something went wrong, please try again.']}});
    }
    user = user.toJSON();
    res.json({
      user: user
    });
  })(req, res, next);
};

/**
 * POST /register
 * Create a new user account.
 */
exports.register = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    console.log(errors);
    return res.status(401).json({errors:{'email or password': ["is invalid"]}});
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
    username: req.body.username
  });

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) {
      console.log(errors);
      return res.status(401).json(errors);
    }
    if (existingUser) {
      return res.status(401).json({ errors: {'User': [' with this email already exists.']}});
    }
    user.save((err) => {
      if (err) {
        return res.status(401).json({ errors: {'message': ['Something went wrong, please try again.']}});
      }
      return res.json({
        user: user
      });
    });
  });
};

/**
 * GET /user
 * Get current user details
 */
exports.getCurrentUser = (req, res, next) => {
  if (!req.user) { 
    console.log(err);
    return res.status(401).json({ errors: {'Token': ['invalid']}}); 
  }
  return res.json({
    user: req.user
  });
};

/**
 * GET /user
 * Get user details
 */
exports.getUser = (req, res, next) => {
  const {userId} = req.params;

  if (!userId || userId === null) {
    return res.status(401).json({ errors: {'User Id': ['is required.']}});
  }

  User.findById(userId, (err, user) => {
    if (err) { 
      console.log(err);
      return res.status(401).json({ errors: {'User Id': [err]}}); 
    }
    return res.json({
      user: user
    });
  });
};

/**
 * PUT /user
 * update user details
 */
exports.updateUser = (req, res, next) => {
  const {userId} = req.params;
  const updatedUser = req.body.user;

  if (!userId || userId === null) {
    return res.status(401).json({ errors: {'User Id': ['is required.']}});
  }

  User.findOne({
    $and: [
      { "email": updatedUser.email },
      { "_id": { $ne: userId }},
    ]
   }, (err, user) => {
    if (err) { 
      console.log(err);
      return res.status(401).json({ errors: {'Token': ['invalid']}}); 
    }

    if (user) {
      return res.status(401).json({ errors: {'User': ['with same email already exists.']}});
    }
    else {
      User.findById(userId, (err, dbUser) => {
        if (err) { 
          console.log(err);
          return res.status(401).json({ errors: {'User Id': [err]}}); 
        }
        dbUser.name = updatedUser.username;
        dbUser.email = updatedUser.email;
        dbUser.phone = updatedUser.phone;
        dbUser.address = updatedUser.address;
        dbUser.picture = updatedUser.picture;

        dbUser.save((err) => {
          return res.json({
            user: dbUser
          });
        });
      });
    }
  });
};

/**
 * POST /fileUpload
 * update user image
 */
exports.uploadImage = (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      // An error occurred while uploading
      console.log(err);
      return res.status(422).send("an Error occurred")
    }

    const file = req.file;
    let newFileName = file.originalname;
    newFileName = newFileName.split('.');
    newFileName.splice(newFileName.length - 1, 0, new Date() * 1);
    newFileName = newFileName.join('.');
    const path = 'uploads/' + newFileName;

    fs.rename('uploads/' + file.filename, 'uploads/' + newFileName, function(err) {
      if (err) {
        console.log('ERROR: ' + err);
      }
      return res.json({imageDetails: {
        url: path,
        name: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }});
    });
  });
}

/**
 * POST /stripe
 * make stripe payment
 */
exports.stripe = (req, res, next) => {
  // for testing;
  // call tripe api for paying the payment
  var userId = req.body.userId
      stripe.charges.create({
        amount: req.body.amount,
        currency: "usd",
        description: req.body.token.email,
        // source: "tok_bypassPending",
         source: req.body.token.id,
      }, function(err, charge) {
        if(err)
        {
          console.log(err);
          return res.status(401).json({ errors: {'stripe': ["error occured during payment"]}}); 
        }
        else
        {
          console.log(charge);
          // set flag if paid
          User.findById(userId, (err, dbUser) => {
            if (err) { 
              console.log(err);
              return res.status(401).json({ errors: {'User': ['error to update user information']}});  
            }
            dbUser.ispaid = true;
            dbUser.stripeToken = charge.id;
            dbUser.save((err) => {
              return res.json({
                user: dbUser,
                message: "successfully Paid"
              });
            });
          });
        }
      });
};