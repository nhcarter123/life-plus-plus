import { IRuntimeActivity, TActivity } from "./activities";

type TScheduleItem = {
  day: number;
  time: number;
  activity: TActivity;
};
type TScheduleDay = TScheduleItem[];
type TSchedule = TScheduleDay[];

export const wakeUpTime = 6 * 60;
const sleepDuration = 8;

const scoreSchedule = (schedule: TSchedule) => {
  let score = 0;

  for (const day of schedule) {
  }

  return score;
};

export const schedule = (activities: TActivity[], days: number): TSchedule => {
  const activitiesCopy: IRuntimeActivity[] = activities.map((activity) => ({
    ...activity,
    charge: Math.max(activity.frequency, 1),
  }));
  const schedule = [];

  for (let day = 0; day < days; day++) {
    let minutes = wakeUpTime;
    const scheduleDay: TScheduleDay = [];

    const fixedActivities = activitiesCopy.filter(
      (activity) => activity.fixedTime,
    );
    const nonFixedActivities = activitiesCopy.filter(
      (activity) => !activity.fixedTime,
    );

    for (const activity of fixedActivities) {
      if (activity.fixedTime) {
        const scheduleItem: TScheduleItem = {
          day,
          time: activity.fixedTime,
          activity,
        };
        scheduleDay.push(scheduleItem);
      }
    }

    for (const activity of nonFixedActivities) {
      const { duration, frequency } = activity;
      const chargeIterator = Math.floor(parseFloat(activity.charge.toFixed(3)));

      for (let i = 0; i < chargeIterator; i++) {
        const scheduleItem: TScheduleItem = {
          day,
          time: minutes,
          activity,
        };

        const collides = checkCollision(scheduleItem, scheduleDay);

        if (!collides) {
          scheduleDay.push(scheduleItem);
          minutes += duration;
        }
      }

      activity.charge += frequency;
      activity.charge -= chargeIterator;

      // if (activity.name === 'groceries') {
      //   console.log(activity.charge);
      // }

      // scheduleDay.push(scheduleItem);
    }

    scheduleDay.sort((a, b) => a.time - b.time);
    schedule.push(scheduleDay);
  }

  return schedule;
};

const checkCollision = (
  scheduleItem: TScheduleItem,
  scheduleDay: TScheduleDay,
) => {
  const { time, activity } = scheduleItem;

  for (const item of scheduleDay) {
    if (
      item.time < time + activity.duration &&
      item.time + item.activity.duration > time
    ) {
      return true;
    }
  }

  return false;
};
