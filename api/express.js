const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const dbClient = require("./dbClient");

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

const port = 3000;

app.post("/insertSessionReq", (req, res) => {
  if (req.body.userID && req.body.screenshotSRC) {
    dbClient
      .insertSessionRequest(req.body.userID, req.body.screenshotSRC)
      .then((response) => {
        res.status(200).json({
          sessionRequest: {
            id: response.id,
            userid: response.userid,
            tabcaptureimg: response.tabcaptureimg,
          },
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: "database error",
        });
      });
  } else {
    res.status(400).json({
      error: "userID and/or screenshot DNE",
    });
  }
});

app.get("/getSessionRequests", (req, res) => {
  dbClient
    .getSessionRequests()
    .then((requests) => {
      res.status(200).json({ requests });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: "database error",
      });
    });
});

app.post("/activeSession", (req, res) => {
  if (req.body.userID && req.body.screenshotSRC) {
    dbClient
      .insertActiveSession(
        req.body.tutorID,
        req.body.userID,
        req.body.screenshotSRC
      )
      .then((resy) => {
        res.status(200).json(resy[0]);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: "database error",
        });
      });
  } else {
    res.status(400).json({
      error: "No Session Request",
    });
  }
});

app.post("/checkActiveSessions", (req, res) => {
  dbClient
    .checkActiveSessions(req.body.userID)
    .then((session) => {
      if (!session) {
        res.status(400).json({
          error: "Active Session Not Found",
        });
      } else {
        res.status(200).json({ session });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: "database error",
      });
    });
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

  socket.on("connectPeers", (data) => {
    io.to(data.room).emit("connectPeerz", {
      signal: data.signalData,
    });
  });

  socket.on("connectPeers2", (data) => {
    io.to(data.room).emit("connectPeers2", {
      signal: data.signalData,
    });
  });

  socket.on("joinroom", (roomNumber) => {
    socket.join(roomNumber);
    usersInRoom = io.sockets.adapter.rooms.get(roomNumber).size;
    console.log(usersInRoom + " in room " + roomNumber);
    socket.emit("getUsersInRoom", usersInRoom);
  });
});

server.listen(5000, () => {
  console.log("listening on port " + 5000);
});
