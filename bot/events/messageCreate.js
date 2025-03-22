const { WebhookClient, Collection } = require("discord.js");
const pool = require("../database");

const webhooksCache = new Collection(); // Cache de webhooks por canal/usuário
const userProfilesCache = new Collection(); // Cache de perfis por usuário

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return; // Ignora mensagens de bots

    try {
      // 🔹 Busca perfis do usuário no cache ou banco de dados
      let userProfiles = userProfilesCache.get(message.author.id);

      if (!userProfiles) {
        const [rows] = await pool.execute(
          "SELECT nome, gatilho, avatar_url FROM perfis WHERE usuario_id = ?",
          [message.author.id]
        );

        if (rows.length === 0) return; // Nenhum perfil encontrado

        userProfilesCache.set(message.author.id, rows);
        userProfiles = rows;
      }

      // 🔹 Verifica se a mensagem começa com algum dos gatilhos cadastrados
      const perfilUsado = userProfiles.find((perfil) =>
        message.content.startsWith(perfil.gatilho)
      );

      if (!perfilUsado) return; // Se não encontrar um gatilho, ignora

      const conteudo = message.content.slice(perfilUsado.gatilho.length).trim();
      if (!conteudo) return; // Evita mensagens vazias

      console.log(
        `🔹 Mensagem detectada com o perfil "${perfilUsado.nome}": ${conteudo}`
      );

      // 🔹 Gerencia webhooks no cache para evitar duplicações
      const webhookKey = `${message.channel.id}-${message.author.id}`;
      let webhook = webhooksCache.get(webhookKey);

      if (!webhook) {
        console.log(`🛠️ Criando webhook para ${perfilUsado.nome}...`);

        webhook = await message.channel.createWebhook({
          name: perfilUsado.nome,
          avatar: perfilUsado.avatar_url,
        });

        webhooksCache.set(webhookKey, webhook);
      } else {
        // Atualiza nome e avatar apenas se forem diferentes do perfil salvo
        if (
          webhook.name !== perfilUsado.nome ||
          webhook.avatar !== perfilUsado.avatar_url
        ) {
          console.log(`🔄 Atualizando webhook de ${perfilUsado.nome}...`);
          await webhook.edit({
            name: perfilUsado.nome,
            avatar: perfilUsado.avatar_url,
          });
        }
      }

      // 🔹 Exclui a mensagem original e envia pelo webhook
      await Promise.all([
        message
          .delete()
          .catch((error) =>
            console.error("❌ Erro ao apagar a mensagem:", error)
          ),
        webhook.send({ content: conteudo }),
      ]);
    } catch (error) {
      console.error("❌ Erro no sistema de perfis:", error);
    }
  },
};
