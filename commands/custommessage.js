const { EmbedBuilder } = require("discord.js"); // Importer EmbedBuilder

module.exports = {
  name: "custommessage",
  description:
    "Envoie un message personnalisé en DM à un utilisateur surveillé.",
  async execute(message, args) {
    const userId = args[0];
    const customMessage = args.slice(1).join(" ");

    // Vérification si l'ID d'utilisateur et le message sont fournis
    if (!userId || !customMessage) {
      const embedError = new EmbedBuilder()
        .setColor(0xff0000) // Rouge pour signaler l'erreur
        .setTitle("Erreur : Paramètres manquants")
        .setDescription(
          "Veuillez fournir un ID d'utilisateur valide et un message."
        )
        .setTimestamp();

      return message.channel.send({ embeds: [embedError] });
    }

    try {
      const user = await message.client.users.fetch(userId);

      // Vérifier si l'utilisateur est trouvé
      if (user) {
        await user.send(customMessage);

        const embedSuccess = new EmbedBuilder()
          .setColor(0x800080)
          .setTitle("Message envoyé")
          .setDescription(`Votre message a été envoyé à **${user.tag}**.`)
          .addFields({ name: "Message", value: customMessage })
          .setFooter({
            text: `Envoyé par ${message.author.tag}`,
            iconURL: message.author.displayAvatarURL(),
          })
          .setTimestamp();

        message.channel.send({ embeds: [embedSuccess] });
      } else {
        const embedUserNotFound = new EmbedBuilder()
          .setColor(0xffa500) // Orange pour avertir que l'utilisateur n'est pas trouvé
          .setTitle("Utilisateur non trouvé")
          .setDescription(
            `L'utilisateur avec l'ID **${userId}** n'a pas pu être trouvé.`
          )
          .setTimestamp();

        message.channel.send({ embeds: [embedUserNotFound] });
      }
    } catch (error) {
      console.error(error);

      const embedError = new EmbedBuilder()
        .setColor(0xff0000) // Rouge pour signaler l'erreur
        .setTitle("Erreur lors de l'envoi du message")
        .setDescription("Une erreur s'est produite lors de l'envoi du message.")
        .setTimestamp();

      message.channel.send({ embeds: [embedError] });
    }
  },
};
