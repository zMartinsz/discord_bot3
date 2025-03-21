const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const filePath = path.join(__dirname, "../database/perfis.json");
const avatarsPath = path.join(__dirname, "../database/avatars");

// Criar os diretórios necessários se não existirem
if (!fs.existsSync(path.dirname(filePath))) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}
if (!fs.existsSync(avatarsPath)) {
  fs.mkdirSync(avatarsPath, { recursive: true });
}

// Garantir que o arquivo perfis.json existe e está correto
let perfis = [];
try {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(filePath, "utf-8").trim();
  perfis = data ? JSON.parse(data) : [];
} catch (error) {
  console.error("❌ JSON corrompido! Reiniciando arquivo...");
  perfis = [];
  fs.writeFileSync(filePath, JSON.stringify(perfis, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("criarperfil")
    .setDescription("Cria um perfil para usar como personagem")
    .addStringOption((option) =>
      option
        .setName("nome")
        .setDescription("Nome do personagem")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("gatilho")
        .setDescription("Palavra-chave para ativar o personagem")
        .setRequired(true)
    )
    .addAttachmentOption((option) =>
      option
        .setName("avatar")
        .setDescription("Imagem do avatar")
        .setRequired(true)
    ),

  async execute(interaction) {
    console.log("✅ Comando criarperfil recebido!");

    const nome = interaction.options.getString("nome");
    let gatilho = interaction.options.getString("gatilho");
    const avatarAttachment = interaction.options.getAttachment("avatar");

    console.log(
      `📌 Nome: ${nome}, Gatilho: ${gatilho}, Avatar: ${avatarAttachment?.url}`
    );

    // Garantir que o gatilho sempre termine com ":"
    if (!gatilho.endsWith(":")) {
      gatilho += ":";
    }

    // Verificar se o gatilho já existe
    if (perfis.some((p) => p.gatilho.toLowerCase() === gatilho.toLowerCase())) {
      console.log(`⚠️ Gatilho já existe: ${gatilho}`);
      return interaction.reply(`⚠️ O gatilho **${gatilho}** já está em uso!`);
    }

    // Baixar e salvar a imagem localmente
    const avatarFileName = `${interaction.user.id}_${Date.now()}.png`;
    const avatarPath = path.join(avatarsPath, avatarFileName);

    try {
      console.log("📡 Baixando imagem do avatar...");

      if (!avatarAttachment || !avatarAttachment.url) {
        console.error("❌ Erro: Nenhuma imagem foi anexada.");
        return interaction.reply(
          "❌ Você precisa anexar uma imagem ao comando."
        );
      }

      const response = await axios.get(avatarAttachment.url, {
        responseType: "arraybuffer",
      });

      if (response.status !== 200) {
        console.error(`❌ Erro ao baixar a imagem: Status ${response.status}`);
        return interaction.reply(
          "❌ Ocorreu um erro ao baixar a imagem do avatar."
        );
      }

      fs.writeFileSync(avatarPath, Buffer.from(response.data));
      console.log("✅ Imagem salva:", avatarPath);
    } catch (error) {
      console.error("❌ Erro ao baixar a imagem:", error);
      return interaction.reply(
        "❌ Ocorreu um erro ao processar a imagem do avatar."
      );
    }

    // Criar novo perfil
    const novoPerfil = {
      nome,
      gatilho,
      avatar: avatarFileName,
      usuario: interaction.user.id,
    };
    perfis.push(novoPerfil);

    // Salvar no arquivo
    try {
      fs.writeFileSync(filePath, JSON.stringify(perfis, null, 2));
      console.log("✅ Perfil salvo no arquivo!");
    } catch (error) {
      console.error("❌ Erro ao salvar o perfil:", error);
      return interaction.reply("❌ Ocorreu um erro ao salvar o perfil.");
    }

    // Responder ao usuário
    await interaction.reply({
      content: `✅ Perfil **${nome}** criado! Use \`${gatilho} mensagem\` para ativá-lo.`,
      files: [new AttachmentBuilder(avatarPath)],
    });

    console.log(`✅ Perfil criado: ${nome} (${gatilho})`);
  },
};
