const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const jwt_decode = require("jwt-decode");
const dbClient = require("./dbClient");

const cookieParser = require("cookie-parser");
const e = require("express");

app.use(
  cors({
    credentials: true,
    origin: [
      "chrome-extension://nifmagcilgcphmigilejmepnfmddnoom",
      "http://localhost:3001",
    ],
  })
);

app.use(
  express.json({
    limit: "10mb",
  })
);
app.use(cookieParser("secret"));

const port = 3000;

app.post("/insertSessionReq", async (req, res) => {
  if (req.body.userID && req.body.screenshotSRC) {
    try {
      userIDAsString = req.body.userID.toString();
      const sessionReqInfo = await dbClient.insertSessionRequest(
        userIDAsString,
        req.body.screenshotSRC
      );
      res.status(200).json({
        sessionRequest: {
          id: sessionReqInfo.id,
          userid: sessionReqInfo.userid,
          tabcaptureimg: sessionReqInfo.tabcaptureimg,
        },
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: "database error",
      });
    }
  } else {
    res.status(400).json({
      error: "userID and/or screenshot DNE",
    });
  }
});

app.get("/getSessionRequests", async (req, res) => {
  try {
    const sessionRequests = await dbClient.getSessionRequests();
    res.status(200).json({ sessionRequests });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "database error",
    });
  }
});

app.post("/activeSession", async (req, res) => {
  if (req.body.userID && req.body.screenshotSRC) {
    try {
      const sessionStarted = false;
      const sessionID = await dbClient.insertActiveSession(
        req.body.tutorID,
        req.body.userID,
        req.body.screenshotSRC,
        sessionStarted
      );
      res.status(200).json(sessionID[0]);
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: "database error",
      });
    }
  } else {
    res.status(400).json({
      error: "No Session Request",
    });
  }
});

app.post("/checkActiveSessions", async (req, res) => {
  try {
    userIDAsString = req.body.userID.toString();
    const session = await dbClient.checkActiveSessions(userIDAsString);
    if (!session) {
      res.status(400).json({
        error: "Active Session Not Found",
      });
    } else {
      res.status(200).json({ session });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "database error",
    });
  }
});

app.post("/startSession", (req, res) => {});

//Aside: assume all new users are students, need to figure out how tutors are assigned

app.post("/login", (req, res) => {
  console.log(req.body);
  const decoded = jwt_decode(req.body.idtoken);
  googleIdAsString = decoded.sub.toString();
  //google access (if i want to use later):
  //last name = decoded.family_name
  //picture = decoded.picture

  /* For students, if there is no associated account in the database, 
  create one with role "student"
  For tutors, if there is no associated account in the database do not permit login
  For both, if there is an associated account in the database, login */

  if (req.body.role === "student") {
    dbClient
      .getUserInfo(googleIdAsString)
      .then((user) => {
        if (!user) {
          console.log("Student not found in DB, creating new student user");
          dbClient
            .insertUserInfo(
              googleIdAsString,
              decoded.email,
              decoded.name,
              "student",
              decoded.given_name
            )
            .then(() => {
              res.cookie("userID", googleIdAsString, {
                signed: true,
              });

              res.status(200).json({
                authUser: {
                  id: googleIdAsString,
                  email: decoded.email,
                  name: decoded.name,
                  role: "student",
                  firstname: decoded.given_name,
                },
              });
            });
        } else {
          console.log("Student found in DB");
          res.cookie("userID", user.google_userid, {
            signed: true,
          });
          res.status(200).json({
            authUser: {
              id: user.google_userid,
              email: user.email,
              name: user.name,
              role: user.role,
              firstname: user.firstname,
            },
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: "database error",
        });
      });
  } else if (req.body.role === "tutor") {
    dbClient
      .getUserInfo(googleIdAsString)
      .then((user) => {
        if (!user || user.role !== "tutor") {
          console.log("Tutor not found in DB, not permitted to login");
          res.status(400).json({
            error: "NO TUTOR ACCOUNT FOUND",
          });
        } else {
          console.log("Tutor found in DB");
          res.cookie("userID", user.google_userid, {
            signed: true,
          });
          res.status(200).json({
            authUser: {
              id: user.google_userid,
              email: user.email,
              name: user.name,
              role: user.role,
              firstname: user.firstname,
            },
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: "database error",
        });
      });
  }
});

app.get("/auth", async (req, res) => {
  const user = await dbClient.getUserInfo(req.signedCookies.userID);
  if (!user) {
    res.status(400).json({
      error: "User not found",
    });
  } else {
    res.status(200).json({
      authUser: {
        id: user.google_userid,
        email: user.email,
        name: user.name,
        role: user.role,
        firstname: user.firstname,
      },
    });
  }
});

app.post("/setSessionStarted", async (req, res) => {
  try {
    const sessStarted = await dbClient.setSessionStarted(req.body.sessionID);
    res.status(200).json({
      confirmation: "session started",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "database error",
    });
  }
});

app.post("/checkSessionStarted", async (req, res) => {
  try {
    const session = await dbClient.checkSessionStarted(req.body.sessionID);
    if (!session) {
      res.status(400).json({
        error: "Session Not Started",
      });
    } else {
      res.status(200).json({ sessionstarted: session[0].sessionstarted });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "database error",
    });
  }
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

//SOCKET STUFF

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: "GET,POST",
  },
});

let usersConnected = 0;
let usersInRoom = 0;

io.on("connection", (socket) => {
  usersConnected++;
  console.log(`${usersConnected} users connected`);
  socket.emit("mySocketID", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
    usersConnected--;
    usersInRoom--;
    console.log(`${usersConnected} users connected`);
  });

  // socket.on("sessionStarted", (data) => {
  //   io.to(data.room).emit("sessStarted", {
  //     sessionStart: true,
  //   });
  // });

  socket.on("initiatorSignaling", (data) => {
    io.to(data.room).emit("tutorSignal", {
      signal: data.signalData,
    });
  });

  socket.on("nonInitiatorSignaling", (data) => {
    io.to(data.room).emit("studentSignal", {
      signal: data.signalData,
    });
  });

  socket.on("muteMe", (data) => {
    io.to(data.room).emit("muteME", {
      from: data.role,
    });
  });

  socket.on("joinroom", (roomNumber) => {
    socket.join(roomNumber);
    usersInRoom = io.sockets.adapter.rooms.get(roomNumber).size;
    console.log(usersInRoom + " in room " + roomNumber);
    socket.emit("getUsersInRoom", usersInRoom);
  });

  socket.on("newLineSegment", (data) => {
    io.to(data.room).emit("newLines", {
      lineSegment: data.lineSeg,
      lineSize: data.lineSize,
      type: data.type,
      from: data.from,
    });
  });

  socket.on("endLineSegment", (data) => {
    io.to(data.room).emit("endLineSeg", {
      from: data.from,
      line: data.line,
    });
  });

  socket.on("undoLast", (data) => {
    io.to(data.room).emit("undoLast", {
      from: data.from,
    });
  });

  socket.on("redoLast", (data) => {
    io.to(data.room).emit("redoLast", {
      from: data.from,
      redoObj: data.redoObj,
    });
  });

  socket.on("clearCanvas", (data) => {
    io.to(data.room).emit("clearCanv", {
      from: data.from,
    });
  });
});

server.listen(5000, () => {
  console.log("listening on port " + 5000);
});
