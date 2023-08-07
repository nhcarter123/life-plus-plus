import { IRuntimeActivity, TActivity } from "./activities";

export type TScheduleItem = {
  day: number;
  time: number;
  activity: TActivity;
};
export type TScheduleDay = TScheduleItem[];
type TSchedule = TScheduleDay[];

export const wakeUpTime = 6 * 60;
export const sleepDuration = 8 * 60;

const scoreSchedule = (schedule: TSchedule) => {
  let score = 0;

  for (const day of schedule) {
  }

  return score;
};

export const createSchedule = (
  activities: TActivity[],
  days: number,
): TSchedule => {
  const activitiesCopy: IRuntimeActivity[] = activities.map((activity) => ({
    ...activity,
    // charge: 1,
    charge: Math.max(activity.frequency, 1),
  }));
  const schedule = [];

  for (let day = 0; day < days; day++) {
    let scheduleDay: TScheduleDay = [];
    const isWeekend = day % 7 === 0 || day % 7 === 6;
    let hoursWorked = 0;

    const fixedActivities: IRuntimeActivity[] = activitiesCopy.filter(
      (activity) => activity.fixedTime,
    );
    const nonFixedActivities: IRuntimeActivity[] = activitiesCopy.filter(
      (activity) => !activity.fixedTime,
    );

    fixedActivities.sort((a, b) => (a.fixedTime || 0) - (b.fixedTime || 0));
    const immovableActivities = fixedActivities.filter(
      (activity) => activity.immovable,
    );
    const movableActivities = fixedActivities.filter(
      (activity) => !activity.immovable,
    );

    for (const activity of immovableActivities) {
      if (activity.fixedTime && activity.fixedDay === day - 1) {
        activity.charge += activity.frequency;
        if (activity.charge >= 1) {
          activity.charge -= 1;
          const scheduleItem: TScheduleItem = {
            day,
            time: activity.fixedTime,
            activity,
          };

          scheduleDay.push(scheduleItem);
        }
      }
    }

    for (const activity of movableActivities) {
      if (activity.fixedTime) {
        activity.charge += activity.frequency;
        if (activity.charge >= 1) {
          activity.charge -= 1;
          const scheduleItem: TScheduleItem = {
            day,
            time: activity.fixedTime,
            activity,
          };

          const overlappingMinutes = getOverlappingMinutes(
            scheduleItem,
            scheduleDay,
          );
          scheduleItem.time += overlappingMinutes;

          scheduleDay.push(scheduleItem);
        }
      }
    }

    scheduleDay = applyFluidActivities(
      scheduleDay,
      nonFixedActivities,
      fixedActivities,
      activitiesCopy,
      isWeekend,
      day,
    );

    const workedMinutes = scheduleDay.reduce((acc, item) => {
      if (item.activity.countTowardsWorkHours) {
        return acc + item.activity.duration;
      }
      return acc;
    }, 0);
    console.log("workedHours", workedMinutes / 60);

    scheduleDay.sort((a, b) => a.time - b.time);
    schedule.push(scheduleDay);
  }

  return schedule;
};

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
          // activity: structuredClone(activity),
          activity,
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
          // activity: structuredClone(activity),
          activity,
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

const applyFluidActivities = (
  scheduleDay: TScheduleDay,
  fluidActivities: IRuntimeActivity[],
  fixedActivities: IRuntimeActivity[],
  allActivities: IRuntimeActivity[],
  isWeekend: boolean,
  day: number,
): TScheduleDay => {
  for (const activity of fluidActivities) {
    activity.lastActivated = undefined;
  }

  let minutes = wakeUpTime;
  let steps = 0;
  let awayFromHome = false;
  let leftHomeAt = 0;
  let returnHomeMinutes = 0;
  let fixedItemIndex = 0;
  let previousItem: TScheduleItem | null = null;
  const queue = [...fluidActivities]
    // .map((obj) => ({ ...obj }))
    .filter(
      (activity) =>
        activity.charge >= 1 && (!activity.weekdayOnly || !isWeekend),
    );

  while (queue.length > 0 && steps < 200) {
    steps++;

    // TODO: sort by value
    queue.sort((a, b) => {
      const orderA = a.order;
      const orderB = b.order;

      const rewardModifierA = a.rewardForWorking
        ? previousItem?.activity.isWork
          ? -1000
          : 0
        : 0;
      const rewardModifierB = b.rewardForWorking
        ? previousItem?.activity.isWork
          ? -1000
          : 0
        : 0;
      const cooldownModifierA =
        minutes - (a.lastActivated || -1440) >= (a.cooldown || 0) ? 0 : 2000;
      const cooldownModifierB =
        minutes - (b.lastActivated || -1440) >= (b.cooldown || 0) ? 0 : 2000;

      const orderScore =
        orderA +
        rewardModifierA +
        cooldownModifierA -
        (orderB + rewardModifierB + cooldownModifierB);
      const durationScore = b.duration - a.duration;

      return orderScore || durationScore;
    });

    if (awayFromHome && minutes - leftHomeAt > returnHomeMinutes) {
      queue.splice(0, 0, {
        name: "return home",
        order: 99,
        frequency: 0,
        duration: 10,
        charge: 1,
      });
      awayFromHome = false;
    }

    let addedNewActivity = false;
    for (let i = 0; i < queue.length; i++) {
      const activity = queue[i];
      const { duration } = activity;
      const scheduleItem: TScheduleItem = {
        day,
        time: minutes,
        activity,
      };

      const overlappingMinutes = getOverlappingMinutes(
        scheduleItem,
        scheduleDay,
      );

      if (overlappingMinutes === 0) {
        scheduleDay.push(scheduleItem);

        if (activity.minimumTimeSpentThere) {
          awayFromHome = true;
          returnHomeMinutes = activity.minimumTimeSpentThere;
          leftHomeAt = minutes;
        }

        // if (activity.orderDecay) {
        //   activity.order += activity.orderDecay;
        // }

        activity.lastActivated = minutes;
        minutes += duration;
        addedNewActivity = true;
        previousItem = scheduleItem;

        activity.charge -= 1;
        if (activity.charge <= 0) {
          queue.splice(i, 1);
        }
        break;
      }
    }

    if (!addedNewActivity) {
      const nextFixedActivity = fixedActivities[fixedItemIndex];
      const nextFixedItem = scheduleDay.find(
        (item) => item.activity === nextFixedActivity,
      );
      if (nextFixedItem) {
        minutes = nextFixedItem.time + nextFixedItem.activity.duration;
        previousItem = nextFixedItem;
      }
      fixedItemIndex++;
    }
  }

  if (steps >= 200) {
    console.log(steps);
    // throw new Error("Warning: schedule creation took too many steps");
  }

  for (const activity of allActivities) {
    if (isWeekend && activity.weekdayOnly) {
      continue;
    }

    activity.charge += activity.frequency;
  }

  return scheduleDay;
};

// const mutateSchedule = (schedule: TSchedule): TSchedule => {
//   for (const day of schedule) {
//     day.sort((a, b) => a.time - b.time);
//
//     for (let i = 0; i < day.length; i++) {
//       const prevItem = day[i - 1];
//       const item = day[i];
//       const nextItem = day[i + 1];
//       const { activity } = item;
//       const { duration, fixedTime, targetTime } = activity;
//
//       if (!fixedTime) {
//         const lowerBound = wakeUpTime;
//         const upperBound = 1440 - (sleepDuration - wakeUpTime) - duration;
//         const range = upperBound - lowerBound;
//         const randomTime = lowerBound + Math.random() * range;
//
//         let spaceAbove = 0;
//         let spaceBelow = 0;
//         if (prevItem) {
//           const prevItemEnd = prevItem.time + prevItem.activity.duration;
//           const prevItemEndOverlap = prevItemEnd - item.time;
//           spaceAbove = prevItemEndOverlap;
//         }
//
//         item.time = Math.max(
//           lowerBound,
//           Math.min(upperBound, item.time + (spaceAbove - spaceBelow) / 1),
//         );
//
//         let score = 0;
//         if (targetTime) {
//           score -= Math.abs(targetTime - item.time);
//         }
//
//         // Spaced method
//
//         // let spaceAbove = 0;
//         // let spaceBelow = 0;
//         // if (prevItem) {
//         //   const prevItemEnd = prevItem.time + prevItem.activity.duration;
//         //   const prevItemEndOverlap = prevItemEnd - item.time;
//         //   spaceAbove = prevItemEndOverlap;
//         // }
//         //
//         // if (nextItem) {
//         //   const nextItemStartOverlap = item.time + duration - nextItem.time;
//         //   spaceBelow = nextItemStartOverlap;
//         // }
//         //
//         // item.time = Math.max(
//         //   lowerBound,
//         //   Math.min(upperBound, item.time + (spaceAbove - spaceBelow) / 2),
//         // );
//         //
//         // // Remove overlap
//         // const overlapAmount = getOverlappingAmount(item, day);
//         // item.activity.overlap = overlapAmount;
//         //
//         // const mutationAmount = (Math.random() - 0.5) * 5 * overlapAmount;
//         // item.time = Math.max(
//         //   lowerBound,
//         //   Math.min(upperBound, item.time + mutationAmount),
//         // );
//       }
//     }
//   }
//
//   return schedule;
// };
//
// export const evolveSchedule = (
//   schedule: TSchedule,
//   generations: number,
// ): TSchedule => {
//   for (let i = 0; i < generations; i++) {
//     schedule = mutateSchedule(schedule);
//   }
//
//   return schedule;
// };

//     scheduleDay.sort((a, b) => a.time - b.time);

const getOverlappingMinutes = (
  scheduleItem: TScheduleItem,
  scheduleDay: TScheduleDay,
): number => {
  let overlappingMinutes = 0;

  for (const otherItem of scheduleDay) {
    if (otherItem !== scheduleItem) {
      const aStart = scheduleItem.time;
      const aEnd = scheduleItem.time + scheduleItem.activity.duration;
      const bStart = otherItem.time;
      const bEnd = otherItem.time + otherItem.activity.duration;

      const intersectionStart = Math.max(aStart, bStart);
      const intersectionEnd = Math.min(aEnd, bEnd);

      const intersection = Math.max(0, intersectionEnd - intersectionStart);

      overlappingMinutes += intersection; /// otherItem.activity.duration;
    }
  }

  return overlappingMinutes;
};
