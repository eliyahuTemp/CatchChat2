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
  
  /**
 * An enumeration of possible command actions.
 * @readonly
 * @enum {number}
 */
const commandHandleEnum={
    INI:10,
    HANDLE_PRIVATE_MESSAGES:1,
    MESSAGE_HANDLER:2,
    HANDLE_MOVE_ROOM:3,
    HANDLE_UPDATE_USER:4,
    HANDLE_INCOMING_USERS:5,
    HANDLE_LOG_OUT:6,
    HANDLE_CREATE_ROOM:13,
    HANDLE_MY_ROOM:14,
    HANDLE_NEW_ROOM:12,
  }
  
  /**
   * An enumeration of possible command actions.
   * @readonly
   * @enum {number}
   */
  const commandActions={
    CREATE_ROOM:10,
    UPDATE_USER:4,
    REMOVE_FROM_ROOM:11,
    MOVE_TO_ROOM:3,
    SEND_MESSAGE:2,
    PING:0
  }
   
  const userEnum={
    ROOM:0,
    NICK:1,
    SEX:3,
    AGE:2,
    IMAGEURL:4,  
  }
  
  const deleteEnum={
    CREATE_ROOM:1,
    DELETE_ROOM:2
  }
  
  class HandlesAndActionsBot extends CatchBot{
    static maxWordNumber = 100;
    rooms=null;
    users=null;
    currentRoom=1;
    _myRoom={roomId:null,roomCode:null}
    
    /**
     * @param {{ roomCode: any; roomId: any; }} myRoom
     */
    set myRoom(myRoom){
      console.log(myRoom)
      this._myRoom=myRoom
    }
  
    get myRoom(){
      return this._myRoom 
    }
  /**
   * @class
   * @classdesc This class represents a room with an ID and a code.
   * @param {Object} room - The room object.
   * @param {Number} nickNumber - The number of nicks.
   * @param {Object} [myRoom={roomId:null,roomCode:null}] - The myRoom object with properties roomId and roomCode.
   */
    constructor(room, nickNumber,myRoom={roomId:null,roomCode:null}){
        super(room, nickNumber);
        this.currentRoom=room;
        this.myRoom=myRoom;
  
    }
  
   deleteUsers(...usersId){
      for (let index = 0; index < usersId.length; index++) {
          const userId = usersId[index];
          this.users.delete(userId)  
      }
   }
  
   //#region actions
    actionWrite(message,color){
      this.writeToSocket(commandHandleEnum.MESSAGE_HANDLER,[message,color].filter(x=>x))
    }
  
    actionMoveToRoom(roomId){
        this.writeToSocket(commandHandleEnum.HANDLE_MOVE_ROOM,roomId)
    }
  
    actionToCreateRoom(emoji,roomName,password){
      let obj=[emoji,roomName,];
      if(password){
        obj.push(password)
      }
      this.writeToSocket(commandActions.CREATE_ROOM,obj)
    }
  
    actionRemoveFromRoom(userId,permanent=false){
      let number=0;
      if(permanent){
         number=1
      }
      const object=[this.myRoom.roomCode,userId,number]
      this.writeToSocket(commandActions.REMOVE_FROM_ROOM,object)
    }
  
  actionUpdateUser(name,age,sex,imageId){
    const obj=[name,age,sex,imageId].filter(x=>x)
    this.writeToSocket(commandActions.UPDATE_USER,obj)
  }
  
  actionPing(number){
    this.writeToSocket(commandActions.PING,number)
  }
  
   //#endregion
    
   
    //#region handlers
    async commandHandler(buf){
      const [command,object]=await CatchBot._parseObjFromBlob(buf)
      this.beforeUpdate(command,object)
      switch(command) { 
          case commandHandleEnum.INI:
              this.handleInitRoomsAndUsers(object);
              break;
          case commandHandleEnum.HANDLE_PRIVATE_MESSAGES:
              this._privateMassageEvent(object)
              break
          case commandHandleEnum.MESSAGE_HANDLER:
              // Perform action 2
              this._messageEvent(object);
              break;
          case commandHandleEnum.HANDLE_MOVE_ROOM:
            // the handler for moving room;
            this.handlerForMoveRoom(object);
            break;
          case commandHandleEnum.HANDLE_UPDATE_USER:
              // handler to update User
             this.handleUpdateUsers(object);
              break;
          case commandHandleEnum.HANDLE_INCOMING_USERS:
             // handle new Users
             this.handlerSetIncomingUsers(object)
              break;
          case commandHandleEnum.HANDLE_LOG_OUT:
            this.handleLogOut(object)
          break;
          case commandHandleEnum.HANDLE_CREATE_ROOM:
            this.handleCreateOrDeleteRooms(object)
          break;
          case  commandHandleEnum.HANDLE_MY_ROOM:
            this.handleMyRoom(object)
          break;
              default:
          console.log(command,object,"Variable does not match any of the keys")
      }
      this.update(command,object)
    }
  
   /**
    * Handle user moving a room
    * @param {*} object 
    * @returns 
    */
    handlerForMoveRoom(object) {
      const [userId, room] = object;
      const userToUpdate=this.users.get(userId)
      if(!userToUpdate){
        return;
      }
      userToUpdate[userEnum.ROOM] = room;
      return userToUpdate
    }
  
    /**
     * Handle update user stats.
     * @param {*} object 
     * @returns 
     */
    handleUpdateUsers(object){
      const [userId,age,sex,userName]=object;
      const userArray= this.users.get(userId);
      if(!userArray){
        return 
      }
      userArray[userEnum.AGE]=age;
      userArray[userEnum.SEX]=sex;
      userArray[userEnum.NICK]=userName;
    }
  
    /**
     * Handle the first initialization of the users and room.
     * @param {*} initObject 
     */
    handleInitRoomsAndUsers(initObject){
      const [someId/*to check later*/,k,/*someOtherId*/,rooms,users,lastXMessages]=initObject
      this.rooms=rooms;
      this.users=new Map(users); 
    }
  
    /**
     * Handle new users.
     * @param {*} object 
     */
    handlerSetIncomingUsers(object){
      const [userId,room,userName,age,sex]=object;
      const arr=[];
      arr[userEnum.ROOM]=room;
      arr[userEnum.NICK]=userName;
      arr[userEnum.AGE]=age;
      arr[userEnum.SEX]=sex;
      this.users.set(userId,arr)  
    }
  
    /**
     * handle logout users. 
     * @param {*} object 
     */
    handleLogOut(object){
      this.deleteUsers(object)
    }
  
    /**
     * handle the creation of deletion of a room.
     * @param {*} object 
     */
    handleCreateOrDeleteRooms(object){
      const [createOrDelete,roomId,emoji,roomName,hasPassword]=object
      if(createOrDelete===deleteEnum.CREATE_ROOM)
      {
        const roomInfo=[emoji,roomName,hasPassword]
        this.rooms[roomId]=roomInfo;
      }else if(createOrDelete===deleteEnum.DELETE_ROOM){
        delete this.rooms[roomId];
      }
      
    }
  
    /**
     * handle the creation of the bot's room.
     * @param {*} object 
     */
    handleMyRoom(object){
      const [roomId,roomCode]=object;
      console.log(object)
      this.myRoom={roomId,roomCode};
    }
  
    /**
     * a virtual function for the message event (OLD)
     * @param {string} message 
     */
    _messageEvent(obj) {
          
     }
  
    _privateMassageEvent(obj){
  
    }
    /**
     * Event before handling commands
     * @param {*} command 
     * @param {*} object 
     */
    beforeUpdate(command,object){
    }
  
    /**
     * Event after handling commands
     * @param {*} command 
     * @param {*} object 
     */
    update(command,object){
    }
  
    //#endregion
   
  //setters
  
  }
  
  
  function isNumeric(str) {
    if (typeof str != "string") return false; // we only process strings!
    return (
      !isNaN(str) && // use type coercion to parse the _entirety_ of the string (parseFloat alone does not do this)...
      !isNaN(parseFloat(str))
    ); // ...and ensure strings of whitespace fail
  }
  

  const guestAllowed=new Set([3,4668])
  
  class ManagerBot extends CatchBot {
    allowGuest = false;
  
    constructor(room, nickNumber, myroom) {
      super(room, nickNumber, myroom);
    }
  
    update(command, Object) {
      switch (command) {
        case commandHandleEnum.HANDLE_MY_ROOM:
          this.actionMoveToRoom(this.myRoom.roomId);
          console.log(this.myRoom);
          break;
        case commandHandleEnum.HANDLE_MOVE_ROOM:
          this.allowGuest || this.RemoveGust(Object);
          break;
  
        // case commandHandleEnum.HANDLE_PRIVATE_MESSAGES:
      }
    }
  
    RemoveGust(object) {
      const [userId, room] = object;
      if (room !== this.myRoom.roomId) {
        return;
      }
      const userToUpdate = this.users.get(userId); 
  
      if (userToUpdate[3]) {
        return
      }
      if(guestAllowed.has(userToUpdate[1])){
        return
      }  
      this.actionRemoveFromRoom(userId);
    }
  
    //TODO REFACTOR THIS SECTION
    //temp until I Will write something better here.
    startCommand = "בוט";
    _privateMassageEvent(obj){
      this._messageEvent(obj)
    }
  
    _messageEvent(obj) {
      const message=obj[1]
      const trimmedMessage = message?.trim();
      if (!message.startsWith(this.startCommand)) {
        return false;
      }
      let command = trimmedMessage.replace(this.startCommand, "")?.trim();
      let paramters;
      [command, ...paramters] = command.split(":");
      switch (command) {
        case "התר אורחים":
          this.allowGuest = true;
          break;
        case "אסור אורחים":
          this.allowGuest = false;
          break;
        case "זוז לחדר":
          this.actionMoveToRoom(Number(paramters[0]));
          break;
        case "תעיף את":
          this.kickOutByNick(paramters[0]);
          break;
        case "שרבע את":
          this.kickOutByNick(paramters[0], true);
          break;
        case "הוסף את":
          this.addGuests(paramters[0])
      }
      return true
    }
  
    kickOutByNick(paramter, per = false) {
      let text = paramter?.trim?.();
      let user = text.replace(/[\[\]]/g, "").replace("@","");
      
      
      const usersArr = Array.from(this.users);
      if (isNumeric(user)) {
        user = Number(user);
      }
      const id = usersArr.find((x) => x?.[1]?.includes?.(user))?.[0];
      if (!id) {
        return;
      }
      this.actionRemoveFromRoom(id, per);
    }
    addGuests(parameter){
      guestAllowed.add(Number(parameter))
    }
  }




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
    maxSpam = 4;
    spamDuration = 3 * 60 * 1000;
    ThreshHold=30
  
    constructor(room, nickNumber, myroom) {
      super(room, nickNumber, myroom);
      this.messageCounter = new MessageCounter(this.spamDuration);
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
      if (message.length < this.ThreshHold) {
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
      if (max >= this.maxSpam) {
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
  
  export default SpamBot
