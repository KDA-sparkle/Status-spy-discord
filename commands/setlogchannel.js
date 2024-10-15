const { EmbedBuilder } = require("discord.js");
const monitoringConfig = require("../config.json"); // Importer le fichier de configuration
const fs = require("fs");
const path = require("path"); // Pour générer un chemin correct vers config.json

module.exports = {
  name: "setlogchannel",
  description: "Définir le canal de logs pour les transitions de présence.",
  async execute(message, args) {
    const channelId = args[0];

    // Vérifier si un ID de canal a été fourni
    if (!channelId) {
      const embedError = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Erreur : ID de canal manquant")
        .setDescription("Veuillez fournir un ID de canal valide.")
        .setTimestamp();

      return message.channel.send({ embeds: [embedError] });
    }

    // Vérifier si le canal existe sur le serveur
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel) {
      const embedError = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Erreur : Canal non trouvé")
        .setDescription(
          `Aucun canal avec l'ID **${channelId}** n'a été trouvé sur ce serveur.`
        )
        .setTimestamp();

      return message.channel.send({ embeds: [embedError] });
    }

    // Enregistrer le canal de logs dans la configuration
    monitoringConfig.logChannelId = channelId;

    // Sauvegarder les modifications dans config.json
    fs.writeFileSync(
      path.join(__dirname, "../config.json"),
      JSON.stringify(monitoringConfig, null, 2)
    );

    // Créer un embed pour confirmer le changement de canal
    const embedSuccess = new EmbedBuilder()
      .setColor(0x800080)
      .setTitle("Canal de logs défini")
      .setDescription(
        `Le canal de logs est maintenant défini sur **${channel.name}**.`
      )
      .setFooter({
        text: `Commande exécutée par ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    message.channel.send({ embeds: [embedSuccess] });
  },
};
