function getToday(timezone = 'Asia/Shanghai') {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const parts = Object.fromEntries(formatter.formatToParts(new Date()).map((part) => [part.type, part.value]));
  return toUtcDate(`${parts.year}-${parts.month}-${parts.day}`);
}

function toUtcDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

function formatDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function diffDays(left, right) {
  const millisPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((left.getTime() - right.getTime()) / millisPerDay);
}

function getAnniversaryDays(startDate, today) {
  return Math.max(0, diffDays(today, toUtcDate(startDate)));
}

function getBirthdayCountdown(birthday, today) {
  const calendar = String(birthday.calendar || 'lunar').toLowerCase();
  const candidate = calendar === 'lunar'
    ? nextLunarBirthday(birthday.date, today)
    : nextSolarBirthday(birthday.date, today);

  return {
    name: birthday.name,
    date: formatDate(candidate),
    days: Math.max(0, diffDays(candidate, today))
  };
}

function nextSolarBirthday(dateString, today) {
  const [, month, day] = dateString.split('-').map(Number);
  let candidate = new Date(Date.UTC(today.getUTCFullYear(), month - 1, day, 12, 0, 0));

  if (diffDays(candidate, today) < 0) {
    candidate = new Date(Date.UTC(today.getUTCFullYear() + 1, month - 1, day, 12, 0, 0));
  }

  return candidate;
}

function nextLunarBirthday(dateString, today) {
  let solarlunar;

  try {
    solarlunar = require('solarlunar');
  } catch (error) {
    throw new Error('Lunar birthday requires dependency "solarlunar". Run npm install first.');
  }

  const [, lunarMonth, lunarDay] = dateString.split('-').map(Number);
  let candidate = lunarToSolarDate(solarlunar, today.getUTCFullYear(), lunarMonth, lunarDay);

  if (diffDays(candidate, today) < 0) {
    candidate = lunarToSolarDate(solarlunar, today.getUTCFullYear() + 1, lunarMonth, lunarDay);
  }

  return candidate;
}

function lunarToSolarDate(solarlunar, year, month, day) {
  const solar = solarlunar.lunar2solar(year, month, day);

  if (!solar || solar === -1 || !solar.cYear || !solar.cMonth || !solar.cDay) {
    throw new Error(`Invalid lunar date: ${year}-${month}-${day}`);
  }

  return new Date(Date.UTC(solar.cYear, solar.cMonth - 1, solar.cDay, 12, 0, 0));
}

module.exports = {
  diffDays,
  formatDate,
  getAnniversaryDays,
  getBirthdayCountdown,
  getToday,
  toUtcDate
};
