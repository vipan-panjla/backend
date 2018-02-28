'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // CORS
  allowedOriginsApi: [
    'http://localhost', 
    'http://localhost:4300',
    'http://bytecodetechnologies.co.in',
    'http://bytecodetechnologies.co.in/',
    'http://bytecodetechnologies.co.in/jive',
    'http://bytecodetechnologies.co.in/jive/'
  ],
  stripe:{
    apiKey: 'sk_test_dhdveRA7pch0mMK9PpT8gHaH' // my account
  },
  
};