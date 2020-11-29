const fs = require('fs');
const mergeImg = require('merge-img')
const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');

module.exports = class DiceCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'dice',
      group: 'gambling',
      aliases: ['roll'],
      memberName: 'dice',
      description: 'Roll the dice',
      examples: ['dice 4'],
      details: oneLine`
      Roll random dice and return total value. ~~If you correctly guess the output
      number, then you get a reward. To roll dice without betting or guessing,
      simply just type "0" in first and second argument. \n
      Reward is calculated like this : <bet> * <dice rolled> * 5~~
      `,
      throttling: {
        usages: 3,
        duration: 10,
      },
      args: [
        {
          key: 'numberOfDice',
          prompt: 'How many dice you want to roll?',
          type: 'integer',
          default: 2
        },
      ],
    })
  }

  async run(msg, { numberOfDice }) {
    // set default dice throwed
    // if (!args.length) {
    //   // args.push('0', '0', '2');
    //   args.push('2');
    // }

    // parsing args to integer
    // var numberOfDice = parseInt(args[0]);
    // var intArg1 = parseInt(args[1]);
    // var intArg2 = parseInt(args[2]);

    // set maximum size of dice throws
    if (numberOfDice > 10) { // chanage from intArg2
      msg.channel.send(`i'm sorry I don't have enough dice`);
      return;
    }

    // Making list of image to push
    const imageList = [];
    var totalValue = 0;
    for (let i = 0; i < numberOfDice; i++) {
      let roll = Math.ceil(Math.random() * 6);
      totalValue += roll;
      imageList.push(`./src/images/dice/${roll}.png`);
    }

    if ((numberOfDice != 0 && numberOfDice > (6 * numberOfDice)) || (numberOfDice != 0 && numberOfDice < (numberOfDice))) {
      // old : if ((numberOfDice != 0 && numberOfDice > (6 * intArg2)) || (numberOfDice != 0 && numberOfDice < (intArg2)));
      return msg.channel.send('Your guess doesn\'t fall into any range of the dice you want to roll.');
    }

    // get the file name so it won't reproduce the same file
    // if the dice made a 3 + 4 + 2 consecutively, then the filename is 342.png
    function getName(imageList) {
      var name = '';
      imageList.forEach(dir => {
        let onlyName = dir.split('/').slice(-1);
        name += onlyName[0].slice(0, 1);
      });
      return name;
    }

    function isWon() {
      // if (totalValue === numberOfDice && args[1] != '0') {
      //   let reward = intArg1 * intArg2 * 5;
      //   return msg.channel.send(`You won here is your reward : ${reward} \n` +
      //     `The total value of the dice is ${totalValue}`, {
      //     files: [imageFile]
      //   });
      // } else if (args[0] != '0' && args[1] != '0') {
      //   return msg.channel.send(`The total value of the dice is ${totalValue}\n` +
      //     `Better luck next time`, {
      //     files: [imageFile]
      //   });
      // } else {
      //   return msg.channel.send(`The total value of the dice is ${totalValue}`, {
      //     files: [imageFile]
      //   })
      // }
      return msg.channel.send(`The total value of the dice is ${totalValue}`, {
        files: [imageFile]
      })
    }

    const imageFile = `./src/images/dice/${getName(imageList)}.png`;
    // check if the image is exist in image folder
    if (fs.existsSync(imageFile)) {
      isWon();
      return;
    } else {
      while (!fs.existsSync(imageFile)) {
        await mergeImg(imageList, {
          margin: '0 1000 0 0'
        })
          .then(async (img) => {
            await img.write(imageFile);
          });
      }
    }
    if (fs.existsSync(imageFile)) {
      isWon();
    }
  }

  async onBlock(msg, reason, data) {
    let parent = await super.onBlock(msg, reason, data);
    parent.delete({ timeout: 9000 })
  }

  onError(err, message, args, fromPattern, result) {
    super.onError(err, message, args, fromPattern, result)
      .then(msgParent => msgParent.delete({ timeout: 9000 }));
  }
}
