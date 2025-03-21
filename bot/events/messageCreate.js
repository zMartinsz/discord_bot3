const { handleCharacterMessage } = require("../handlers/characterHandler");

module.exports = {
  name: "messageCreate",
  async execute(client, message) {
    if (message.author.bot) return;
    await handleCharacterMessage(client, message);
  },
};
