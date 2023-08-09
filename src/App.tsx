import React, { useEffect, useState } from "react";
import { createSchedule } from "./helpers/schedule";
import { activities, TActivity } from "./helpers/activities";
import { Box } from "@mui/material";
import {
  formatTimeFromMinutes,
  getDayUntilDateTime,
  getMinutesFromStartOfDay,
} from "./helpers/time";
import { getRandomColor } from "./helpers/color";
import { Scrollbars } from "react-custom-scrollbars";
import ApiCalendar from "react-google-calendar-api";
import moment from "moment";

const apiKey = "AIzaSyBSXgq-2Q4V1gQHZVgbkkOrpfEzSbmqmaE";
const clientId =
  "1072546203896-te1e08cgcsuvmjjrt4lk1t18vindfdap.apps.googleusercontent.com";
const clientSecret = "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";
const personalCalendarId =
  "c_4f42dcc850e6f70e3ff9f1184a6994c8482ac8c2471d85ed95c7f875d7860771@group.calendar.google.com";
const primaryCalendarId = "primary";

const config = {
  clientId,
  apiKey,
  scope: "https://www.googleapis.com/auth/calendar",
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  ],
};

const apiCalendar = new ApiCalendar(config);

type TCalendarEvent = {
  summary: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  // attendees: { email: string }[];
};

// const randSchedule = randomSchedule(activities, 7);
//
// const generations = 300;
// const mySchedule = evolveSchedule(randSchedule, generations);

function App() {
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [calendarIds, setCalendarIds] = useState<string[]>([]);
  const [importedActivities, setImportedActivities] = useState<TActivity[]>([]);
  const [mySchedule, setMySchedule] = useState(createSchedule(activities, 7));

  // console.log(apiCalendar.sign);
  // console.log(apiCalendar.sign);
  // apiCalendar.onLoad(() => {
  //   console.log("here1");
  // });

  // useEffect(() => {
  //   if (signedIn) {
  //
  //   }
  // }, [signedIn]);

  const createEvent = (event: TCalendarEvent) =>
    apiCalendar
      .createEvent(event as any, personalCalendarId)
      .then((result: any) => {
        console.log(result);
      })
      .catch((res: any) => {
        console.log(res.result.error.code);
        console.log(res.result.error.message);
      });

  const fetchEvents = (calendarId: string): Promise<TActivity[]> =>
    new Promise((resolve) =>
      apiCalendar
        .listCalendars()
        .then((data: any) => {
          setCalendarIds(data.result.items.map((item: any) => item.id));
          apiCalendar
            .listEvents({
              calendarId,
              timeMin: moment().startOf("day").toISOString(),
              timeMax: moment().startOf("day").add(7, "days").toISOString(),
              singleEvents: true,
            })
            .then((data: any) => {
              // console.log(data); // list of events
              const importedActivities = data.result.items
                .filter(
                  (item: any) =>
                    (item.attendees &&
                      item.attendees.some(
                        (attendee: any) =>
                          attendee.self &&
                          attendee.responseStatus === "accepted",
                      )) ||
                    calendarId === personalCalendarId,
                )
                .map((item: any) => {
                  // console.log(item); // event object

                  const start = getMinutesFromStartOfDay(
                    item.start.dateTime,
                    item.start.timeZone,
                  );
                  const end = getMinutesFromStartOfDay(
                    item.end.dateTime,
                    item.end.timeZone,
                  );
                  // console.log(item);

                  if (!item.start.timeZone) {
                    console.log(item);
                    return;
                  }

                  const fixedDay = getDayUntilDateTime(
                    item.start.dateTime,
                    item.start.timeZone,
                  );

                  const newActivity: TActivity = {
                    fixedTime: start,
                    duration: end - start,
                    name: item.summary,
                    frequency: 0,
                    order: 0,
                    fromWorkCalendar: true,
                    countTowardsWorkHours: true,
                    fixedDay,
                  };

                  return newActivity;
                })
                .filter((v: TActivity) => v);

              // console.log(importedActivities); // activities
              resolve(importedActivities);
            });
        })
        .catch((res: any) => {
          console.log(res.result.error.code);
          console.log(res.result.error.message);
        }),
    );

  const uploadSchedule = async () => {
    fetchEvents(personalCalendarId).then(async (existingEvents) => {
      console.log(existingEvents);
      const newEvents = mySchedule.map((day, dayIndex) => {
        return day
          .filter(
            (item) =>
              !item.activity.fromWorkCalendar &&
              existingEvents.every(
                (event) =>
                  event.name !== item.activity.name ||
                  event.fixedTime !== item.time,
              ),
          )
          .map((item, index) => {
            const startDateTime = moment()
              .startOf("day")
              .add(dayIndex, "days")
              .add(item.time, "minutes")
              .toISOString();
            const endDateTime = moment()
              .startOf("day")
              .add(dayIndex, "days")
              .add(item.time + item.activity.duration, "minutes")
              .toISOString();
            return {
              summary: item.activity.name,
              start: {
                dateTime: startDateTime,
                timeZone: "America/Chicago",
              },
              end: {
                dateTime: endDateTime,
                timeZone: "America/Chicago",
              },
              // attendees: [
              //   {
              //     email: "ncarter@pathpoint.com",
              //   },
              // ],
            };
          });
      });
      console.log(newEvents);

      let count = 0;
      for (const day of newEvents) {
        for (const item of day) {
          await createEvent(item);
        }
      }
    });

    // apiCalendar.listCalendars().then((data: any) => {
    //   console.log(data);
    // });
  };

  const regenerateSchedule = () => {
    setMySchedule(createSchedule([...activities, ...importedActivities], 7));
  };

  // const resp = apiCalendar.listCalendars().then((data: any) => {
  //   console.log(data);
  // });

  return (
    <Box
      className="App"
      display={"flex"}
      alignItems={"center"}
      justifyContent={"center"}
      width={"100%"}
      height={"100%"}
      color={"white"}
    >
      <Box>
        <Box>Test</Box>
        <button onClick={() => apiCalendar.handleAuthClick()}>sign-in</button>
        <button onClick={() => apiCalendar.handleSignoutClick()}>
          sign-out
        </button>
        <button
          onClick={() =>
            fetchEvents(primaryCalendarId).then(setImportedActivities)
          }
        >
          fetch
        </button>
        <button onClick={() => regenerateSchedule()}>regenerate</button>
        <button onClick={() => uploadSchedule()}>upload</button>
      </Box>

      <Scrollbars style={{ width: "100%", height: "100%" }}>
        <Box display={"flex"} height={"100%"} justifyContent={"center"}>
          {mySchedule.map((day, index) => {
            return (
              <Box
                key={index}
                m={0.5}
                p={1}
                position={"relative"}
                sx={{
                  width: 200,
                  height: 2000,
                  background: "#706d6d",
                }}
              >
                {day.map((item, index) => {
                  return (
                    <Box
                      key={index}
                      mx={1}
                      sx={{
                        // display:'flex',
                        // alignItems: 'center',
                        fontSize: 12,
                        borderRadius: "4px",
                        border: "2px solid",
                        // background: '#6198c5',
                        background: getRandomColor(item.activity.name),
                        borderColor: "#231e1e",
                        position: "absolute",
                        // width: 300,
                        minWidth: "70%",
                        minHeight: `${Math.max(
                          (100 * item.activity.duration) / 1440 - 0.2,
                          0.7,
                        )}%`,
                        // top: 3.5 * item.time - 1400,
                        top: `${(100 * item.time) / 1440}%`,
                        left: index % 2 === 0 ? 0 : "",
                        right: index % 2 === 1 ? 0 : "",
                        boxShadow:
                          "rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -10px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;",
                      }}
                    >
                      <Box mx={1} display={"flex"}>
                        <Box
                          sx={{
                            lineHeight: "15px",
                          }}
                        >
                          {item.activity.name}
                        </Box>
                        <Box
                          mx={1}
                          sx={{
                            lineHeight: "15px",
                          }}
                        >
                          -
                        </Box>
                        <Box
                          sx={{
                            lineHeight: "15px",
                          }}
                        >
                          {formatTimeFromMinutes(item.time)}
                        </Box>
                        {/*<Box*/}
                        {/*  mx={1}*/}
                        {/*  sx={{*/}
                        {/*    lineHeight: "15px",*/}
                        {/*  }}*/}
                        {/*>*/}
                        {/*  -*/}
                        {/*</Box>*/}
                        {/*<Box*/}
                        {/*  sx={{*/}
                        {/*    lineHeight: "15px",*/}
                        {/*  }}*/}
                        {/*>*/}
                        {/*  {formatTimeFromMinutes(*/}
                        {/*    item.time + item.activity.duration,*/}
                        {/*  )}*/}
                        {/*</Box>*/}
                      </Box>

                      {/*<Box>{item.time}</Box>*/}
                      {/*<Box>{item.activity.duration}</Box>*/}
                    </Box>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      </Scrollbars>
    </Box>
  );
}

export default App;
