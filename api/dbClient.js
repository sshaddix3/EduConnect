const { Client } = require("pg");
const format = require("pg-format");

const dbClient = new Client({
  user: "postgres",
  host: "127.0.0.1",
  database: "InstantTutor",
  password: "sshaddix",
  port: 5432,
});

dbClient.connect();

//
const getUserInfo = (userID) => {
  return dbClient
    .query(
      `SELECT google_userid, email, name, role, firstname FROM users WHERE google_userid = ($1)`,
      [userID]
    )
    .then((res) => {
      return res.rows[0];
    });
};

const insertUserInfo = (userID, email, name, role, firstname) => {
  return dbClient
    .query(
      `INSERT INTO users (google_userid, email, name, role, firstname) VALUES ($1, $2, $3, $4, $5)`,
      [userID, email, name, role, firstname]
    )
    .then((res) => {
      return res.rows;
    });
};

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

const insertActiveSession = (tutorID, studentID, scrshtUrl, sessionStarted) => {
  return dbClient
    .query(
      `INSERT INTO activesessions (tutorid, studentid, tabcaptureimg, sessionstarted) VALUES ($1, $2, $3, $4)`,
      [tutorID, studentID, scrshtUrl, sessionStarted]
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

const setSessionStarted = (sessionID) => {
  return dbClient
    .query(`UPDATE activesessions SET sessionstarted = true WHERE id = ($1)`, [
      sessionID,
    ])
    .then((res) => {
      return res.rows;
    });
};

const checkSessionStarted = (sessionID) => {
  return dbClient
    .query(`SELECT sessionstarted FROM activesessions WHERE id = ($1)`, [
      sessionID,
    ])
    .then((res) => {
      return res.rows;
    });
};

module.exports = {
  getUserInfo,
  insertUserInfo,
  insertSessionRequest,
  getSessionRequests,
  getActiveSessionID,
  insertActiveSession,
  checkActiveSessions,
  setSessionStarted,
  checkSessionStarted,
};
