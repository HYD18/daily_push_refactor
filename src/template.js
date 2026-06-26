const { formatDate, getAnniversaryDays, getBirthdayCountdown, getToday } = require('./utils/date');

function buildMessageData(config, weatherBundle, hitokoto) {
  const today = getToday(config.timezone);
  const weather = weatherBundle.weather;
  const advice = weatherBundle.advice;
  const birthdays = config.birthdays.map((birthday) => getBirthdayCountdown(birthday, today));
  const oneWords = splitForWechat(hitokoto, 20);
  const tips = splitForWechat(advice.text || '', 20);

  return {
    date: { value: formatDate(today) },
    oneWords: { value: oneWords[0] },
    oneWords2: { value: oneWords[1] },
    region: { value: config.location.name },
    temp: { value: `${weather.tempMin}度~${weather.tempMax}度` },
    textDay: { value: compactJoin([weather.textDay, weather.windDirDay]) },
    textNight: { value: compactJoin([weather.textNight, weather.windDirNight]) },
    memorialDay: { value: String(getAnniversaryDays(config.anniversary.date, today)) },
    name: { value: birthdays[0].name },
    birthdayDiff: { value: String(birthdays[0].days) },
    name2: { value: birthdays[1].name },
    birthdayDiff2: { value: String(birthdays[1].days) },
    tip: { value: tips[0] },
    tip2: { value: tips[1] }
  };
}

function buildTemplatePayload(config, toUser, data) {
  return {
    touser: toUser,
    template_id: config.wechat.templateId,
    url: config.template.url,
    topcolor: config.template.color,
    data
  };
}

function splitForWechat(value, maxLength) {
  const text = String(value || '');

  if (text.length <= maxLength) {
    return [text, ''];
  }

  return [text.slice(0, maxLength), text.slice(maxLength)];
}

function compactJoin(items) {
  return items.filter(Boolean).join(',');
}

module.exports = {
  buildMessageData,
  buildTemplatePayload,
  splitForWechat
};
