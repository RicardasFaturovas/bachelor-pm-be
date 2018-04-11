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
module.exports = {
  schema: timeSchema,
  formatTime,
};
