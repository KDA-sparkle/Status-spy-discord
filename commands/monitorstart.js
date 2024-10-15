const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config.json");

module.exports = {
  name: "monitorstart",
  description:
    "Relance la surveillance complète des utilisateurs (logs et notifications).",
  async execute(message) {
    config.monitoringStopped = false;
    config.monitoringPaused = false;

    // Sauvegarder l'état de surveillance dans config.json
    fs.writeFileSync(
      path.join(__dirname, "../config.json"),
      JSON.stringify(config, null, 2)
    );

    // Envoyer un message pour confirmer le redémarrage complet
    const embed = new EmbedBuilder()
      .setColor(0x00ff00) // Vert pour indiquer le démarrage
      .setTitle("✅ Surveillance redémarrée")
      .setDescription(
        "La surveillance des utilisateurs a été relancée. Les logs et notifications seront envoyés."
      )
      .setFooter({
        text: `Commande exécutée par ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
