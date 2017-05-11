/**
 * Creates slides for our presentation.
 * @param {authAndGHData} An array with our Auth object and the GitHub data.
 * @return {Promise} A promise to return a new presentation.
 * @see https://developers.google.com/apis-explorer/#p/slides/v1/
 */
module.exports.createSlides = (authAndGHData) => new Promise((resolve, reject) => {
  console.log('TODO: Create Slides');
  resolve({});
});

/**
 * Opens a presentation in a browser.
 * @param {String} presentation The presentation object.
 */
module.exports.openSlidesInBrowser = (presentation) => {
  console.log('TODO: Open Slides');
}
