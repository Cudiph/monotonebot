# Monotone Bot 
**An EPIC Discord bot written in JavaScript**

## Setting up your bot
To create your bot application, you can read the official 
[discord.js guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)  
After getting the bot token you can copy it and put in `.env` file which will be explained in the
[running the bot](#running-the-bot) section

To add your bot to your server, look [here](https://discordjs.guide/preparations/adding-your-bot-to-servers.html)  
The invite link should look like this:  
`https://discord.com/api/oauth2/authorize?client_id=762578055939620864&permissions=8&scope=bot`

You can try this bot by inviting the public bot with the link above

## Prerequisites
* [git](https://git-scm.com/downloads)
* [nodejs](https://nodejs.org/en/download/)
* [mongoDB](https://docs.mongodb.com/manual/administration/install-community/)
* [npm](https://nodejs.org/en/download/) (bundled with nodejs)
* [yarn 2](https://yarnpkg.com/getting-started/install)

## `.env` File
.env is file that stored super secret information like your bot token.  
Here is the list of variable you should put in .env file :
- `TOKEN` = Token from the application in [discord developer portal](https://discord.com/developers/).
- `MONGO_URL` = Full URL of the MongoDB cluster if you're using a remote database

## Running the bot
After [prerequisites](#prerequisites) are installed and your bot is already in your server,  
follow the steps below to run it:
1. Clone this repo with `git clone <this repo url>`, or download the zipped file.
1. Then move to the project root directory and begin with setting up the`.env` file.  
    First copy the [`.env.example`](./.env.example)
    file still in the current directory then paste and rename it to only `.env`.  
    Now open the file and change the value of `TOKEN` with your secret bot token,  
    and `MONGO_URL` with your Mongo database URI.
1. After that you can install required dependencies with `yarn install`. (Make sure you're using
    yarn 2 with `yarn set version 2`)
1. Before starting the bot please check the MongoDB service if it's running and if you're running Mongo in locally
1. And finally you can run the bot with the command `yarn start` or `npm start`
1. Congrats! You've run the bot 🥳

## Contributing
You can contribute almost anything from fixing grammar/typos, fixing bugs, or adding a feature
(you can create an issue to discuss if the feature is worth to add).  
Just fork this project and create a pull request. Any contribution will be appreciated!

## Suggestion
Create a suggestion such as new commands or features in the issues tab.

### My discord profile
Made with ❤ by [Cudiph#7298](https://discordapp.com/users/400240052761788427)
