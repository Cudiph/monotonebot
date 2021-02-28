const fs = require('fs');
const mergeImg = require('merge-img');
const Command = require('../../structures/Command.js');
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
        usages: 2,
        duration: 15,
      },
      args: [
        {
          key: 'numberOfDice',
          prompt: 'How many dice you want to roll?',
          type: 'integer',
          default: 2
        },
      ],
    });
  }

  /** @param {import('discord.js-commando').CommandoMessage} msg */
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
      msg.say(`i'm sorry I don't have enough dice`);
      return;
    }

    // Making list of image to push
    const imageList = [];
    let totalValue = 0;
    for (let i = 0; i < numberOfDice; i++) {
      const roll = Math.ceil(Math.random() * 6);
      totalValue += roll;
      imageList.push(`${__dirname}/../../images/dice/${roll}.png`);
    }

    if ((numberOfDice != 0 && numberOfDice > (6 * numberOfDice)) || (numberOfDice != 0 && numberOfDice < (numberOfDice))) {
      // old : if ((numberOfDice != 0 && numberOfDice > (6 * intArg2)) || (numberOfDice != 0 && numberOfDice < (intArg2)));
      return msg.say('Your guess doesn\'t fall into any range of the dice you want to roll.');
    }

    // get the file name so it won't reproduce the same file
    // if the dice made a 3 + 4 + 2 consecutively, then the filename is 342.png
    function getName(imgList) {
      let name = '';
      imgList.forEach(dir => {
        const onlyName = dir.split('/').slice(-1);
        name += onlyName[0].slice(0, 1);
      });
      return name;
    }

    function isWon() {
      // if (totalValue === numberOfDice && args[1] != '0') {
      //   let reward = intArg1 * intArg2 * 5;
      //   return msg.say(`You won here is your reward : ${reward} \n` +
      //     `The total value of the dice is ${totalValue}`, {
      //     files: [imageFile]
      //   });
      // } else if (args[0] != '0' && args[1] != '0') {
      //   return msg.say(`The total value of the dice is ${totalValue}\n` +
      //     `Better luck next time`, {
      //     files: [imageFile]
      //   });
      // } else {
      //   return msg.say(`The total value of the dice is ${totalValue}`, {
      //     files: [imageFile]
      //   })
      // }
      return msg.say(`The total value of the dice is ${totalValue}`, {
        files: [imageFile]
      });
    }

    const imageFile = `${__dirname}/../../images/dice/${getName(imageList)}.png`;
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

};
