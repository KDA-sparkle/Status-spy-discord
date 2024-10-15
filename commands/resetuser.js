const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const monitoringConfig = require("../config.json"); // Importer monitoringConfig

module.exports = {
  name: "resetuser",
  description: "Réinitialise les logs de connexion d'un utilisateur.",
  async execute(message, args) {
    const userId = args[0];

    // Vérifier si un ID d'utilisateur a été fourni
    if (!userId) {
      const embedError = new EmbedBuilder()
        .setColor(0xff0000) // Rouge pour une erreur
        .setTitle("Erreur : ID d'utilisateur manquant")
        .setDescription("Veuillez fournir un ID d'utilisateur valide.")
        .setTimestamp();

      return message.channel.send({ embeds: [embedError] });
    }

    // Vérifier si l'utilisateur est surveillé et si des logs existent
    if (
      !monitoringConfig.userConnections ||
      !monitoringConfig.userConnections[userId]
    ) {
      const embedError = new EmbedBuilder()
        .setColor(0xff0000) // Rouge pour indiquer une erreur
        .setTitle("Erreur : Utilisateur non surveillé")
        .setDescription(
          "Cet utilisateur n'est pas surveillé ou aucun log à réinitialiser."
        )
        .setTimestamp();

      return message.channel.send({ embeds: [embedError] });
    }

    // Réinitialiser les logs de l'utilisateur
    monitoringConfig.userConnections[userId] = [];

    // Sauvegarder la modification dans le fichier config.json
    fs.writeFileSync(
      path.join(__dirname, "../config.json"),
      JSON.stringify(monitoringConfig, null, 2)
    );

    // Créer un embed pour confirmer la réinitialisation des logs
    const embedSuccess = new EmbedBuilder()
      .setColor(0x800080)
      .setTitle("✔️ Logs réinitialisés")
      .setDescription(
        `Les logs de connexion de l'utilisateur **${userId}** ont été réinitialisés avec succès.`
      )
      .setThumbnail(
        message.guild.members.cache
          .get(userId)
          ?.user.displayAvatarURL({ dynamic: true })
      )
      .setFooter({
        text: `Commande exécutée par ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    message.channel.send({ embeds: [embedSuccess] });
  },
};
