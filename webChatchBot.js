function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let wait = (time) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve("test");
    }, time);
  });

const coder = new TextEncoder();

class CatchBot {
  /**
   * @type {WebSocket|null} - WebSocket instance or null if not connected
   * @protected
   */
  _wb = null;

  connected = false;

  constructor(room, nickNumber) {
    this.initializeWs(room, nickNumber);
    // this.setterWs();
  }

    static _parseObjFromBlob = async (msgevent) => {
    const string = await msgevent.data.text();
    const JSONmessage = string.substring(1);
    const parseObject = JSON.parse(`[${JSONmessage}]`);
    return [string.charCodeAt(0),parseObject];
  };

  initializeWs() {
    const strInfo = sessionStorage.info;
    const pasreInfo = JSON.parse(strInfo);
    const r = pasreInfo.r;
    const u = getRandomInt(10000, 100000);
    const k = "5a3agz";
    const f = 0;
    const n = getRandomInt(1, 9999);
    const stringJson = JSON.stringify({ u, r, k, n, f });
    this._wb = new WebSocket(`wss://ws.catch-chat.com/?d=${stringJson}`);
  }

  setterWs() {
    return new Promise((res, reject) => {
      this._wb.onmessage = async (buf) => {
        this?.commandHandler?.(buf);
      };
      this._wb.onopen = () => {
        res();
        this.connected = true;
      };
      this._wb.onerror = (err) => {
        reject("error");
        console.log("Error:", err);
      };
    });
  }

  writeToSocket(command, objectToStringify) {
    const commandStr = String.fromCharCode(command);
    let str = "";
    if (Array.isArray(objectToStringify)) {
      str = JSON.stringify(objectToStringify).slice(1, -1);
    } else {
      str = JSON.stringify(objectToStringify);
    }
    this._wb.send(coder.encode(commandStr + str));
  }

  //#region  old no needed code, here for checks.
  async sendLongText(message) {
    const regex = new RegExp(`.{1,${CatchBot.maxWordNumber}}`, "g");
    const messages = message.match(regex);
    for (const myMessage of messages) {
      this.write(myMessage);
      await wait(25000);
    }
  }

  write(message) {
    const encodedMessage = coder.encode(
      String.fromCharCode(2) + `["${message}"]`
    );
    this._wb.send(encodedMessage);
  }
  //#endregion
}

export default CatchBot;
