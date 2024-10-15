const { EmbedBuilder } = require("discord.js"); // Importer EmbedBuilder

module.exports = {
  name: "monitorall",
  description: "Surveiller tous les membres du serveur.",
  async execute(message) {
    try {
      // Récupérer tous les membres du serveur
      const members = await message.guild.members.fetch();
      const memberIds = members.map((member) => member.id); // Créer une liste avec les IDs des membres

      monitoringConfig.usersToMonitor = memberIds; // Ajouter tous les membres à la liste des utilisateurs surveillés

      // Créer un embed pour confirmer la surveillance de tous les membres
      const embed = new EmbedBuilder()
        .setColor(0x800080)
        .setTitle("Surveillance activée pour tous les membres")
        .setDescription(
          `Tous les membres du serveur **${message.guild.name}** sont maintenant surveillés.`
        )
        .addFields({
          name: "Nombre de membres surveillés",
          value: `${memberIds.length} membres`,
        })
        .setFooter({
          text: `Commande exécutée par ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Erreur lors de la surveillance des membres : ", error);

      const embedError = new EmbedBuilder()
        .setColor(0xff0000) // Rouge pour indiquer une erreur
        .setTitle("Erreur lors de l'activation de la surveillance")
        .setDescription(
          "Une erreur est survenue lors de la tentative de surveiller tous les membres du serveur."
        )
        .setTimestamp();

      message.channel.send({ embeds: [embedError] });
    }
  },
};
