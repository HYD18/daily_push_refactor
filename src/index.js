const { loadConfigs } = require('./config');
const { getHitokoto } = require('./services/hitokoto');
const { getWeatherBundle } = require('./services/weather');
const { getAccessToken, sendTemplateMessage } = require('./services/wechat');
const { buildMessageData, buildTemplatePayload } = require('./template');

async function run() {
  const configs = loadConfigs();
  const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';

  for (const config of configs) {
    await runOneConfig(config, dryRun);
  }
}

async function runOneConfig(config, dryRun) {
  console.log(`[daily_push] Preparing push for ${config.location.name}`);

  const [weatherBundle, hitokoto] = await Promise.all([
    getWeatherBundle(config),
    getHitokoto(config)
  ]);
  const data = buildMessageData(config, weatherBundle, hitokoto);

  if (dryRun) {
    console.log('[daily_push] DRY_RUN enabled. Message data:');
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  const accessToken = await getAccessToken(config);

  for (const toUser of config.wechat.toUsers) {
    const payload = buildTemplatePayload(config, toUser, data);
    const result = await sendTemplateMessage(accessToken, payload);
    console.log(`[daily_push] Sent to ${maskOpenId(toUser)}: ${JSON.stringify(result)}`);
  }
}

function maskOpenId(openId) {
  if (!openId || openId.length <= 8) {
    return '***';
  }

  return `${openId.slice(0, 4)}...${openId.slice(-4)}`;
}

if (require.main === module) {
  run().catch((error) => {
    console.error(`[daily_push] ${error.stack || error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  run,
  runOneConfig
};
