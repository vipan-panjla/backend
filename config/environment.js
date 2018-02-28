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
    apiKey: 'sk_test_mRU4BQ2S5rVyPHLYYKkpdx01' // client account
  },
  
};