const admin = require("firebase-admin");
// const fetch = require("node-fetch"); // or native fetch if using Node 18+
require("dotenv").config();

let firebaseApp;

async function initializeFirebase() {
  if (admin.apps.length > 0) return admin.app();

  // Step 1: Download the service account file from Supabase

  const fileUrl = process.env.FIREBASE_SERVICE_ACCOUNT_URL;

  const response = await fetch(fileUrl, {
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch service account key: ${response.statusText}`
    );
  }

  const serviceAccount = await response.json();

  // Step 2: Initialize Firebase Admin
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("✅ Firebase Admin initialized");
  return firebaseApp;
}

module.exports = { initializeFirebase };
