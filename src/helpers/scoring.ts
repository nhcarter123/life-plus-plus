import { TScheduleDay, TScheduleItem } from "./schedule";

export const closeToTime =
  (target: number) =>
  (item: TScheduleItem, day: TScheduleDay): number => {
    const difference =
      Math.abs(target - item.time) / (1440 - item.activity.duration);
    return difference;
  };
