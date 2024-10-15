const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const config = require("../config.json"); // Importer le config.json pour récupérer le préfixe

module.exports = {
  name: "help",
  description: "Affiche la liste des commandes disponibles.",
  async execute(message) {
    // Liste des commandes avec des emotes pour chaque section et le préfixe dynamique
    const commands = [
      {
        name: `\`${config.prefix}adduser <userID>\``,
        description: "➕ Ajouter un utilisateur à surveiller",
      },
      {
        name: `\`${config.prefix}removeuser <userID>\``,
        description: "➖ Retirer un utilisateur de la surveillance",
      },
      {
        name: `\`${config.prefix}lastconnections <userID>\``,
        description: "🕒 Voir les 5 dernières connexions",
      },
      {
        name: `\`${config.prefix}setlogchannel <channelID>\``,
        description: "📢 Définir le canal de logs",
      },
      {
        name: `\`${config.prefix}setnotifyuser <userID>\``,
        description: "📩 Définir l'utilisateur à notifier",
      },
      {
        name: `\`${config.prefix}status <userID>\``,
        description: "📊 Voir le statut actuel d'un utilisateur",
      },
      {
        name: `\`${config.prefix}setstatus <statut> <texte>\``,
        description: "📡 Définir le statut du bot",
      },
      {
        name: `\`${config.prefix}custommessage <userID> <message>\``,
        description: "✉️ Envoyer un DM personnalisé",
      },
      {
        name: `\`${config.prefix}resetuser <userID>\``,
        description: "🔄 Réinitialiser les logs de connexion d'un utilisateur",
      },
      {
        name: `\`${config.prefix}setstreamurl <url>\``,
        description: "📺 Modifier l'URL du stream",
      },
      {
        name: `\`${config.prefix}monitorstop\``,
        description: "🛑 Arrêter la surveillance",
      },
      {
        name: `\`${config.prefix}monitorstart\``,
        description: "▶️ Reprendre la surveillance",
      },
      {
        name: `\`${config.prefix}pausemonitoring\``,
        description: "⏸️ Suspendre la surveillance",
      },
      {
        name: `\`${config.prefix}resumemonitoring\``,
        description: "⏯️ Reprendre la surveillance",
      },
      {
        name: `\`${config.prefix}listmonitored\``,
        description: "📋 Afficher la liste des utilisateurs surveillés",
      },
      {
        name: `\`${config.prefix}help\``,
        description: "📚 Afficher cette liste",
      },
    ];

    // Pagination des commandes par groupes de 5
    const commandsPerPage = 5;
    let page = 0;

    // Créer un embed pour une page spécifique
    const generateEmbed = (page) => {
      const embed = new EmbedBuilder()
        .setColor(0x800080) // Couleur violette
        .setTitle("📚 Liste des commandes")
        .setDescription("Voici les commandes disponibles pour le bot :")
        .setFooter({
          text: `Page ${page + 1}/${Math.ceil(
            commands.length / commandsPerPage
          )} • Exécutée par ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      // Ajouter les commandes pour cette page
      const start = page * commandsPerPage;
      const end = start + commandsPerPage;
      commands.slice(start, end).forEach((cmd) => {
        embed.addFields({ name: cmd.name, value: cmd.description });
      });

      return embed;
    };

    // Créer les boutons pour la pagination
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("previous")
        .setLabel("⬅️ Précédent")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("➡️ Suivant")
        .setStyle(ButtonStyle.Primary)
    );

    // Envoyer le premier embed
    const messageEmbed = await message.channel.send({
      embeds: [generateEmbed(page)],
      components: [row],
    });

    // Créer un gestionnaire pour la pagination
    const collector = messageEmbed.createMessageComponentCollector({
      time: 60000, // 1 minute avant expiration
    });

    collector.on("collect", async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({
          content: "Vous ne pouvez pas interagir avec ce message.",
          ephemeral: true,
        });
      }

      // Gérer les interactions avec les boutons
      if (interaction.customId === "previous") {
        page =
          page > 0
            ? page - 1
            : Math.ceil(commands.length / commandsPerPage) - 1; // Si à la première page, retour à la dernière
      } else if (interaction.customId === "next") {
        page =
          page < Math.ceil(commands.length / commandsPerPage) - 1
            ? page + 1
            : 0; // Si à la dernière page, retour à la première
      }

      // Mettre à jour les boutons et l'embed
      await interaction.update({
        embeds: [generateEmbed(page)],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("previous")
              .setLabel("⬅️ Précédent")
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId("next")
              .setLabel("➡️ Suivant")
              .setStyle(ButtonStyle.Primary)
          ),
        ],
      });
    });

    // Arrêter le collector après expiration
    collector.on("end", () => {
      messageEmbed.edit({ components: [] });
    });
  },
};
