const creatingCharacter = {};

async function handleCharacterMessage(client, message) {
  const userId = message.author.id;
  const db = client.db;

  if (creatingCharacter[userId]) {
    const step = creatingCharacter[userId].step;
    if (step === 1) {
      creatingCharacter[userId].name = message.content;
      message.reply("Ótimo! Agora envie uma imagem para o personagem.");
      creatingCharacter[userId].step = 2;
    } else if (step === 2 && message.attachments.size > 0) {
      const imageUrl = message.attachments.first().url;
      creatingCharacter[userId].image = imageUrl;
      message.reply(
        "Agora escolha um prefixo para falar como esse personagem. (Ex: vader:)"
      );
      creatingCharacter[userId].step = 3;
    } else if (step === 3) {
      let prefix = message.content;
      if (!prefix.endsWith(":")) {
        prefix += ":";
      }
      creatingCharacter[userId].prefix = prefix;

      await db.execute(
        "INSERT INTO personagens (user_id, nome, imagem, prefixo) VALUES (?, ?, ?, ?)",
        [
          userId,
          creatingCharacter[userId].name,
          creatingCharacter[userId].image,
          creatingCharacter[userId].prefix,
        ]
      );

      message.reply(
        `Personagem **${creatingCharacter[userId].name}** criado com sucesso! Use **${prefix}** para falar como ele.`
      );
      delete creatingCharacter[userId];
    }
    return;
  }

  const [rows] = await db.execute(
    "SELECT * FROM personagens WHERE user_id = ?",
    [userId]
  );
  for (const character of rows) {
    if (message.content.startsWith(character.prefix)) {
      const content = message.content.replace(character.prefix, "").trim();
      message.delete();
      message.channel.send({
        content: content,
        username: character.nome,
        avatarURL: character.imagem,
      });
      break;
    }
  }
}

module.exports = { handleCharacterMessage };
