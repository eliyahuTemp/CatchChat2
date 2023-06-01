const ManagerBot = require("./ManagerBot");

const MAX_SPAM = 4;
const spamDuration = 3 * 60 * 1000;
const ThreshHold=30
class MessageCounter {
  constructor(expirationTime) {
    this.messageMap = new Map();
    this.expirationTime = expirationTime;
  }

  updatekey(key) {
    const currentTime = Date.now();
    const value = this.messageMap.get(key);
    const timestamp = value?.timestamp || currentTime;
    if (currentTime - timestamp > this.expirationTime) {
      this.messageMap.delete(key);
    }
  }

  countMessage(message) {
    const currentTime = Date.now();
    // Delete expired messages
    this.messageMap.forEach((value, key) => {
      this.updatekey(key);
    });

    // Count the message
    if (this.messageMap.has(message)) {
      const count = this.messageMap.get(message).count;
      this.messageMap.set(message, {
        count: count + 1,
        timestamp: currentTime,
      });
    } else {
      this.messageMap.set(message, { count: 1, timestamp: currentTime });
    }
  }

  getMessageCount(message) {
    this.updatekey(message);
    if (this.messageMap.has(message)) {
      return this.messageMap.get(message).count;
    }
    return 0;
  }
}

class SpamBot extends ManagerBot {
  messageCounter = null;
  allowedMessages = new Set("");

  constructor(room, nickNumber, myroom) {
    super(room, nickNumber, myroom);
    this.messageCounter = new MessageCounter(spamDuration);
  }

  CheckCommand(obj) {
    return false;
  }

  _messageEvent(obj) {
    let handled = super._messageEvent(obj);
    if (handled) {
      return;
    }

    handled = this.CheckCommand(obj);
    if (handled) {
      return;
    }
    this.handleSusSpam(obj);
  }

  handleSusSpam(obj) {
    const message = obj[1];
    if (message.length < ThreshHold) {
      return;
    }

    if (!this.checkKey(message)) {
      return;
    }
    this.handleSpam(obj);
  }

  handleSpam(obj) {
    const [user, message] = obj;
    const sliced_string = sliceString(message);
    let max = 0;
    for (const key of sliced_string) {
      if (!this.checkKey(key)) {
        continue;
      }
      this.messageCounter.countMessage(key);
      let number = this.messageCounter.getMessageCount(key);

      max = Math.max(max, number);
    }
    if (max >= MAX_SPAM) {
      this.actionRemoveFromRoom(user, true);
    }
  }

  checkKey(message) {
   
    if (isYouTubeLink(message)) {
      return true;
    }
    if(containsRepeatedCharacter(message)){
      return true
    }
    return false
  }
}

function isYouTubeLink(text) {
  const pattern =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([^\s&]+)/;
  const match = text.match(pattern);
  if (match) {
    return true;
  } else {
    return false;
  }
}

function containsRepeatedCharacter(text) {
  const pattern = /^(\p{L}|[\p{S}\p{P}])\1+$/u;
  return pattern.test(text);
}
function sliceString(string) {
  var length = string.length;
  var middle = Math.floor(length / 2);

  var substring1 = string.substring(0, middle);
  var substring2 = string.substring(middle);
  return [substring1, substring2];
}
async function startGame() {
  const myBot = new SpamBot(1296, 333, { roomId: 1551, roomCode: "of52a" });
  await myBot.setterWs();
  myBot.actionUpdateUser("AI", 88, 1, "9v1q5");
  myBot.actionMoveToRoom(1551);
  // myBot.actionToCreateRoom("👋", "fffff");
  // myBot.actionMoveToRoom(1334)
}

startGame();
