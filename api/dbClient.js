const { Client } = require("pg");
const format = require("pg-format");

const dbClient = new Client({
  user: "postgres",
  host: "127.0.0.1",
  database: "InstantTutor",
  password: "Yosemite2001!",
  port: 5432,
});

dbClient.connect();

const insertSessionRequest = (userID, scrshtUrl) => {
  return dbClient
    .query(
      `INSERT INTO sessionrequests (userid, tabcaptureimg) VALUES ($1, $2) RETURNING id, userid, tabcaptureimg`,
      [userID, scrshtUrl]
    )
    .then((res) => {
      return res.rows[0];
    });
};

const getSessionRequests = () => {
  return dbClient
    .query(`SELECT userid, tabcaptureimg, id FROM sessionrequests`)
    .then((res) => {
      return res.rows;
    });
};

const getActiveSessionID = (scrshtUrl) => {
  return dbClient
    .query(`SELECT id FROM activesessions WHERE tabcaptureimg = ($1)`, [
      scrshtUrl,
    ])
    .then((res) => {
      return res.rows;
    });
};

const insertActiveSession = (tutorID, studentID, scrshtUrl) => {
  return dbClient
    .query(
      `INSERT INTO activesessions (tutorid, studentid, tabcaptureimg) VALUES ($1, $2, $3)`,
      [tutorID, studentID, scrshtUrl]
    )
    .then((res) => {
      return getActiveSessionID(scrshtUrl);
    });
};

const checkActiveSessions = (studentID) => {
  return dbClient
    .query(`SELECT id FROM activesessions WHERE studentid = ($1)`, [studentID])
    .then((res) => {
      return res.rows;
    });
};

module.exports = {
  insertSessionRequest,
  getSessionRequests,
  getActiveSessionID,
  insertActiveSession,
  checkActiveSessions,
};
