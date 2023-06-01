const CatchBot = require("./catchBot");
// const song= require('../list')
const { shuffle } = require("../utils");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const DELAY = 10 * 1000;
const zeroWidthSpace = "\u200B";
const song = [
  "במקדש החתולים העתיק אוף צ'אן רקדה את טקס החתול הקדוש וזכתה להפוך למלכת החתולים ו וגם לכוחות גדולים",
  "לפני שנים רבות... הביזונות חיו בהרמוניה... עד ששד היקומים ההומואי החליט לתקוף",
  "אנג בשטח✔✔✔✔היקום לא במתח 👁👁👁👁הצלחה מובטחת🐈🐈🐈לחתולות💯💯💯💯💯",
  "ביזונה ריקוד שמח ביזונה ריקוד שמח ביזונה ריקוד שמח ביזונה ריקוד שמח ביזונה ריקוד שמח ביזונה ריקוד שמח ביזונה ריקוד שמח ביזונה ריקוד שמח",
  "בינוזה חמשליתבינוזה חמשליתבינוזה חמשליתבינוזה חמשליתבינוזה חמשליתבינוזה חמשליתבינוזה חמשליתבינוזה חמשליתבינוזה חמשליתבינוזה חמשלית",
  "השמד יתוש!!!!!! סוף ליתוש!!! השמד יתוש!!!!!! סוף ליתוש!!! השמד יתוש!!!!!! סוף ליתוש!!! השמד יתוש!!!!!! סוף ליתוש!!! השמד יתוש!!!!!! סוף ליתוש!!! השמד יתוש!!!!!! סוף ליתוש!!! השמד יתוש!!!!!! סוף ליתוש!!! השמד יתוש!!!!!! סוף ליתוש!!! השמד יתוש!!!!!! סוף ליתוש!!!",
  "שיבוט משובט חתולי מחויט🥳🥳🥳🥳🥳שיבוט משובט חתולי מחויט🥳🥳🥳🥳🥳שיבוט משובט חתולי מחויט🥳🥳🥳🥳🥳ש",
  "ביזונות עירך קודמים! ביזונות עירך קודמים! ביזונות עירך קודמים! ביזונות עירך קודמים!",
  "כבד את חתולייך ואת ביזונך למען יאריכון רגלייך!כבד את חתולייך ואת ביזונך למען יאריכון רגלייך!כבד את חתולייך ואת ביזונך למען יאריכון רגלייך!כבד את חתולייך ואת ביזונך למען יאריכון רגלייך!",
  "מי עייף לעכשיו, מי תקול לעכשיו, מי פיתה לעכשיו, מי הפצה לעכשיו, מי גבין עבש, מי איש גועש מי עייף לעכשיו, מי תקול לעכשיו, מי פיתה לעכשיו, מי הפצה לעכשיו, מי גבין עבש, מי איש גועש",
  "למה הבאת לי גבין??? את יודעת שאני אוהב גביןןן!!!!@@&₪@₪&@&₪@ איזה מין דבר זה להביא לי משהו שאני אוהבלמה הבאת לי גבין??? את יודעת שאני אוהב גביןןן!!!!@@&₪@₪&@&₪@ איזה מין דבר זה להביא לי משהו שאני אוהב",
  "אספרטיים ומונוסודיום גלוטומט ידועים לשמצה כמפעילי כאבי אש ומיגרנות",
  "אני חייזר גנדרפלואידי ללא איברי חישה ואני עושה פוטוסינטזה להתקיים באתי להשתלט על העולם אני סיווג 007 המוסד שלח אותי לשים לכם שבב בחיסון פייזר",
];

class DND extends CatchBot {
  constructor(room, nickNumber) {
    super(room, nickNumber);
  }

  async sendSong(arrayOfSongs) {
    for (const iterator of arrayOfSongs) {
      this.actionWrite(iterator.substring(0, 100), "00a67c");
      await delay(DELAY);
    }
  }
}

async function test() {
  const s = new DND(1, 4444);
  await s.setterWs();
  // const nick="OoFeis\u200Aty"
  s.actionUpdateUser("מציפים עם חתול", 21, 2, "A0iEG");
  // s.actionMoveToRoom(1);
  while (true) {
    // const song = [
    //   "I swallowed shampoo, I'm probably gonna die ",
    //   "It smelled like fruit, that was a lie",
    //   "Called the number on the bottom, spoke to a guy",
    //   "He said vomit, I said why? He said POISON, I said goodbye",
    //   "I look at my finger, I look at my life",
    //   "I SWALLOWEDDD SHAMPOOOO, I'M PROBABLY GONNA DIEEE",
    //   "IT SMELLED LIKE FRUITTTT, THAT WAS A LIEEE",
    //   "I SWALLOWEDDD SHAMPOOOO, I'M PROBABLY GONNA DIEEE",
    //   "IT SMELLED LIKE FRUIT, THAT WAS A LIE",
    //   "I SWALLOWED SHAMPOO, I'M PROBABLY GONNA DIE",
    //   "It wasn't that much, I'll probably be fine",
    //   "I look at my finger, I look at my life",
    //   "He said vomit, I said why? He said POISON, I said goodbye",
    // ];
    shuffle(song)
    await s.sendSong(song);
  }
}
test();

// while(!s.connected){
// }
// s.write("hello")
