const { ActivityType, EmbedBuilder } = require("discord.js");
const monitoringConfig = require("../config.json"); // Importer la configuration

module.exports = {
  name: "setstatus",
  description:
    "Définit un statut pour le bot (streaming, en ligne, ne pas déranger, inactif).",
  async execute(message, args) {
    const statusType = args[0];
    const activityText = args.slice(1).join(" ") || "";

    // Vérifier si le type de statut est fourni
    if (!statusType) {
      const embedError = new EmbedBuilder()
        .setColor(0xff0000) // Rouge pour indiquer une erreur
        .setTitle("Erreur : Statut manquant")
        .setDescription(
          "Veuillez fournir un type de statut valide : `streaming`, `online`, `dnd`, `idle`."
        )
        .setTimestamp();

      return message.channel.send({ embeds: [embedError] });
    }

    switch (statusType.toLowerCase()) {
      case "streaming":
        message.client.user.setPresence({
          activities: [
            {
              name: activityText || "En streaming",
              type: ActivityType.Streaming,
              url: monitoringConfig.streamURL || "https://twitch.tv", // URL de streaming par défaut si non fournie
            },
          ],
          status: "online",
        });
        break;
      case "online":
        message.client.user.setPresence({
          status: "online",
          activities: [{ name: activityText || "En ligne" }],
        });
        break;
      case "dnd":
        message.client.user.setPresence({
          status: "dnd",
          activities: [{ name: activityText || "Ne pas déranger" }],
        });
        break;
      case "idle":
        message.client.user.setPresence({
          status: "idle",
          activities: [{ name: activityText || "Inactif" }],
        });
        break;
      default:
        const embedInvalid = new EmbedBuilder()
          .setColor(0xff0000) // Rouge pour une erreur
          .setTitle("Erreur : Statut invalide")
          .setDescription(
            "Statut non valide. Utilisez : `streaming`, `online`, `dnd`, `idle`."
          )
          .setTimestamp();

        return message.channel.send({ embeds: [embedInvalid] });
    }

    // Créer un embed pour confirmer le changement de statut
    const embedSuccess = new EmbedBuilder()
      .setColor(0x800080)
      .setTitle("Statut mis à jour")
      .setDescription(
        `Le statut a été mis à jour en **${statusType}** avec le message **${
          activityText || "Sans message"
        }**.`
      )
      .setFooter({
        text: `Commande exécutée par ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    message.channel.send({ embeds: [embedSuccess] });
  },
};
