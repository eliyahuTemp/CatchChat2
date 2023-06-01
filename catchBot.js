const WebSocket = require('ws');
const TextEncoder = require('util').TextEncoder;
let tracker=[];

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
  _wb = null;
  connected=false;

  constructor(room, nickNumber) {
    this.initializeWs(room, nickNumber);
    // this.setterWs();
  }
  
  static async _parseObjFromBlob(buf) {
    const string = await buf.toString('utf-8')
    const JSONmessage = string.substring(1);
    const parseObject = JSON.parse(`[${JSONmessage}]`);
    tracker.push([string.charCodeAt(0),parseObject])
    return [string.charCodeAt(0),parseObject];
  }

  initializeWs(room, nickNumber) {
    const r = room ? [room] : [1];
    // const u = getRandomInt(10000, 100000);
    const u=1111
    const k = "5a3agz";
    const f = 0;
    const n = nickNumber || getRandomInt(1, 9999);
    const stringJson = JSON.stringify({ u, r, k, n, f });
    this._wb = new WebSocket(`wss://ws.catch-chat.com/?d={"u":17330,"r":[173],"k":"dpzp1","n":"ET","a":24,"s":1,"f":0,"b":[22984,25784,26734]}`,{
        headers: {
          'Connection': 'Upgrade',
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
          'Upgrade': 'websocket',
          'Origin': 'https://catch-chat.com', 
          'Sec-WebSocket-Version': 13, 
          'Accept-Encoding':'gzip, deflate, br', 
          'Accept-Language':'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7', 
          'Sec-WebSocket-Key':'Yudi/9yM6nxRl5dQ1xfbUQ==', 
          'Sec-WebSocket-Extensions':'permessage-deflate; client_max_window_bits' 
      } 
    });
  }

  setterWs() {
   return new Promise((res,reject)=>{
      this._wb.on('message', async (buf) => {
        this.commandHandler(buf)
    });

    this._wb.on('open',()=>{
        res()
        this.connected=true;
    });

    this._wb.on('error', (err) => {
        reject("error")
        console.log('Error:', err);
    });
    })


  }

  writeToSocket(command,objectToStringify){
    const commandStr= String.fromCharCode(command)
    let str=""
    if(Array.isArray(objectToStringify)){
      str=JSON.stringify(objectToStringify).slice(1, -1)
    }
    else{
      str=JSON.stringify(objectToStringify)
    }

    this._wb.send(coder.encode(commandStr+str))
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
    const encodedMessage = coder.encode(String.fromCharCode(2) + `["${message}"]`);
    this._wb.send(encodedMessage);
  }
  //#endregion 
}



module.exports=CatchBot;


