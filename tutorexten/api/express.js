const express = require("express");
const cors = require("cors");
const dbClient = require("./dbClient");

const app = express();
app.use(
  cors({
    credentials: true,
    origin: "chrome-extension://nifmagcilgcphmigilejmepnfmddnoom",
  })
);

app.use(
  express.json({
    limit: "10mb",
  })
);

const port = 3000;

app.post("/scr", (req, res) => {
  dbClient.insertSessionRequest(req.body.userID, req.body.screenshotSRC);
  res.status(200).json({
    id: req.body.userID,
    img: req.body.screenshotSRC,
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
