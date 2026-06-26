async function fetchJson(url, options = {}) {
  if (typeof fetch !== 'function') {
    throw new Error('This project requires Node.js 18+ because it uses global fetch.');
  }

  const response = await fetch(url, options);
  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`Invalid JSON response from ${url}: ${text.slice(0, 120)}`);
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}: ${JSON.stringify(data)}`);
  }

  return data;
}

module.exports = {
  fetchJson
};
