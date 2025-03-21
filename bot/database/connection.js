const mysql = require("mysql2/promise");
const config = require("../config");

async function createConnection() {
  return await mysql.createConnection(config.DB_LINK);
}

module.exports = { createConnection };
