import {
  sleepDuration,
  TScheduleDay,
  TScheduleItem,
  wakeUpTime,
} from "./schedule";
import { shuffle } from "./color";
import { closeToTime } from "./scoring";

export type TActivity = {
  name: string;
  scoringFunction?: (item: TScheduleItem, day: TScheduleDay) => number;
  targetTime?: number;
  order: number;
  cooldown?: number;
  frequency: number;
  // interval: number;
  duration: number;
  fixedTime?: number;
  fixedDay?: number;
  overlap?: number;
  isExercise?: boolean;
  isWork?: boolean;
  rewardForWorking?: boolean;
  weekdayOnly?: boolean;
  weekendOnly?: boolean;
  minimumTimeSpentThere?: number;
  isInPublic?: boolean;
  fromWorkCalendar?: boolean;
  countTowardsWorkHours?: boolean;
  isWorkFiller?: boolean;
};

export interface IRuntimeActivity extends TActivity {
  charge: number;
  lastActivated?: number;
}

export const activities: TActivity[] = [
  {
    name: "brush teeth morning",
    order: 1,
    frequency: 1,
    // interval: 24,
    duration: 10,
    fixedTime: wakeUpTime + 10,
  },
  {
    name: "run",
    order: 2,
    frequency: 1,
    // interval: 24,
    duration: 30,
    isExercise: true,
    targetTime: 6.75 * 60,
  },
  {
    name: "look at phone",
    order: 1,
    cooldown: 180,
    frequency: 3,
    duration: 10,
    rewardForWorking: true,
  },
  {
    name: "push-ups",
    order: 2,
    frequency: 1,
    // interval: 24,
    duration: 10,
    isExercise: true,
  },
  {
    name: "shower",
    order: 3,
    frequency: 1,
    // interval: 24,
    duration: 10,
  },
  {
    name: "packing",
    order: 1,
    frequency: 1,
    duration: 30,
  },
  {
    name: "breakfast",
    order: 6,
    frequency: 1,
    // interval: 24,
    // targetTime: 8.5 * 60,
    // scoringFunction: closeToTime(8.5 * 60),
    duration: 25,
  },
  {
    name: "groceries",
    order: 8,
    frequency: 0.2,
    // interval: 168,
    duration: 100,
  },
  {
    name: "lunch",
    order: 3,
    frequency: 1,
    // interval: 24,
    duration: 45,
    fixedTime: 12 * 60,
  },
  {
    name: "watch french video",
    order: 99,
    frequency: 2,
    duration: 15,
    cooldown: 120,
    rewardForWorking: true,
  },
  {
    name: "respond to texts",
    order: 6,
    frequency: 1,
    duration: 10,
  },
  {
    name: "work focus time",
    order: 7,
    frequency: 8,
    // interval: 24,
    duration: 60,
    isWork: true,
    weekdayOnly: true,
    countTowardsWorkHours: true,
    isWorkFiller: true,
  },
  {
    name: "laundry",
    order: 7,
    frequency: 1 / 7,
    duration: 15,
    isWork: true,
  },
  {
    name: "dishes",
    order: 9,
    frequency: 1 / 7,
    duration: 15,
    isWork: true,
  },
  {
    name: "dryer",
    order: 8,
    frequency: 1 / 7,
    duration: 10,
    isWork: true,
  },
  {
    name: "disc golf",
    order: 4,
    frequency: 1 / 7,
    duration: 120,
    isWork: true,
    weekendOnly: true,
  },
  {
    name: "drive to cafe",
    order: 5,
    frequency: 1,
    duration: 10,
    weekdayOnly: true,
    minimumTimeSpentThere: 120,
    isInPublic: true,
  },
  {
    name: "dinner",
    order: 30,
    frequency: 1,
    // interval: 24,
    // scoringFunction: closeToTime(19 * 60),
    // targetTime: 19 * 60,
    fixedTime: 19.5 * 60,
    duration: 45,
  },
  {
    name: "brush teeth night",
    order: 5,
    frequency: 1,
    // interval: 24,
    duration: 10,
    fixedTime: 1440 - (sleepDuration - wakeUpTime) - 10,
  },
];
// shuffle(activities);

// Dynamic fill remaining time
// Order customizer - order - no order - random order
// Activity editor
