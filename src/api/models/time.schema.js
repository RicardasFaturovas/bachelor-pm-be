const { pipe, reduce } = require('ramda');

const timeSchema = {
  days: {
    type: Number,
  },
  hours: {
    type: Number,
  },
  minutes: {
    type: Number,
  },
};

const formatTime = (timeObj) => {
  let { days = 0, hours = 0, minutes = 0 } = timeObj;
  const totalTimeInMinutes = (days * 8 * 60) +
    (hours * 60) + minutes;

  if (totalTimeInMinutes < 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
    };
  }

  days = Math.floor((totalTimeInMinutes / 480));
  hours = Math.floor(((totalTimeInMinutes - (days * 480)) / 60));
  minutes = Math.floor((totalTimeInMinutes - (days * 480) - (hours * 60)));

  return {
    days,
    hours,
    minutes,
  };
};

const calculateTime = (timeArr) => {
  if (timeArr.length && !timeArr.includes(undefined)) {
    return pipe(
      reduce((acc, val) => ({
        days: acc.days + val.days,
        hours: acc.hours + val.hours,
        minutes: acc.minutes + val.minutes,
      }), { days: 0, hours: 0, minutes: 0 }),
      formatTime,
    )(timeArr);
  }
  return { days: 0, hours: 0, minutes: 0 };
};
module.exports = {
  schema: timeSchema,
  formatTime,
  calculateTime,
};
