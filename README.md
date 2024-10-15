# Discord Presence Monitoring Bot

![Node.js CI](https://github.com/yourusername/yourrepo/actions/workflows/node.js.yml/badge.svg)
![Discord.js](https://img.shields.io/badge/Discord.js-v13.7.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Description

This Discord bot monitors user presence updates in real-time using the `discord.js` library. It can log status changes for specified users and notify a specific channel or user via direct messages when changes occur.

## Features

- Monitors user presence changes (`online`, `idle`, `dnd`, `offline`).
- Sends notifications to a specific Discord channel.
- Logs status updates to a `monitoredData.json` file.
- Customizable users to monitor through `config.json`.

## Prerequisites

Before you begin, ensure you have met the following requirements:
- Node.js v16.6.0 or higher.
- A Discord bot token.

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/KDA-sparkle/Status-spy-discord.git
   cd yourrepo
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Set up your environment variables:
   
   - Create a `.env` file in the root directory of the project and include the following keys:
   
     ```env
     DISCORD_TOKEN=your-bot-token-here
     ```

4. Configure the `config.json` file to include the following:

   ```json
   {
     "prefix": "!",
     "logChannelId": "use cmd",
     "notifyUserId": "use cmd",
     "usersToMonitor": [
     ],
     "streamURL": "https://www.twitch.tv/yourchannel",
     "monitoringPaused": false,
     "monitoringStopped": false
   }
   ```

5. Run the bot:

   ```bash
   node bot.js
   ```

## Usage

- Use the prefix defined in `config.json` to trigger commands, e.g., `!start` to start monitoring.
- To monitor new users, add their user IDs to the `usersToMonitor` array in the `config.json`.

## File Structure

- `bot.js`: Main bot entry point.
- `events/`: Contains event handler files for presence updates.
- `monitoredData.json`: Stores presence change logs.
- `config.json`: Stores bot configurations and user monitoring settings.
- `.env` : enter your token

## Dependencies

- [discord.js](https://discord.js.org/#/) - v14+

## License

This project is licensed under the MIT License.
