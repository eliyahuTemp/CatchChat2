const CatchBot = require("./catchBot")

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



async function startGame() {
  const myBot = new HandlesAndActionsBot(3291, 333,);
  await myBot.setterWs();
  console.log("OK")
  myBot.actionUpdateUser("HOLA", 88, 1, "9v1q5");
  // myBot.actionToCreateRoom("👋", "כייייין");
  // myBot.actionMoveToRoom(936)
}

startGame();



module.exports = HandlesAndActionsBot
