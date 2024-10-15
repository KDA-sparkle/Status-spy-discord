const { EmbedBuilder } = require("discord.js");
const monitoringConfig = require("../config.json");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "setnotifyuser",
  description:
    "Configurer l'utilisateur à notifier en DM lorsqu'un statut change.",
  async execute(message, args) {
    const userId = args[0];

    // Vérifier si un ID d'utilisateur a été fourni
    if (!userId) {
      const embedError = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Erreur : ID d'utilisateur manquant")
        .setDescription("Veuillez fournir un ID d'utilisateur valide.")
        .setTimestamp();

      return message.channel.send({ embeds: [embedError] });
    }

    // Enregistrer l'utilisateur à notifier dans la configuration
    monitoringConfig.notifyUserId = userId;

    // Sauvegarder les modifications dans config.json
    fs.writeFileSync(
      path.join(__dirname, "../config.json"),
      JSON.stringify(monitoringConfig, null, 2)
    );

    // Créer un embed pour confirmer le changement de l'utilisateur à notifier
    const embedSuccess = new EmbedBuilder()
      .setColor(0x800080)
      .setTitle("Utilisateur à notifier défini")
      .setDescription(
        `Les notifications seront envoyées à l'utilisateur **${userId}**.`
      )
      .setFooter({
        text: `Commande exécutée par ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    message.channel.send({ embeds: [embedSuccess] });
  },
};
