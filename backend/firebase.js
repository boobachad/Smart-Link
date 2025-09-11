// firebase.js
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
try {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccountString) {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    const serviceAccount = JSON.parse(serviceAccountString);
    if (serviceAccount.project_id) {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }
    } else {
      console.log("Firebase Admin SDK not initialized. 'project_id' is missing from FIREBASE_SERVICE_ACCOUNT.");
    }
  }
  else {
    console.log("Firebase Admin SDK not initialized. FIREBASE_SERVICE_ACCOUNT is not set.");
  }
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error.message);
}

module.exports = admin;