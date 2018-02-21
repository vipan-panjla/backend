const User = require('../models/User');

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
exports.isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    User.findOne({token: token}, (err, user) => {
      if (err) { 
        console.log(err);
        return res.status(401).json({ errors: {'Token': ['invalid']}}); 
      }
      req.user = user;
      next();
    });
  }
};