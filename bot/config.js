require("dotenv").config(); // Carregar as variáveis do .env

module.exports = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
};
