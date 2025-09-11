// firebase.js
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
try {
  let serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (serviceAccount.project_id) {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }
    } else {
      console.log("Firebase Admin SDK not initialized. 'project_id' is missing from FIREBASE_SERVICE_ACCOUNT.");
    }
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error.message);
}

module.exports = admin;