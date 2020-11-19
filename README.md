# Romono Bot 
**A multipurpose bot written in javascript along with discord.js library**

## Setup
If you want to self hosting the bot, then you have to make an application in [discord developer portal](https://discord.com/developers/).  
In the apps click Bot panel in the left side, copy the token and Put yor token in `.env` file.  
`.env` configuration can be seen in [**.env file**](#env) section
Make sure you don't share the token with anyone  
Why? read the important notes [here](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)

To invite the bot to your discord server you can click in oauth2 in left panel. Check the bot button then choose the permission you want to use,  
copy the link and then paste the link in new tab in your browser.  
it's reccomended to use the administrator permission. The invite link should look like this:  
`https://discord.com/api/oauth2/authorize?client_id=762578055939620864&permissions=8&scope=bot`

## <a name="env"></a> `.env` File
.env is file that stored super secret information like your bot token.  
Here is the list of variable you should put in .env file :
- `TOKEN` = Token from the application in [discord developer portal](https://discord.com/developers/).
- `MONGO_URL` = Full url of mongodb cluster if you're using remote database

## Running the bot
if the steps above have been done, you can install the environment and run the bot :
1. Install [node.js](https://nodejs.org/en/download/)
2. Install mongodb on your PC or you can create a mongodb cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. use `npm Install` at the root folder with powershell
3. make the `.env` file at the root of the project (same level as package.json)
4. And again in the shell run `node .`
5. Congrats! You've run the bot 🥳

## Official website
You can visit the official website and see all the command list without
looking at help command [here](https://rodocs.herokuapp.com/)

### My discord profile
Made with ❤ by [Cudiph#7298](https://discordapp.com/users/400240052761788427)
