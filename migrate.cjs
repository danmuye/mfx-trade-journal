const admin = require("firebase-admin");
const fs = require("fs");
const csv = require("csv-parser");

const serviceAccount = require("./danmuye-firebase-adminsdk-fbsvc-19b8a8309e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Load Firebase users (email → uid mapping)
const firebaseUsers = {};

async function loadFirebaseUsers() {
  const usersSnapshot = await admin.auth().listUsers();

  usersSnapshot.users.forEach(user => {
    firebaseUsers[user.email] = user.uid;
  });
}

// Example: migrate trades
async function migrateTrades() {
  return new Promise((resolve) => {
    fs.createReadStream("trades_rows.csv")
      .pipe(csv())
      .on("data", async (row) => {
        const email = row.email;
        const uid = firebaseUsers[email];

        if (!uid) return;

        await db.collection("users").doc(uid)
          .collection("trades").add({
            pair: row.pair,
            entry: Number(row.entry),
            profit: Number(row.profit),
            imageUrl: row.imageUrl,
            createdAt: new Date(row.createdAt)
          });
      })
      .on("end", resolve);
  });
}

// Example: migrate user settings
async function migrateSettings() {
  return new Promise((resolve) => {
    fs.createReadStream("trades_with_emails.csv")
      .pipe(csv())
      .on("data", async (row) => {
        const uid = firebaseUsers[row.email];
        if (!uid) return;

        await db.collection("users").doc(uid)
          .collection("trades").add({
            pair: row.pair,
            entry: Number(row.entry),
            profit: Number(row.pnl),
            imageUrl: row.screenshot_url,
            createdAt: new Date(row.created_at)
          });
      })
      .on("end", () => {
        resolve();
      });
  });
}

async function run() {
  await loadFirebaseUsers();
  console.log("Users loaded");

  await migrateTrades();
  console.log("Trades migrated");

  await migrateSettings();
  console.log("Settings migrated");

  console.log("Migration complete");
}

run();