const CatchBot = require("./HandlesAndActionsBot");

function isNumeric(str) {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (parseFloat alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

/**
 * An enumeration of possible command actions.
 * @readonly
 * @enum {number}
 */
const commandHandleEnum = {
  INI: 10,
  HANDLE_PRIVATE_MESSAGES: 1,
  MESSAGE_HANDLER: 2,
  HANDLE_MOVE_ROOM: 3,
  HANDLE_UPDATE_USER: 4,
  HANDLE_INCOMING_USERS: 5,
  HANDLE_LOG_OUT: 6,
  HANDLE_CREATE_ROOM: 13,
  HANDLE_MY_ROOM: 14,
};

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

// async function startGame() {
//   const myBot = new ManagerBot(3291, 333,);
//   await myBot.setterWs();
//   myBot.actionUpdateUser("HOLA", 88, 1, "9v1q5");
//   myBot.actionToCreateRoom("👋", "כייייין");
//   // myBot.actionMoveToRoom(936)
// }

// startGame();

module.exports=ManagerBot
