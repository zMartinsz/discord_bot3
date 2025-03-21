const fs = require("fs");
const path = require("path");

function loadEvents(client) {
  const eventFiles = fs
    .readdirSync(__dirname)
    .filter((file) => file.endsWith(".js") && file !== "index.js");

  for (const file of eventFiles) {
    const event = require(path.join(__dirname, file));
    client.on(event.name, (...args) => event.execute(client, ...args));
  }
}

module.exports = { loadEvents };
