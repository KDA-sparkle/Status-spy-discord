const { EmbedBuilder } = require("discord.js");
const monitoringConfig = require("../config.json"); // Importer la configuration depuis config.json

module.exports = {
  name: "lastconnections",
  description: "Voir les 5 dernières connexions d'un utilisateur surveillé.",
  async execute(message, args) {
    const userId = args[0] || monitoringConfig.usersToMonitor[0]; // Utiliser le premier utilisateur surveillé par défaut

    // Vérifier si userConnections existe et contient cet utilisateur
    if (
      !monitoringConfig.userConnections ||
      !monitoringConfig.userConnections[userId]
    ) {
      const embedError = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Erreur : Aucune connexion enregistrée")
        .setDescription(
          "Aucune connexion récente enregistrée pour cet utilisateur."
        )
        .setTimestamp();

      return message.channel.send({ embeds: [embedError] });
    }

    // Vérifier si cet utilisateur a des connexions enregistrées
    const connections = monitoringConfig.userConnections[userId];
    if (connections.length === 0) {
      const embedError = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Aucune connexion enregistrée")
        .setDescription(
          "Aucune connexion récente enregistrée pour cet utilisateur."
        )
        .setTimestamp();

      return message.channel.send({ embeds: [embedError] });
    }

    // Créer un embed pour afficher les dernières connexions
    const embed = new EmbedBuilder()
      .setColor(0x800080)
      .setTitle(`Dernières connexions de l'utilisateur ${userId}`)
      .setDescription("Voici les 5 dernières connexions enregistrées :")
      .setFooter({
        text: `Demandé par ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    // Afficher les 5 dernières connexions
    connections.slice(0, 5).forEach((connection, index) => {
      embed.addFields({
        name: `Connexion ${index + 1}`,
        value: `**Statut** : ${connection.status}\n**Heure** : ${new Date(
          connection.timestamp
        ).toLocaleString()}`,
      });
    });

    message.channel.send({ embeds: [embed] });
  },
};
