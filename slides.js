const fs = require('fs');
const readline = require('readline');
const google = require('googleapis');
const slides = google.slides('v1');
const drive = google.drive('v3');
const googleAuth = require('google-auth-library');
const openurl = require('openurl');
const commaNumber = require('comma-number')

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/slides.googleapis.com-nodejs-quickstart.json
const SCOPES = [
  'https://www.googleapis.com/auth/presentations', // needed to create slides
  'https://www.googleapis.com/auth/drive', // read and write files
  'https://www.googleapis.com/auth/bigquery.readonly' // needed for bigquery
];

const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
      process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'slides.googleapis.com-nodejs-quickstart.json';

const SLIDE_TITLE_TEXT = 'Open Source Licenses Analysis';

/**
 * Loads client secrets from a local file.
 *
 * @return {Promise} A promise to return the secrets.
 */
module.exports.getClientSecrets = () => {
  return new Promise((resolve, reject) => {
    fs.readFile('data/secrets/client_secret.json', (err, content) => {
      if (err) {
        reject('Error loading client secret file: ' + err);
        return;
      }

      console.log('loaded secrets...');
      resolve(JSON.parse(content));
    });
  });
}

/**
 * Create an OAuth2 client promise with the given credentials.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback for the authorized client.
 */
module.exports.authorize = (credentials) => {
  return new Promise((resolve, reject) => {
    console.log('auth...');
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const auth = new googleAuth();
    const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) {
        getNewToken(oauth2Client, () => {
          resolve(oauth2Client);
        });
      } else {
        oauth2Client.credentials = JSON.parse(token);
        resolve(oauth2Client);
      }
    });
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback with the authorized client.
 */
function getNewToken(oauth2Client, callback) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });

  console.log('Authorizing...');
  openurl.open(authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  console.log(''); // \n
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Creates slides for our presentation.
 *
 * @param  {authAndGHData}
 * @see https://developers.google.com/apis-explorer/#p/slides/v1/
 */
module.exports.createSlides = (authAndGHData) => new Promise((resolve, reject) => {
  var auth = authAndGHData[0];
  var ghData = authAndGHData[1];

  // First copy the template slide from drive.
  drive.files.copy({
    auth: auth,
    fileId: '1toV2zL0PrXJOfFJU-NYDKbPx9W0C4I-I8iT85TS0fik',
    resource: {
      name: SLIDE_TITLE_TEXT
    }
  }, (err, presentation) => {
    // Then update the slides.
    const ID_TITLE_SLIDE = 'id_title_slide';
    const ID_TITLE_SLIDE_TITLE = 'id_title_slide_title';
    const ID_TITLE_SLIDE_BODY = 'id_title_slide_body';

    /**
     * Get a single slide json
     * @param  {object} licenseData data about the license
     * @param  {object} index = the slide index
     * @return {object} The json for the Slides API
     * @example {"licenseName": "mit", "count": "1667029" license:"<body>"}
     */
    function createSlideJSON(licenseData, index) {
      return [{
        createSlide: {
          objectId: `${ID_TITLE_SLIDE}_${index}`,
          slideLayoutReference: {
            predefinedLayout: 'TITLE_AND_BODY'
          },
          placeholderIdMappings: [{
            layoutPlaceholder: {
              type: 'TITLE'
            },
            objectId: `${ID_TITLE_SLIDE_TITLE}_${index}`
          }, {
            layoutPlaceholder: {
              type: 'BODY'
            },
            objectId: `${ID_TITLE_SLIDE_BODY}_${index}`
          }]
        }
      }, {
        insertText: {
          objectId: `${ID_TITLE_SLIDE_TITLE}_${index}`,
          text: `#${index + 1} ${licenseData.licenseName}  — ~${licenseData.percent}% (${commaNumber(licenseData.count)} repos)`
        }
      }, {
        insertText: {
          objectId: `${ID_TITLE_SLIDE_BODY}_${index}`,
          text: licenseData.license
        }
      }, {
        updateParagraphStyle: {
          objectId: `${ID_TITLE_SLIDE_BODY}_${index}`,
          fields: '*',
          style: {
            lineSpacing: 10,
            spaceAbove: {magnitude: 0, unit: 'PT'},
            spaceBelow: {magnitude: 0, unit: 'PT'},
          }
        }
      }, {
        updateTextStyle: {
          objectId: `${ID_TITLE_SLIDE_BODY}_${index}`,
          style: {
            bold: true,
            italic: true,
            fontSize: {
              magnitude: 10,
              unit: 'PT'
            }
          },
          fields: '*',
        }
      }];
    }

    const allSlides = ghData.map(
        (data, index) => createSlideJSON(data, index));
    slideRequests = [].concat.apply([], allSlides); // flatten the slide requests
    slideRequests.push({
      replaceAllText: {
        replaceText: SLIDE_TITLE_TEXT,
        containsText: { text: '{{TITLE}}' }
      }
    })


    // Execute the requests
    slides.presentations.batchUpdate({
      auth: auth,
      presentationId: presentation.id,
      resource: {
        requests: slideRequests
      }
    });

    resolve(presentation);
  });
});

/**
 * Returns the presentation URL from a presentation ID.
 * @param  {String} presentationId The presentation ID.
 * @return {String} The presentation URL.
 */
function getPresentationURL(presentationId) {
  return `https://docs.google.com/presentation/d/${presentationId}`;
}

/**
 * Opens a presentation in a browser.
 * @param  {String} presentation The presentation object.
 */
module.exports.openSlidesInBrowser = (presentation) => {
  const url = getPresentationURL(presentation.id);
  console.log('Presentation URL:', url);
  openurl.open(url);
}
