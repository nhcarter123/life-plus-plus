import { IRuntimeActivity, TActivity } from "./activities";

type TScheduleItem = {
  day: number;
  time: number;
  activity: TActivity;
};
type TScheduleDay = TScheduleItem[];
type TSchedule = TScheduleDay[];

export const wakeUpTime = 6 * 60;
export const sleepDuration = 8 * 60;

const scoreSchedule = (schedule: TSchedule) => {
  let score = 0;

  for (const day of schedule) {
  }

  return score;
};

// export const schedule = (activities: TActivity[], days: number): TSchedule => {
//   const activitiesCopy: IRuntimeActivity[] = activities.map((activity) => ({
//     ...activity,
//     charge: Math.max(activity.frequency, 1),
//   }));
//   const schedule = [];
//
//   for (let day = 0; day < days; day++) {
//     let minutes = wakeUpTime;
//     const scheduleDay: TScheduleDay = [];
//
//     const fixedActivities = activitiesCopy.filter(
//       (activity) => activity.fixedTime,
//     );
//     const nonFixedActivities = activitiesCopy.filter(
//       (activity) => !activity.fixedTime,
//     );
//
//     for (const activity of fixedActivities) {
//       if (activity.fixedTime) {
//         const scheduleItem: TScheduleItem = {
//           day,
//           time: activity.fixedTime,
//           activity,
//         };
//         scheduleDay.push(scheduleItem);
//       }
//     }
//
//     for (const activity of nonFixedActivities) {
//       const { duration, frequency } = activity;
//       const chargeIterator = Math.floor(parseFloat(activity.charge.toFixed(3)));
//
//       for (let i = 0; i < chargeIterator; i++) {
//         const scheduleItem: TScheduleItem = {
//           day,
//           time: minutes,
//           activity,
//         };
//
//         // const collides = checkCollision(scheduleItem, scheduleDay);
//
//         // if (!collides) {
//         scheduleDay.push(scheduleItem);
//         minutes += duration;
//         // }
//       }
//
//       activity.charge += frequency;
//       activity.charge -= chargeIterator;
//
//       // if (activity.name === 'groceries') {
//       //   console.log(activity.charge);
//       // }
//
//       // scheduleDay.push(scheduleItem);
//     }
//
//     scheduleDay.sort((a, b) => a.time - b.time);
//     schedule.push(scheduleDay);
//   }
//
//   return schedule;
// };

export const randomSchedule = (
  activities: TActivity[],
  days: number,
): TSchedule => {
  const activitiesCopy: IRuntimeActivity[] = activities.map((activity) => ({
    ...activity,
    charge: Math.max(activity.frequency, 1),
  }));
  const schedule = [];

  for (let day = 0; day < days; day++) {
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
          activity: structuredClone(activity),
        };
        scheduleDay.push(scheduleItem);
      }
    }

    for (const activity of nonFixedActivities) {
      const { duration, frequency } = activity;
      const chargeIterator = Math.floor(parseFloat(activity.charge.toFixed(3)));

      const start = wakeUpTime;
      const end = 1440 - (sleepDuration - wakeUpTime) - duration;
      const range = end - start;

      for (let i = 0; i < chargeIterator; i++) {
        const randomTime = start + Math.random() * range;

        const scheduleItem: TScheduleItem = {
          day,
          time: randomTime,
          activity: structuredClone(activity),
        };

        scheduleDay.push(scheduleItem);
      }

      activity.charge += frequency;
      activity.charge -= chargeIterator;
    }

    schedule.push(scheduleDay);
  }

  return schedule;
};

const mutateSchedule = (schedule: TSchedule): TSchedule => {
  for (const day of schedule) {
    day.sort((a, b) => a.time - b.time);

    for (let i = 0; i < day.length; i++) {
      const prevItem = day[i - 1];
      const item = day[i];
      const nextItem = day[i + 1];
      const { activity } = item;
      const { duration, fixedTime } = activity;

      if (!fixedTime) {
        const lowerBound = wakeUpTime;
        const upperBound = 1440 - (sleepDuration - wakeUpTime) - duration;
        const range = upperBound - lowerBound;
        const randomTime = lowerBound + Math.random() * range;

        // if (prevItem) {
        //   const prevItemEnd = prevItem.time + prevItem.activity.duration;
        //   const prevItemEndOverlap = prevItemEnd - item.time;
        //
        //   if (prevItemEndOverlap > 0) {
        //     item.time = Math.max(
        //       lowerBound,
        //       Math.min(upperBound, item.time + prevItemEndOverlap),
        //     );
        //   }
        // }
        //
        // if (nextItem) {
        //   const nextItemStartOverlap = item.time + duration - nextItem.time;
        //
        //   if (nextItemStartOverlap > 0) {
        //     item.time = Math.max(
        //       lowerBound,
        //       Math.min(upperBound, item.time - nextItemStartOverlap),
        //     );
        //   }
        // }

        // Remove overlap
        const overlapAmount = getOverlappingAmount(item, day);
        item.activity.overlap = overlapAmount;

        const mutationAmount = (Math.random() - 0.5) * 400 * overlapAmount;
        item.time = Math.max(
          lowerBound,
          Math.min(upperBound, item.time + mutationAmount),
        );

        let spaceAbove = 0;
        let spaceBelow = 0;
        if (prevItem) {
          const prevItemEnd = prevItem.time + prevItem.activity.duration;
          const prevItemEndOverlap = prevItemEnd - item.time;

          if (prevItemEndOverlap > 0) {
            spaceAbove = prevItemEndOverlap;
          }
        }

        if (nextItem) {
          const nextItemStartOverlap = item.time + duration - nextItem.time;

          if (nextItemStartOverlap > 0) {
            spaceBelow = nextItemStartOverlap;
          }
        }

        item.time = Math.max(
          lowerBound,
          Math.min(upperBound, item.time + (spaceAbove - spaceBelow) / 4),
        );
      }
    }
  }

  return schedule;
};

export const evolveSchedule = (
  schedule: TSchedule,
  generations: number,
): TSchedule => {
  for (let i = 0; i < generations; i++) {
    schedule = mutateSchedule(schedule);
  }

  return schedule;
};

//     scheduleDay.sort((a, b) => a.time - b.time);

const getOverlappingAmount = (
  scheduleItem: TScheduleItem,
  scheduleDay: TScheduleDay,
): number => {
  let overlapScore = 0;

  for (const otherItem of scheduleDay) {
    if (otherItem !== scheduleItem) {
      const aStart = scheduleItem.time;
      const aEnd = scheduleItem.time + scheduleItem.activity.duration;
      const bStart = otherItem.time;
      const bEnd = otherItem.time + otherItem.activity.duration;

      const intersectionStart = Math.max(aStart, bStart);
      const intersectionEnd = Math.min(aEnd, bEnd);

      const intersection = Math.max(0, intersectionEnd - intersectionStart);

      overlapScore += intersection / otherItem.activity.duration;
    }
  }

  return overlapScore;
};
