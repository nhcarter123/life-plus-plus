import moment from "moment";

export const formatTimeFromMinutes = (minutes: number) => {
  if (minutes < 0 || minutes > 1440) {
    throw new Error('Invalid input. Minutes should be a number between 0 and 1440.');
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return moment({ hour: hours, minute: remainingMinutes }).format('h:mma');
}
