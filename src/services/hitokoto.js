const { fetchJson } = require('./http');

async function getHitokoto(config) {
  const params = new URLSearchParams({
    c: config.hitokoto.type || 'd',
    encode: 'json'
  });

  try {
    const data = await fetchJson(`https://v1.hitokoto.cn/?${params.toString()}`);
    return data.hitokoto || '';
  } catch (error) {
    console.warn(`Hitokoto request failed: ${error.message}`);
    return '';
  }
}

module.exports = {
  getHitokoto
};
