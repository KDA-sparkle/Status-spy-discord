const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config.json");

module.exports = {
  name: "resumemonitoring",
  description: "Reprend l'envoi des notifications en plus des logs.",
  async execute(message) {
    config.monitoringPaused = false;
    config.monitoringStopped = false;

    // Sauvegarder l'état de reprise dans config.json
    fs.writeFileSync(
      path.join(__dirname, "../config.json"),
      JSON.stringify(config, null, 2)
    );

    // Envoyer un message pour confirmer la reprise
    const embed = new EmbedBuilder()
      .setColor(0x00ff00) // Vert pour indiquer la reprise
      .setTitle("▶️ Surveillance reprise")
      .setDescription(
        "Les notifications et les logs de surveillance seront à nouveau envoyés."
      )
      .setFooter({
        text: `Commande exécutée par ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
