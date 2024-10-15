const { EmbedBuilder } = require("discord.js");
const monitoringConfig = require("../config.json"); // Importer la configuration
const fs = require("fs");
const path = require("path"); // Pour générer un chemin correct vers config.json

module.exports = {
  name: "adduser",
  description: "Ajouter un utilisateur à surveiller.",
  async execute(message, args) {
    const userId = args[0];

    // Vérifier si un ID d'utilisateur a été fourni
    if (!userId) {
      return message.reply("Veuillez fournir un ID d'utilisateur.");
    }

    // Vérifier si l'utilisateur est déjà surveillé
    if (!monitoringConfig.usersToMonitor.includes(userId)) {
      monitoringConfig.usersToMonitor.push(userId); // Ajouter l'utilisateur à la liste de surveillance

      // Sauvegarder les modifications dans config.json
      fs.writeFileSync(
        path.join(__dirname, "../config.json"),
        JSON.stringify(monitoringConfig, null, 2)
      );

      // Créer un embed pour le message de confirmation
      const embed = new EmbedBuilder()
        .setColor(0x800080)
        .setTitle("Utilisateur ajouté à la surveillance")
        .setDescription(
          `L'utilisateur avec l'ID **${userId}** est désormais surveillé.`
        )
        .setFooter({
          text: `Ajouté par ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    } else {
      // Créer un embed pour indiquer que l'utilisateur est déjà surveillé
      const embed = new EmbedBuilder()
        .setColor(0xffa500) // Orange pour une alerte
        .setTitle("Utilisateur déjà surveillé")
        .setDescription(
          `L'utilisateur avec l'ID **${userId}** est déjà dans la liste de surveillance.`
        )
        .setFooter({
          text: `Demande par ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    }
  },
};
