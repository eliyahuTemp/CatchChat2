const CatchBot=require('./catchBot')
const ChatGpt=require('./ChatGpt')

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class DND extends CatchBot {
  startCommand = "בוט";

  constructor(room, nickNumber) {
    super(room, nickNumber);
  }

  _messageEvent(message) {
    const trimmedMessage = message.trim();
    if (!message.startsWith(this.startCommand)) {
      return;
    }
    let command = trimmedMessage.replace(this.startCommand, "")?.trim();
    let paramters;
    [command, ...paramters] = command.split(":");
    switch (command) {
      case "זרוק קוביות":
        this.rollDice();
        break;
      case "הלל את הגדול מכולם":
        this.worshipTheBest();
        break;
      case "חפש בויקיפדיה":
        this.searchWikipedia(paramters);
        break;
      case "זוז לחדר":
        this.actionMoveToRoom(Number(paramters[0]))
        break;
      case "צור חדר":
        this.actionToCreateRoom("❤","Hello")
        break;
      case "תעיף את":
        this.try(paramters);
      case "צאט":
        this.useChatGPT(paramters);
      }
  }

  try(paramters){
    const result=Array.from(this.users).find(x=>x[1].includes(paramters[0]?.trim?.()))[0]
    this.actionRemoveFromRoom(result)
  }

  rollDice() {
    let number1 = getRandomInt(1, 6);
    let number2 = getRandomInt(1, 6);
    const total = number1 + number2;
    const str = `${number1} ${number2} בסך הכול ${total} 🎲🎲`;
    this.actionWrite(str);

  }

  async useChatGPT(paramters){
    const str=paramters[0]?.trim()
    if(!str){
      return 
    }
    const result= await ChatGpt(str)
    const bla=result?.text.substring(0,100)
    this.actionWrite(bla);
  }

  worshipTheBest() {
    this.actionWrite("All hail the greatest of them all! ET!!!");
  }

  searchWikipedia(paramters) {
    const word = paramters[0];
    console.log(`Searching Wikipedia for ${word}...`);
    // code to search wikipedia here
  }
}

async function  startGame(){
  const myBot = new DND(6379,333);
  await myBot.setterWs();
  myBot.actionUpdateUser("AI",88,1,"9v1q5")
}



startGame()
