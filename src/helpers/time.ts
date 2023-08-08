import moment from "moment";
import momentTimezone from "moment-timezone";

export const formatTimeFromMinutes = (minutes: number) => {
  if (minutes < 0 || minutes > 1440) {
    console.log(
      "Invalid input. Minutes should be a number between 0 and 1440.",
    );
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return moment({ hour: hours, minute: remainingMinutes }).format("h:mma");
};

export const getMinutesFromStartOfDay = (
  dateTimeString: string,
  timeZone: string,
) => {
  const dateTime = momentTimezone(
    dateTimeString,
    "YYYY-MM-DDTHH:mm:ssZ",
    timeZone,
  );
  const startOfDay = dateTime.clone().startOf("day");
  return dateTime.diff(startOfDay, "minutes");
};

export const getDayUntilDateTime = (
  dateTimeString: string,
  timeZone: string,
) => {
  // const today = momentTimezone().tz(timeZone).startOf("day");
  // const dateTime = momentTimezone(
  //   dateTimeString,
  //   "YYYY-MM-DDTHH:mm:ssZ",
  //   timeZone,
  // );
  // return dateTime.startOf("day").diff(today, "days");

  const today = momentTimezone().tz(timeZone).startOf("day");
  const dateTime = momentTimezone(dateTimeString, "YYYY-MM-DDTHH:mm:ssZ").tz(
    timeZone,
  );
  const diffInMilliseconds = dateTime.diff(today);
  const diffInDays = Math.floor(diffInMilliseconds / (24 * 60 * 60 * 1000));
  return diffInDays;
};
