const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const monitoringConfig = require("../config.json"); // Importer la configuration

module.exports = {
  name: "listmonitored",
  description:
    "Affiche la liste des utilisateurs surveillés (avec pagination).",
  async execute(message) {
    const users = monitoringConfig.usersToMonitor;

    if (users.length === 0) {
      return message.reply("Aucun utilisateur n'est actuellement surveillé.");
    }

    const ITEMS_PER_PAGE = 10;
    let currentPage = 0;

    // Fonction pour créer un embed avec les utilisateurs surveillés d'une page donnée
    const generateEmbed = async (page) => {
      const start = page * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const userPage = users.slice(start, end);

      // Créer un embed pour la page actuelle
      const embed = new EmbedBuilder()
        .setColor(0x800080)
        .setTitle(
          `Utilisateurs surveillés - Page ${page + 1}/${Math.ceil(
            users.length / ITEMS_PER_PAGE
          )}`
        )
        .setTimestamp()
        .setFooter({
          text: `Page ${page + 1} sur ${Math.ceil(
            users.length / ITEMS_PER_PAGE
          )}`,
        });

      // Récupérer les pseudos et ID pour chaque utilisateur
      for (const userId of userPage) {
        try {
          const user = await message.client.users.fetch(userId);
          embed.addFields({ name: `${user.tag}`, value: `ID: ${userId}` });
        } catch (error) {
          embed.addFields({
            name: `Utilisateur inconnu`,
            value: `ID: ${userId}`,
          });
        }
      }

      return embed;
    };

    // Générer la première page
    const embedMessage = await message.channel.send({
      embeds: [await generateEmbed(currentPage)],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("prev")
            .setLabel("◀️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId("next")
            .setLabel("▶️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(users.length <= ITEMS_PER_PAGE)
        ),
      ],
    });

    // Créer un collector pour les boutons
    const collector = embedMessage.createMessageComponentCollector({
      time: 60000, // 60 secondes avant de désactiver les boutons
    });

    collector.on("collect", async (interaction) => {
      if (interaction.customId === "prev") {
        // Si on est à la première page, retourner à la dernière
        currentPage =
          currentPage > 0
            ? currentPage - 1
            : Math.floor(users.length / ITEMS_PER_PAGE);
      } else if (interaction.customId === "next") {
        // Si on est à la dernière page, retourner à la première
        currentPage =
          currentPage < Math.floor(users.length / ITEMS_PER_PAGE)
            ? currentPage + 1
            : 0;
      }

      // Mettre à jour les boutons
      await interaction.update({
        embeds: [await generateEmbed(currentPage)],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("prev")
              .setLabel("◀️")
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId("next")
              .setLabel("▶️")
              .setStyle(ButtonStyle.Primary)
          ),
        ],
      });
    });

    collector.on("end", () => {
      // Désactiver les boutons une fois le temps écoulé
      embedMessage.edit({
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("prev")
              .setLabel("◀️")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId("next")
              .setLabel("▶️")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true)
          ),
        ],
      });
    });
  },
};
