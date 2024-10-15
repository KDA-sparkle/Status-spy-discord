const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config.json");

module.exports = {
  name: "pausemonitoring",
  description:
    "Pause la surveillance (logs enregistrés, mais pas de notifications).",
  async execute(message) {
    config.monitoringPaused = true;
    config.monitoringStopped = false; // S'assurer que stop est désactivé

    // Sauvegarder l'état de pause dans config.json
    fs.writeFileSync(
      path.join(__dirname, "../config.json"),
      JSON.stringify(config, null, 2)
    );

    // Envoyer un message pour confirmer la pause
    const embed = new EmbedBuilder()
      .setColor(0xffa500) // Orange pour indiquer la pause
      .setTitle("⏸️ Surveillance en pause")
      .setDescription(
        "La surveillance est en pause. Les logs continueront d'être enregistrés, mais les notifications sont suspendues."
      )
      .setFooter({
        text: `Commande exécutée par ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
