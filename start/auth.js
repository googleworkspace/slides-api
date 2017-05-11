/**
 * Loads client secrets from a local file.
 * @return {Promise} A promise to return the secrets.
 */
module.exports.getClientSecrets = () => {
  return new Promise((resolve, reject) => {
    console.log('TODO: Get Client Secrets');
    resolve({});
  });
}

/**
 * Create an OAuth2 client promise with the given credentials.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback for the authorized client.
 * @return {Promise} A promise to return the OAuth client.
 */
module.exports.authorize = (credentials) => {
  return new Promise((resolve, reject) => {
    console.log('TODO: Authorize');
    resolve({});
  });
}
