const fs = require('fs');
const mergeImg = require('merge-img')

module.exports = {
  name: 'dice',
  description: 'Kick a user from the server.',
  usage: '<guess> <your bet> <dice throwed>',
  aliases: ['roll'],
  async execute(message, args) {
    // set default dice throwed
    if (!args[2]) {
      args[2] = 2;
    }

    // set maximum size of dice throws
    if (parseInt(args[2]) > 4) {
      message.channel.send(`I don't have enough dice \n Please donate me so i have more dice for you`);
      return;
    }

    // Making list of image to push
    const imageList = [];
    var totalValue = 0;
    for (let i = 0; i < args[2]; i++) {
      let roll = Math.ceil(Math.random() * 6);
      totalValue += roll;
      imageList.push(`./src/images/dice/${roll}.png`)
    }

    // get the file name so it won't reproduce the same file
    function getName() {
      var name = '';
      imageList.forEach(dir => {
        let onlyName = dir.split('/').slice(-1);
        name += onlyName[0].slice(0, 1);
      });
      return name;
    }

    function isWon() {
      if (!args[0]) {
        return message.channel.send(`The total value of dice is ${totalValue}`, {
          files: [imageFile]
        });
      } else if (totalValue === parseInt(args[0])) {
        let reward = parseInt(args[1]) * parseInt(args[2]) * 3;
        return message.channel.send(`You won here is your reward : ${reward} \n` +
          `The total value of dice is ${totalValue}`, {
            files: [imageFile]
          });
      } else {
        return message.channel.send(`The total value of dice is ${totalValue}\n` +
          `Better luck next time`, {
            files: [imageFile]
          });
      }
    }

    const imageFile = `./src/images/dice/${getName()}.png`;
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
}