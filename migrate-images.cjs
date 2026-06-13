const admin = require("firebase-admin");
const axios = require("axios");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

// 🔴 Load service account
const serviceAccount = require("./danmuye-firebase-adminsdk-fbsvc-19b8a8309e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "danmuye.appspot.com"
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Map emails → UID (same as before)
let firebaseUsers = {};

async function loadFirebaseUsers() {
  const listUsers = await admin.auth().listUsers(1000);
  listUsers.users.forEach(user => {
    firebaseUsers[user.email] = user.uid;
  });
}

// Download image
async function downloadImage(url, filePath) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream"
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

// Upload to Firebase
async function uploadToFirebase(localPath, destination) {
  await bucket.upload(localPath, {
    destination,
    public: true
  });

  return `https://storage.googleapis.com/${bucket.name}/${destination}`;
}

// Main migration
async function migrateImages() {
  return new Promise((resolve) => {
    fs.createReadStream("trades_with_emails.csv")
      .pipe(csv())
      .on("data", async (row) => {
        try {
          const email = row.email;
          const uid = firebaseUsers[email];
          const imageUrl = row.screenshot_url;

          if (!uid || !imageUrl) return;

          const fileName = `${Date.now()}-${Math.random()}.jpg`;
          const tempPath = path.join(__dirname, fileName);
          const firebasePath = `screenshots/${uid}/${fileName}`;

          console.log("Processing:", email);

          // 1. Download from Supabase
          await downloadImage(imageUrl, tempPath);

          // 2. Upload to Firebase
          const newUrl = await uploadToFirebase(tempPath, firebasePath);

          // 3. Save in Firestore
          await db.collection("users")
            .doc(uid)
            .collection("trades")
            .add({
              pair: row.pair,
              entry: Number(row.entry),
              profit: Number(row.pnl),
              imageUrl: newUrl,
              createdAt: new Date(row.created_at)
            });

          // Cleanup
          fs.unlinkSync(tempPath);

        } catch (err) {
          console.error("Error:", err.message);
        }
      })
      .on("end", () => {
        console.log("Image migration complete");
        resolve();
      });
  });
}

// Run
async function run() {
  await loadFirebaseUsers();
  console.log("Users loaded");

  await migrateImages();
}

run();