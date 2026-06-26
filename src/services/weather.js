const { fetchJson } = require('./http');

async function getWeatherBundle(config) {
  const city = await getCity(config);
  const [weather, advice] = await Promise.all([
    getDailyWeather(config, city.id),
    getDailyAdvice(config, city.id)
  ]);

  return {
    city,
    weather,
    advice
  };
}

async function getCity(config) {
  const params = new URLSearchParams({
    location: config.location.name,
    key: config.weather.qweatherKey
  });

  if (config.location.adm) {
    params.set('adm', config.location.adm);
  }

  const data = await fetchJson(`https://geoapi.qweather.com/v2/city/lookup?${params.toString()}`);

  if (data.code !== '200' || !data.location || data.location.length === 0) {
    throw new Error(`QWeather city lookup failed: ${JSON.stringify(data)}`);
  }

  return data.location[0];
}

async function getDailyWeather(config, cityId) {
  const params = new URLSearchParams({
    location: cityId,
    key: config.weather.qweatherKey
  });

  const data = await fetchJson(`https://devapi.qweather.com/v7/weather/3d?${params.toString()}`);

  if (data.code !== '200' || !data.daily || data.daily.length === 0) {
    throw new Error(`QWeather daily weather failed: ${JSON.stringify(data)}`);
  }

  return data.daily[0];
}

async function getDailyAdvice(config, cityId) {
  const params = new URLSearchParams({
    location: cityId,
    key: config.weather.qweatherKey,
    type: config.weather.indexType
  });

  const data = await fetchJson(`https://devapi.qweather.com/v7/indices/3d?${params.toString()}`);

  if (data.code !== '200' || !data.daily || data.daily.length === 0) {
    throw new Error(`QWeather indices failed: ${JSON.stringify(data)}`);
  }

  return data.daily[0];
}

module.exports = {
  getWeatherBundle
};
