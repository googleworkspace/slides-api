// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const google = require('googleapis');
const slides = google.slides('v1');
const drive = google.drive('v3');
const openurl = require('openurl');
const commaNumber = require('comma-number');

const SLIDE_TITLE_TEXT = 'Open Source Licenses Analysis';

/**
 * Get a single slide json request
 * @param {object} licenseData data about the license
 * @param {object} index the slide index
 * @return {object} The json for the Slides API
 * @example licenseData: {
 *            "licenseName": "mit",
 *            "percent": "12.5",
 *            "count": "1667029"
 *            license:"<body>"
 *          }
 * @example index: 3
 */
function createSlideJSON(licenseData, index) {
  // Then update the slides.
  const ID_TITLE_SLIDE = 'id_title_slide';
  const ID_TITLE_SLIDE_TITLE = 'id_title_slide_title';
  const ID_TITLE_SLIDE_BODY = 'id_title_slide_body';

  return [{
    // Creates a "TITLE_AND_BODY" slide with objectId references
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
    // Inserts the license name, percent, and count in the title
    insertText: {
      objectId: `${ID_TITLE_SLIDE_TITLE}_${index}`,
      text: `#${index + 1} ${licenseData.licenseName}  — ~${licenseData.percent}% (${commaNumber(licenseData.count)} repos)`
    }
  }, {
    // Inserts the license in the text body paragraph
    insertText: {
      objectId: `${ID_TITLE_SLIDE_BODY}_${index}`,
      text: licenseData.license
    }
  }, {
    // Formats the slide paragraph's font
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
    // Formats the slide text style
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

/**
 * Creates slides for our presentation.
 * @param {authAndGHData} An array with our Auth object and the GitHub data.
 * @return {Promise} A promise to return a new presentation.
 * @see https://developers.google.com/apis-explorer/#p/slides/v1/
 */
module.exports.createSlides = (authAndGHData) => new Promise((resolve, reject) => {
  console.log('creating slides...');
  const [auth, ghData] = authAndGHData;

  // First copy the template slide from drive.
  drive.files.copy({
    auth: auth,
    fileId: '1toV2zL0PrXJOfFJU-NYDKbPx9W0C4I-I8iT85TS0fik',
    fields: 'id,name,webViewLink',
    resource: {
      name: SLIDE_TITLE_TEXT
    }
  }, (err, presentation) => {
    if (err) return reject(err);

    const allSlides = ghData.map((data, index) => createSlideJSON(data, index));
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
    }, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(presentation);
      }
    });
  });
});

/**
 * Opens a presentation in a browser.
 * @param {String} presentation The presentation object.
 */
module.exports.openSlidesInBrowser = (presentation) => {
  console.log('Presentation URL:', presentation.webViewLink);
  openurl.open(presentation.webViewLink);
}
