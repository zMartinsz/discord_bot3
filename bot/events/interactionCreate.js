const { handleInteraction } = require("../handlers/interactionHandler");

module.exports = {
  name: "interactionCreate",
  async execute(client, interaction) {
    if (interaction.isCommand()) {
      await handleInteraction(client, interaction);
    }
  },
};
