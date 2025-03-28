const express = require("express");
const admin = require("firebase-admin");
const {
  createNewUser,
  createUserWallet,
} = require("../services/hasuraService");
const router = express.Router();

router.post("/set-claims", async (req, res) => {
  const { uid, role, full_name, phone_number, email } = req.body;
  if (!uid) return res.status(400).json({ error: "uid is required" });

  const hasuraClaims = {
    "https://hasura.io/jwt/claims": {
      "x-hasura-default-role": role,
      "x-hasura-allowed-roles": [role],
      "x-hasura-user-id": uid,
    },
  };

  try {
    await admin.auth().setCustomUserClaims(uid, hasuraClaims);
    const userId = await createNewUser({
      full_name,
      phone_number,
      email,
      firebase_id: uid,
    });
    await createUserWallet(userId);

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

module.exports = router;
