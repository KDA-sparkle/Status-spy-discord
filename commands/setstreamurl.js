const { EmbedBuilder } = require("discord.js"); // Importer EmbedBuilder
const monitoringConfig = require("../config.json"); // Charger la configuration

module.exports = {
  name: "setstreamurl",
  description: "Modifie l'URL du stream lors d'un statut de streaming.",
  async execute(message, args) {
    const url = args[0];

    // Vérifier si une URL a été fournie et si elle commence par http/https
    if (!url || !url.startsWith("http")) {
      const embedError = new EmbedBuilder()
        .setColor(0xff0000) // Rouge pour indiquer une erreur
        .setTitle("❌ Erreur : URL non valide")
        .setDescription(
          "Veuillez fournir une URL valide qui commence par `http` ou `https`."
        )
        .setFooter({
          text: `Commande exécutée par ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embedError] });
    }

    // Enregistrer l'URL du stream dans la configuration
    monitoringConfig.streamURL = url;

    // Créer un embed pour confirmer la mise à jour de l'URL
    const embedSuccess = new EmbedBuilder()
      .setColor(0x800080) // Violet foncé
      .setTitle("✅ URL du stream mise à jour")
      .setDescription(
        `L'URL du stream a été mise à jour à :\n🌐 **[Twitch Link](${url})**.`
      )
      .addFields(
        {
          name: "🔗 Nouvelle URL",
          value: `\`${url}\``,
          inline: true,
        },
        {
          name: "💻 Exécutée par",
          value: `\`${message.author.tag}\``,
          inline: true,
        }
      )
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `Surveillé par ${message.client.user.tag}`,
        iconURL: message.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    // Envoyer l'embed de succès
    message.channel.send({ embeds: [embedSuccess] });

    // Écrire les changements dans le fichier config.json pour les sauvegarder
    const fs = require("fs");
    const path = require("path");

    try {
      fs.writeFileSync(
        path.join(__dirname, "../config.json"),
        JSON.stringify(monitoringConfig, null, 2)
      );
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde du fichier config.json :",
        error
      );
    }
  },
};
