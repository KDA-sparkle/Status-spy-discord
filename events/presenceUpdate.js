const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config.json");

module.exports = {
  name: "presenceUpdate",
  async execute(oldPresence, newPresence, client) {
    // Si la surveillance est complètement arrêtée, ne rien faire
    if (config.monitoringStopped) {
      console.log(
        "Surveillance complètement arrêtée, aucun log ni notification ne sera envoyé."
      );
      return;
    }

    // Si la surveillance est en pause, on ne stocke que les connexions sans envoyer de notifications
    const notificationsEnabled = !config.monitoringPaused;

    // Vérifier que la nouvelle présence et le membre existent pour éviter les erreurs
    if (!newPresence || !newPresence.member) return;

    const member = newPresence.member;

    // Vérifier aussi que l'ancienne présence et son membre existent
    const oldStatus =
      oldPresence && oldPresence.status ? oldPresence.status : "offline";
    const newStatus = newPresence.status || "offline"; // S'assurer que "offline" est la valeur par défaut

    // Ignorer si le statut est identique (évite les logs inutiles)
    if (oldStatus === newStatus) return;

    // Emotes pour chaque statut
    const statusEmotes = {
      online: "🟢",
      idle: "🟡",
      dnd: "🔴",
      offline: "⚫",
    };

    // Récupérer les informations supplémentaires de l'utilisateur
    const userInfo = await client.users.fetch(member.id, { force: true });
    const bannerURL = userInfo.bannerURL({ size: 1024 }) || null; // On récupère la bannière une seule fois ici
    const accountCreationDate = `<t:${Math.floor(
      userInfo.createdTimestamp / 1000
    )}:F>`;
    const commonGuildsCount = client.guilds.cache.filter((g) =>
      g.members.cache.has(member.id)
    ).size;

    // Vérifier si la surveillance est activée pour cet utilisateur
    if (config.usersToMonitor.includes(member.id)) {
      // Empêcher les envois multiples avec une vérification pour ne notifier qu'une seule fois par statut
      if (!client.recentPresenceUpdates) {
        client.recentPresenceUpdates = new Map();
      }

      const lastUpdate = client.recentPresenceUpdates.get(member.id);
      if (lastUpdate && lastUpdate === newStatus) {
        return; // Ignorer les changements répétés si le même statut a déjà été enregistré
      }

      // Enregistrer le changement de statut dans recentPresenceUpdates
      client.recentPresenceUpdates.set(member.id, newStatus);

      // **Stocker les changements de présence (logs de connexions)** même en pause
      if (!config.userConnections) {
        config.userConnections = {};
      }

      // Si cet utilisateur n'a pas encore de connexions enregistrées, créer une entrée
      if (!config.userConnections[member.id]) {
        config.userConnections[member.id] = [];
      }

      // Ajouter le changement de présence dans userConnections
      config.userConnections[member.id].unshift({
        status: newStatus,
        timestamp: new Date().toISOString(),
      });

      // Limiter à 5 connexions stockées par utilisateur (supprimer les plus anciennes)
      if (config.userConnections[member.id].length > 5) {
        config.userConnections[member.id].pop();
      }

      // Sauvegarder les connexions dans le fichier config.json
      fs.writeFileSync(
        path.join(__dirname, "../config.json"),
        JSON.stringify(config, null, 2)
      );

      // **Envoyer les notifications (logs + DM)** seulement si les notifications sont activées
      if (notificationsEnabled) {
        // Créer un embed pour le changement de présence et l'envoyer dans le canal de logs
        const embed = new EmbedBuilder()
          .setColor(0xff1493) // Couleur rose foncé pour les notifications de base
          .setTitle("📡 Changement de présence")
          .setDescription(
            `${statusEmotes[oldStatus] || "❔"} **${member.user.tag}** \`(${
              member.id
            })\` est passé de **${oldStatus}** à **${newStatus}** ${
              statusEmotes[newStatus] || "❔"
            }.`
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
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .setFooter({
            text: `Surveillé par ${client.user.tag}`,
            iconURL: client.user.displayAvatarURL(),
          })
          .setTimestamp();

        // Ajouter la bannière si elle existe
        if (bannerURL) {
          embed.setImage(bannerURL);
        }

        const logChannel = client.channels.cache.get(config.logChannelId);
        if (logChannel) {
          try {
            await logChannel.send({ embeds: [embed] });
          } catch (error) {
            console.error("Erreur lors de l'envoi du log : ", error);
          }
        } else {
          console.error(
            `Erreur : Le canal de logs (ID: ${config.logChannelId}) n'a pas été trouvé.`
          );
        }

        // Détection du passage direct de "online" à "offline"
        if (oldStatus === "online" && newStatus === "offline") {
          try {
            // Vérification supplémentaire pour s'assurer que notifyUserId existe
            if (!config.notifyUserId) {
              console.error(
                "L'ID d'utilisateur pour les notifications n'est pas défini dans config.json."
              );
              return;
            }

            // Récupérer l'utilisateur à notifier et envoyer le DM
            const userToNotify = await client.users.fetch(config.notifyUserId);
            if (!userToNotify) {
              console.error(
                `Utilisateur avec l'ID ${config.notifyUserId} non trouvé.`
              );
              return;
            }

            // Récupérer les 5 derniers statuts de l'utilisateur
            const lastConnections = config.userConnections[member.id]
              .slice(0, 5)
              .map(
                (connection, index) =>
                  `\`${index + 1}.\` ${
                    statusEmotes[connection.status] || "❔"
                  } **${connection.status}** à ${new Date(
                    connection.timestamp
                  ).toLocaleString()}`
              )
              .join("\n");

            // Créer et envoyer le DM
            const dmEmbed = new EmbedBuilder()
              .setColor(0xffc0cb) // Couleur rose pour les DMs
              .setTitle("📡 Notification de présence")
              .setDescription(
                `${statusEmotes["offline"]} **${member.user.tag}** est passé de **online** à **offline**.`
              )
              .addFields({
                name: "🕒 Dernières connexions",
                value: lastConnections || "Aucune donnée disponible.",
              })
              .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
              .setFooter({
                text: `Surveillance par ${client.user.tag}`,
                iconURL: client.user.displayAvatarURL(),
              })
              .setTimestamp();

            // Ajouter la bannière si elle existe
            if (bannerURL) {
              dmEmbed.setImage(bannerURL);
            }

            await userToNotify.send({ embeds: [dmEmbed] });
            console.log(`DM envoyé à ${userToNotify.tag}`);
          } catch (error) {
            // Gestion des erreurs d'envoi du DM
            console.error("Erreur lors de l'envoi du DM : ", error);
            if (error.code === 50007) {
              console.error(
                "Impossible d'envoyer un message à l'utilisateur, les DM sont probablement désactivés."
              );
            }
          }
        }
      }
    }
  },
};
