const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  name: String,
  username: String,
  type: String,
  token: {type: String, required: true},
  phone: String,
  address: String,
  picture: {type:String, default: 'uploads/user.png'}
}, { timestamps: true });

/**
 * Update date changing on every update to user
 * Adding token if not present
 */
userSchema.pre('validate', function(next) {
  this.updated = new Date();
  if (!this.token) {
    this.token = this.newToken();
  }
  next();
});

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
  * Generate a token
  */
userSchema.methods.newToken = function () {
  const token = [];
  for (let i = 0; i <= 10; i++) {
    token.push(Math.floor(Math.random() * 10));
  }
  return token.join('');
}

const User = mongoose.model('User', userSchema);

module.exports = User;

