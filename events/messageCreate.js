const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");

module.exports = {
  name: "messageCreate",
  execute(message, client) {
    // Vérifie si le message provient d'un bot
    if (message.author.bot) return;

    // Vérifie que le message est dans un canal (non DM)
    if (message.channel.type === "DM") {
      console.log("Message DM ignoré.");
      return;
    }

    // Loguer chaque message reçu
    console.log(`Message reçu : ${message.content}`);

    // Vérifier que le message commence par le préfixe configuré
    if (!message.content.startsWith(config.prefix)) return;

    // Extraire les arguments et le nom de la commande
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    console.log(`Commande trouvée : ${commandName}`);

    // Chercher la commande dans la collection
    const command = client.commands.get(commandName);
    if (!command) {
      return message.reply({
        content:
          "Commande non trouvée. Tapez `!help` pour voir les commandes disponibles.",
        ephemeral: true,
      });
    }

    try {
      console.log(`Exécution de la commande : ${commandName}`);
      command.execute(message, args);
    } catch (error) {
      console.error(
        `Erreur lors de l'exécution de la commande ${commandName} :`,
        error
      );

      // Envoi d'une réponse d'erreur élégante avec un embed
      const embedError = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Erreur lors de l'exécution de la commande")
        .setDescription(
          "Une erreur est survenue lors de l'exécution de cette commande. Veuillez réessayer plus tard."
        )
        .setTimestamp();

      message.reply({ embeds: [embedError] });
    }
  },
};
