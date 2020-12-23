/* eslint-disable no-console */
require('dotenv').config();
const { ShardingManager } = require('discord.js');
const manager = new ShardingManager('./src/bot.js', { token: process.env.TOKEN });

manager.on('shardCreate', shard => console.log(`[SHARD] - Launched shard ${shard.id}`));
manager.spawn();