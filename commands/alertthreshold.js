const { EmbedBuilder } = require("discord.js"); // Importer EmbedBuilder

module.exports = {
  name: "alertthreshold",
  description:
    "Définit un seuil de temps pour envoyer une alerte si un utilisateur reste en ligne ou hors ligne trop longtemps.",
  async execute(message, args) {
    const minutes = parseInt(args[0], 10);

    // Vérifier si le nombre de minutes est valide
    if (isNaN(minutes) || minutes <= 0) {
      const embedError = new EmbedBuilder()
        .setColor(0xff0000) // Rouge pour indiquer une erreur
        .setTitle("Erreur : Nombre de minutes invalide")
        .setDescription(
          "Veuillez fournir un nombre de minutes valide et supérieur à 0."
        )
        .setTimestamp();

      return message.channel.send({ embeds: [embedError] });
    }

    // Enregistrer le seuil d'alerte
    monitoringConfig.alertThreshold = minutes;

    // Créer un embed de confirmation
    const embed = new EmbedBuilder()
      .setColor(0x800080)
      .setTitle("Seuil d'alerte défini")
      .setDescription(
        `Le seuil d'alerte est désormais défini sur **${minutes} minutes**.`
      )
      .setFooter({
        text: `Défini par ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
