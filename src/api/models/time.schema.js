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
  days += Math.floor(hours / 24);
  hours = (hours % 24) + Math.floor(minutes / 60);
  minutes %= 60;

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
