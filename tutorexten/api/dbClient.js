const { Client } = require("pg");
const format = require("pg-format");

const dbClient = new Client({
  user: "postgres",
  host: "127.0.0.1",
  database: "InstantTutor",
  password: "******",
  port: 5432,
});

dbClient.connect();

function insertSessionRequest(userID, scrshtUrl) {
  return dbClient.query(
    `INSERT INTO sessionrequests (userid, tabcaptureimg) VALUES ($1, $2)`,
    [userID, scrshtUrl]
  );
}

module.exports = {
  insertSessionRequest,
};
