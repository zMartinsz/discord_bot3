const { Collection } = require("discord.js");
const pool = require("../database");

const webhooksCache = new Collection();
const userProfilesCache = new Collection();

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return;

    try {
      // 🔹 Verifica o cache antes de buscar no banco
      let userProfiles = userProfilesCache.get(message.author.id);

      if (!userProfiles) {
        const [rows] = await pool.execute(
          "SELECT nome, gatilho, avatar_url FROM perfis WHERE usuario_id = ?",
          [message.author.id]
        );

        if (!rows.length) return;

        userProfilesCache.set(message.author.id, rows);
        userProfiles = rows;
      }

      // 🔹 Verifica se a mensagem corresponde a um gatilho
      const perfilUsado = userProfiles.find((p) =>
        message.content.startsWith(p.gatilho)
      );
      if (!perfilUsado) return;

      const conteudo = message.content.slice(perfilUsado.gatilho.length).trim();
      if (!conteudo) return;

      // 🔹 Obtém ou cria webhook no cache
      const webhookKey = `${message.channel.id}-${message.author.id}`;
      let webhook = webhooksCache.get(webhookKey);

      if (!webhook) {
        webhook = await message.channel.createWebhook({
          name: perfilUsado.nome,
          avatar: perfilUsado.avatar_url,
        });

        webhooksCache.set(webhookKey, webhook);
      } else {
        const webhookAvatar = webhook.avatar ? webhook.avatarURL() : null;
        if (
          webhook.name !== perfilUsado.nome ||
          webhookAvatar !== perfilUsado.avatar_url
        ) {
          await webhook.edit({
            name: perfilUsado.nome,
            avatar: perfilUsado.avatar_url,
          });
        }
      }

      // 🔹 Deleta a mensagem original e envia pelo webhook
      await Promise.allSettled([
        message.delete().catch(() => null),
        webhook.send({ content: conteudo }),
      ]);
    } catch (error) {
      console.error("❌ Erro no sistema de perfis:", error);
    }
  },
};
