require('dotenv').config();
const auth = require('./auth');
const slides = require('./slides');
const license = require('./license');

/**
 * Generates slides using the Google Slides, Drive, and BigQuery APIs.
 */
console.log('-- Start generating slides. --')
auth.getClientSecrets()
  .then(auth.authorize)
  .then(license.getLicenseData)
  .then(slides.createSlides)
  .then(slides.openSlidesInBrowser)
  .then(() => {
    console.log('-- Finished generating slides. --');
  });
