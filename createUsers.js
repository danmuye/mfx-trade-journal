const admin = require("firebase-admin");
const serviceAccount = require("./danmuye-firebase-adminsdk-fbsvc-19b8a8309e.json"); // from Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const users = [
  { email: "abdulsalamaliyu154@gmail.com" },
  { email: "ahmadhussaini752@gmail.com" },
  { email: "dambazau1996@gmail.com" },
  { email: "danmuyespp@yahoo.com" },
  { email: "hussainialmugafai@gmail.com" },
  { email: "itzarms696@gmail.com" },
  { email: "muhammadabdulwahid24@gmail.com" },
  { email: "musamahmud11@gmail.com" },
  { email: "nmoyususf@gmail.com" },
  { email: "officalakfinalbaba@gmail.com" },
  { email: "sadiqsaniahmad8@gmail.com" },
  { email: "usman90743@gmail.com" },
  { email: "usmanmahmudson@gmail.com" },
  { email: "usmanshamsu847@gmail.com" },
];

async function createUsers() {
  for (const user of users) {
    try {
      const res = await admin.auth().createUser({
        email: user.email,
      });

      console.log(user.email, "→", res.uid);
    } catch (err) {
      console.log("Error:", user.email, err.message);
    }
  }
}

createUsers();