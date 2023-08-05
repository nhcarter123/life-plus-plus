import React from "react";
import { evolveSchedule, randomSchedule } from "./helpers/schedule";
import { activities } from "./helpers/activities";
import { Box } from "@mui/material";
import { formatTimeFromMinutes } from "./helpers/time";
import { getRandomColor } from "./helpers/color";
import { Scrollbars } from "react-custom-scrollbars";

const randSchedule = randomSchedule(activities, 7);

const generations = 3000;
const mySchedule = evolveSchedule(randSchedule, generations);

function App() {
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
                          (100 * item.activity.duration) / 1440 - 0.3,
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
