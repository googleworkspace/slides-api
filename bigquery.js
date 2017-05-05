/**
 * BigQuery Operations
 *
 * Install BigQuery: `npm install --save @google-cloud/bigquery`
 * Documentation: https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/0.9.2/bigquery
 * Turn on BigQuery:
 * - Go to https://console.developers.google.com/apis/dashboard
 * - Services > BigQuery API v2 > bigquery.jobs.query
 */
const read = require('read-file');
const {project_id} = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const bigquery = require('@google-cloud/bigquery')({
  projectId: project_id
});

const query = `
  SELECT
    license,
    COUNT(*) AS count
  FROM
    [bigquery-public-data:github_repos.licenses],
  GROUP BY
    license
  ORDER BY
    count DESC
  LIMIT 10
`;

/**
 * Get the license data from BigQuery and our license data.
 */
module.exports.getLicenseData = () => new Promise((resolve, reject) => {
  bigquery.query(query).then(data => {
    var githubData = data[0];

    Promise.all(githubData.map(
      licenseDatum => getLicenseText(licenseDatum.license, githubData)
    )).then(resolve);
  });
});

/**
 * Gets a promise to get data about a license
 * @param  {String} licenseName The license name
 */
function getLicenseText(licenseName, githubData) {
  console.log(licenseName);
  return new Promise((resolve, reject) => {
    read(`./data/license/${licenseName}.txt`, 'utf8', (err, buffer) => {
      resolve({
        licenseName,
        count: githubData.filter(datum => datum.license === licenseName)[0].count,
        license: buffer
      });
    });
  });
}
