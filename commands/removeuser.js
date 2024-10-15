const { EmbedBuilder } = require("discord.js");
const monitoringConfig = require("../config.json"); // Importer monitoringConfig depuis config.json
const fs = require("fs");
const path = require("path"); // Pour générer un chemin correct vers config.json

module.exports = {
  name: "removeuser",
  description: "Retirer un utilisateur de la surveillance.",
  async execute(message, args) {
    const userId = args[0];

    // Vérifier si un ID d'utilisateur a été fourni
    if (!userId) {
      const embedError = new EmbedBuilder()
        .setColor(0xff0000) // Rouge pour indiquer une erreur
        .setTitle("Erreur : ID d'utilisateur manquant")
        .setDescription("Veuillez fournir un ID d'utilisateur valide.")
        .setTimestamp();

      return message.channel.send({ embeds: [embedError] });
    }

    // Vérifier si l'utilisateur est surveillé
    const index = monitoringConfig.usersToMonitor.indexOf(userId);
    if (index > -1) {
      monitoringConfig.usersToMonitor.splice(index, 1); // Retirer l'utilisateur de la surveillance

      // Sauvegarder les modifications dans config.json
      fs.writeFileSync(
        path.join(__dirname, "../config.json"),
        JSON.stringify(monitoringConfig, null, 2)
      );

      const embedSuccess = new EmbedBuilder()
        .setColor(0x800080)
        .setTitle("Utilisateur retiré de la surveillance")
        .setDescription(
          `L'utilisateur avec l'ID **${userId}** a été retiré de la surveillance.`
        )
        .setFooter({
          text: `Commande exécutée par ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      message.channel.send({ embeds: [embedSuccess] });
    } else {
      const embedNotFound = new EmbedBuilder()
        .setColor(0xffa500) // Orange pour indiquer une alerte
        .setTitle("Utilisateur non surveillé")
        .setDescription(
          `L'utilisateur avec l'ID **${userId}** n'est pas dans la liste des utilisateurs surveillés.`
        )
        .setTimestamp();

      message.channel.send({ embeds: [embedNotFound] });
    }
  },
};
