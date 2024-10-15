require("dotenv").config(); // Charger les variables d'environnement depuis .env
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const express = require("express"); // Importer le module Express
const config = require("./config.json"); // Charger le config.json pour récupérer le préfixe

const app = express(); // Créer une application Express
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
  partials: ["CHANNEL"],
});

// Charger les commandes
client.commands = new Collection();
const commandsPath = path.resolve(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.name, command);
  console.log(`Commande ${command.name} chargée avec succès`);
}

// Charger les événements
const eventsPath = path.resolve(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// Gestion des erreurs globales
process.on("uncaughtException", (error) => {
  console.error("Erreur non capturée :", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Promesse non gérée :", error);
});

// Configurer une route pour le serveur Express
app.get("/", (req, res) => {
  res.send("Le bot Discord est en ligne et fonctionne !");
});

// Lancer le serveur Express sur le port 8000
app.listen(8000, () => {
  console.log("Serveur Express en cours d'exécution sur le port 8000");
});

// Connexion du bot avec le token provenant de .env
client
  .login(process.env.DISCORD_TOKEN)
  .then(() => {
    console.log("Bot connecté avec succès !");
    client.user.setPresence({
      activities: [
        {
          name: "Surveiller le serveur",
          type: 1, // Type 1 = Streaming
          url: config.streamURL || "https://twitch.tv/yourchannel",
        },
      ],
      status: "online",
    });
  })
  .catch((err) => {
    console.error("Erreur lors de la connexion du bot :", err);
  });
