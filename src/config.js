const fs = require('fs');
const path = require('path');

function readJsonFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return parseConfigPayload(content);
}

function parseConfigPayload(raw) {
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;

  if (typeof parsed === 'string') {
    return parseConfigPayload(parsed);
  }

  if (Array.isArray(parsed)) {
    return parsed.map((item) => (typeof item === 'string' ? JSON.parse(item) : item));
  }

  return parsed;
}

function findConfigSource(cwd = process.cwd()) {
  if (process.env.CONFIG_PATH) {
    return { type: 'file', value: path.resolve(cwd, process.env.CONFIG_PATH) };
  }

  if (process.env.DAILY_PUSH_CONFIGS) {
    return { type: 'env', value: process.env.DAILY_PUSH_CONFIGS };
  }

  if (process.env.daliyPushConfigs) {
    return { type: 'env', value: process.env.daliyPushConfigs };
  }

  const configPath = path.join(cwd, 'config.json');
  if (fs.existsSync(configPath)) {
    return { type: 'file', value: configPath };
  }

  const legacyConfigPath = path.join(cwd, 'configs.json');
  if (fs.existsSync(legacyConfigPath)) {
    return { type: 'file', value: legacyConfigPath };
  }

  return null;
}

function loadConfigs(cwd = process.cwd()) {
  const source = findConfigSource(cwd);

  if (!source) {
    throw new Error('No configuration found. Create config.json or set DAILY_PUSH_CONFIGS.');
  }

  const rawConfigs = source.type === 'file' ? readJsonFile(source.value) : parseConfigPayload(source.value);
  const configList = Array.isArray(rawConfigs) ? rawConfigs : [rawConfigs];

  return configList.map((config) => normalizeConfig(config));
}

function normalizeConfig(config) {
  if (config.wechat) {
    return validateConfig({
      timezone: config.timezone || 'Asia/Shanghai',
      location: {
        name: config.location?.name || config.location,
        adm: config.location?.adm || ''
      },
      weather: {
        qweatherKey: config.weather?.qweatherKey || config.weather?.key,
        indexType: String(config.weather?.indexType || '1')
      },
      anniversary: {
        label: config.anniversary?.label || '恋爱',
        date: config.anniversary?.date
      },
      birthdays: normalizeBirthdays(config.birthdays),
      hitokoto: {
        type: config.hitokoto?.type || 'd'
      },
      wechat: {
        appId: config.wechat.appId,
        appSecret: config.wechat.appSecret,
        templateId: config.wechat.templateId,
        toUsers: config.wechat.toUsers || config.wechat.toUser || []
      },
      template: {
        url: config.template?.url || 'http://weixin.qq.com/download',
        color: config.template?.color || '#FF0000'
      }
    });
  }

  return validateConfig({
    timezone: config.timezone || 'Asia/Shanghai',
    location: {
      name: config.location,
      adm: config.adm || ''
    },
    weather: {
      qweatherKey: config.key,
      indexType: String(config.weatherIndex || '1')
    },
    anniversary: {
      label: '恋爱',
      date: config.fullInLoveDate
    },
    birthdays: normalizeBirthdays([
      { name: config.name, date: config.birthday, calendar: 'lunar' },
      { name: config.name2, date: config.birthday2, calendar: 'lunar' }
    ]),
    hitokoto: {
      type: config.oneType || 'd'
    },
    wechat: {
      appId: config.appId,
      appSecret: config.appSecret,
      templateId: config.templateId,
      toUsers: config.toUsers || config.toUser || []
    },
    template: {
      url: config.url || 'http://weixin.qq.com/download',
      color: config.topcolor || '#FF0000'
    }
  });
}

function normalizeBirthdays(birthdays) {
  const list = Array.isArray(birthdays) ? birthdays : [];

  return list.slice(0, 2).map((birthday, index) => ({
    name: birthday.name || `用户${index + 1}`,
    date: birthday.date,
    calendar: birthday.calendar || 'lunar'
  }));
}

function validateConfig(config) {
  const missing = [];

  if (!config.location.name) missing.push('location.name');
  if (!config.weather.qweatherKey) missing.push('weather.qweatherKey');
  if (!config.anniversary.date) missing.push('anniversary.date');
  if (!config.wechat.appId) missing.push('wechat.appId');
  if (!config.wechat.appSecret) missing.push('wechat.appSecret');
  if (!config.wechat.templateId) missing.push('wechat.templateId');
  if (!Array.isArray(config.wechat.toUsers) || config.wechat.toUsers.length === 0) {
    missing.push('wechat.toUsers');
  }

  config.birthdays.forEach((birthday, index) => {
    if (!birthday.date) missing.push(`birthdays[${index}].date`);
  });

  if (missing.length > 0) {
    throw new Error(`Invalid configuration. Missing: ${missing.join(', ')}`);
  }

  while (config.birthdays.length < 2) {
    config.birthdays.push({ name: `用户${config.birthdays.length + 1}`, date: '2000-01-01', calendar: 'solar' });
  }

  return config;
}

module.exports = {
  loadConfigs,
  normalizeConfig,
  parseConfigPayload
};
