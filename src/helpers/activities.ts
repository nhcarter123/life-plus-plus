export type TActivity = {
  name: string;
  // scoringFunction: Function;
  order: number;
  frequency: number;
  // interval: number;
  duration: number;
  fixedTime?: number;
};

export interface IRuntimeActivity extends TActivity {
  charge: number;
}

export const activities: TActivity[] = [
  {
    name: "brush teeth morning",
    order: 1,
    frequency: 1,
    // interval: 24,
    duration: 10,
  },
  {
    name: "run",
    order: 2,
    frequency: 1,
    // interval: 24,
    duration: 30,
  },
  {
    name: "push-ups",
    order: 2,
    frequency: 1,
    // interval: 24,
    duration: 10,
  },
  {
    name: "shower",
    order: 3,
    frequency: 1,
    // interval: 24,
    duration: 10,
  },
  {
    name: "breakfast",
    order: 3,
    frequency: 1,
    // interval: 24,
    duration: 25,
  },
  {
    name: "groceries",
    order: 3,
    frequency: 0.25,
    // interval: 168,
    duration: 120,
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
    order: 4,
    frequency: 2,
    duration: 15,
  },
  {
    name: "work",
    order: 4,
    frequency: 5,
    // interval: 24,
    duration: 90,
  },
  {
    name: "dinner",
    order: 3,
    frequency: 1,
    // interval: 24,
    duration: 45,
  },
  {
    name: "brush teeth night",
    order: 5,
    frequency: 1,
    // interval: 24,
    duration: 10,
  },
];