const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx3wJFWgg1mE2sQMuEYlQaApCxlB7_Ew_nKzk_FG3vWPiD8995rZCN3d65PA4oouH-0/exec';

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const payload = JSON.parse(event.body);
    const qs = encodeURIComponent(JSON.stringify(payload));

    const resp = await fetch(APPS_SCRIPT_URL + '?data=' + qs);
    const result = await resp.json();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ status: 'error', message: err.toString() }),
    };
  }
};
