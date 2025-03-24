const express = require("express");
const admin = require("firebase-admin");
require("dotenv").config();

const { createNewUser, createUserWallet } = require("./actions");
const { initializeFirebase } = require("./firebaseAdmin");

initializeFirebase();

const app = express();

// 3. Use middleware to parse JSON bodies if needed
app.use(express.json());

// 4. Test route to confirm server is working
app.get("/", (req, res) => {
  res.send("Hello from Express + Firebase Admin!");
});

app.post("/set-claims", async (req, res) => {
  const { uid, role, full_name, phone_number, email } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "uid is required" });
  }

  const hasuraClaims = {
    "https://hasura.io/jwt/claims": {
      "x-hasura-default-role": role,
      "x-hasura-allowed-roles": [role],
      "x-hasura-user-id": uid,
    },
  };

  try {
    await admin.auth().setCustomUserClaims(uid, hasuraClaims);

    const response = await createNewUser({
      full_name: full_name,
      phone_number: phone_number,
      email: email,
      firebase_id: uid,
    });

    await createUserWallet(response);

    return res.json({
      message: `Hasura claims set for user ${uid}`,
      claims: hasuraClaims,
    });
  } catch (err) {
    console.error("Error setting claims:", err);
    return res
      .status(500)
      .json({ error: "Failed to set custom claims", details: err.message });
  }
});

// 5. Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
