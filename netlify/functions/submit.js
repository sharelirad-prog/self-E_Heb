const https = require('https');

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx3wJFWgg1mE2sQMuEYlQaApCxlB7_Ew_nKzk_FG3vWPiD8995rZCN3d65PA4oouH-0/exec';

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve({status:'ok'}); } // Apps Script sometimes redirects
      });
    }).on('error', reject);
  });
}

exports.handler = async function(event) {
  const headers = { 'Access-Control-Allow-Origin': '*' };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const payload = JSON.parse(event.body);
    const qs = encodeURIComponent(JSON.stringify(payload));
    const result = await httpsGet(APPS_SCRIPT_URL + '?data=' + qs);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: 'ok', ...result }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ status: 'error', message: err.toString() }),
    };
  }
};
