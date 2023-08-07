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

const config = {
  clientId,
  apiKey,
  scope: "https://www.googleapis.com/auth/calendar",
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  ],
};

const apiCalendar = new ApiCalendar(config);

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

  const fetchEvents = () => {
    apiCalendar.listCalendars().then((data: any) => {
      setCalendarIds(data.result.items.map((item: any) => item.id));
      apiCalendar
        .listEvents({
          calendarId: "primary",
          timeMin: moment().startOf("day").toISOString(),
          timeMax: moment().startOf("day").add(7, "days").toISOString(),
          singleEvents: true,
        })
        .then((data: any) => {
          // console.log(data); // list of events
          const importedActivities = data.result.items
            .filter(
              (item: any) =>
                item.attendees &&
                item.attendees.some(
                  (attendee: any) =>
                    attendee.self && attendee.responseStatus === "accepted",
                ),
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
                immovable: true,
                countTowardsWorkHours: true,
                fixedDay,
              };

              return newActivity;
            })
            .filter((v: TActivity) => v);

          console.log(importedActivities); // activities
          setImportedActivities(importedActivities);
        });
    });
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
        <button onClick={() => fetchEvents()}>fetch</button>
        <button onClick={() => regenerateSchedule()}>regenerate</button>
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
                          {/*{item.activity.overlap}*/}
                        </Box>
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
