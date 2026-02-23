const https = require('https');
const http = require('http');

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx3wJFWgg1mE2sQMuEYlQaApCxlB7_Ew_nKzk_FG3vWPiD8995rZCN3d65PA4oouH-0/exec';

function getWithRedirects(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && maxRedirects > 0) {
        return getWithRedirects(res.headers.location, maxRedirects - 1).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve({ status: 'ok' }); }
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
    const result = await getWithRedirects(APPS_SCRIPT_URL + '?data=' + qs);

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
