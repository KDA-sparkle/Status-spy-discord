const { EmbedBuilder } = require("discord.js");
const monitoringConfig = require("../config.json"); // Importer la configuration depuis config.json

module.exports = {
  name: "status",
  description:
    "Affiche le statut actuel d'un utilisateur surveillé ou membre du bot dans tous ses serveurs.",
  async execute(message, args) {
    const userId = args[0];

    // Vérifier si un ID utilisateur a été fourni
    if (!userId) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("Erreur : ID utilisateur manquant")
            .setDescription("Veuillez fournir un ID utilisateur valide.")
            .setTimestamp(),
        ],
      });
    }

    let member = null;

    try {
      // Parcourir tous les serveurs du bot pour trouver l'utilisateur
      for (const [guildId, guild] of message.client.guilds.cache) {
        try {
          member = await guild.members.fetch(userId);
          if (member) break; // Si on trouve l'utilisateur, on sort de la boucle
        } catch (error) {
          if (error.code !== 10007) {
            console.error(
              `Erreur lors de la recherche dans le serveur ${guildId}:`,
              error
            );
          }
        }
      }

      // Si on ne trouve pas le membre, on récupère les informations utilisateur via l'API utilisateur
      const userInfo = await message.client.users.fetch(userId, {
        force: true,
      });
      const avatarURL = userInfo.displayAvatarURL({ dynamic: true });
      const bannerURL = userInfo.bannerURL({ size: 1024 }) || null; // URL de la bannière si elle existe
      const accountCreationDate = `<t:${Math.floor(
        userInfo.createdTimestamp / 1000
      )}:F>`;

      if (!member) {
        // Créer un embed pour afficher les informations du compte
        const embedStatus = new EmbedBuilder()
          .setColor(0x800080) // Couleur violet foncé
          .setTitle(`Informations de l'utilisateur ${userInfo.tag}`)
          .setDescription(
            `L'utilisateur est hors ligne ou n'est pas présent dans un serveur du bot.`
          )
          .addFields(
            { name: "🔹 ID", value: `\`${userId}\``, inline: true },
            {
              name: "🔹 Date de création du compte",
              value: accountCreationDate,
              inline: true,
            }
          )
          .setThumbnail(avatarURL)
          .setFooter({
            text: `Commande exécutée par ${message.author.tag}`,
            iconURL: message.author.displayAvatarURL(),
          })
          .setTimestamp();

        // Ajouter la bannière si elle existe
        if (bannerURL) {
          embedStatus.setImage(bannerURL);
        }

        return message.channel.send({ embeds: [embedStatus] });
      }

      // Si l'utilisateur est trouvé dans un serveur
      const status = member.presence?.status || "hors ligne";
      const statusEmotes = {
        online: "🟢 En ligne",
        idle: "🟡 Inactif",
        dnd: "🔴 Ne pas déranger",
        offline: "⚫ Hors ligne",
      };

      const commonGuildsCount = message.client.guilds.cache.filter((g) =>
        g.members.cache.has(userId)
      ).size;

      // Créer un embed pour afficher le statut actuel de l'utilisateur
      const embedStatus = new EmbedBuilder()
        .setColor(0x800080) // Couleur violet foncé
        .setTitle(`Statut de l'utilisateur ${member.user.tag}`)
        .setDescription(
          `${
            statusEmotes[status] || "❔ Statut inconnu"
          }\n\n**ID** : \`${userId}\``
        )
        .addFields(
          {
            name: "🔹 Date de création du compte",
            value: accountCreationDate,
            inline: true,
          },
          {
            name: "🔹 Serveurs en commun",
            value: `\`${commonGuildsCount}\` serveurs`,
            inline: true,
          }
        )
        .setThumbnail(avatarURL)
        .setFooter({
          text: `Commande exécutée par ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      // Ajouter la bannière si elle existe
      if (bannerURL) {
        embedStatus.setImage(bannerURL);
      }

      message.channel.send({ embeds: [embedStatus] });
    } catch (error) {
      console.error(error);

      const embedError = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Erreur lors de la récupération du statut")
        .setDescription(
          "Une erreur est survenue lors de la tentative de récupération du statut de cet utilisateur. Assurez-vous que l'ID est correct."
        )
        .setTimestamp();

      message.channel.send({ embeds: [embedError] });
    }
  },
};
