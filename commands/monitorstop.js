const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config.json");

module.exports = {
  name: "monitorstop",
  description:
    "Arrête complètement la surveillance des utilisateurs (pas de logs, pas de notifications).",
  async execute(message) {
    config.monitoringStopped = true;
    config.monitoringPaused = false; // S'assurer que pause est désactivé

    // Sauvegarder l'état de surveillance dans config.json
    fs.writeFileSync(
      path.join(__dirname, "../config.json"),
      JSON.stringify(config, null, 2)
    );

    // Envoyer un message pour confirmer l'arrêt complet
    const embed = new EmbedBuilder()
      .setColor(0xff0000) // Rouge pour indiquer l'arrêt
      .setTitle("🛑 Surveillance complètement arrêtée")
      .setDescription(
        "La surveillance des utilisateurs a été arrêtée. Plus aucun log ni notification ne sera envoyé."
      )
      .setFooter({
        text: `Commande exécutée par ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
