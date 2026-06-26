const { fetchJson } = require('./http');

async function getAccessToken(config) {
  const params = new URLSearchParams({
    grant_type: 'client_credential',
    appid: config.wechat.appId,
    secret: config.wechat.appSecret
  });

  const data = await fetchJson(`https://api.weixin.qq.com/cgi-bin/token?${params.toString()}`);

  if (!data.access_token) {
    throw new Error(`Wechat access token failed: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

async function sendTemplateMessage(accessToken, payload) {
  const data = await fetchJson(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${accessToken}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (data.errcode !== 0) {
    throw new Error(`Wechat message send failed: ${JSON.stringify(data)}`);
  }

  return data;
}

module.exports = {
  getAccessToken,
  sendTemplateMessage
};
