const express = require("express");
const admin = require("firebase-admin");
const {
  createNewUser,
  createUserWallet,
  createUserOrg
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

router.post("/set-claims/org-user", async (req, res) => {
  const { uid, role, full_name, phone_number, email, organization_id } = req.body;

  if (!uid || !organization_id || !role) {
    return res.status(400).json({ error: "uid, role, and organization_id are required" });
  }

  try {
    // 1. Set Firebase claims
    const hasuraClaims = {
      "https://hasura.io/jwt/claims": {
        "x-hasura-default-role": role,
        "x-hasura-allowed-roles": [role],
        "x-hasura-user-id": uid,
        "x-hasura-organization-id": organization_id,
      },
    };
    await admin.auth().setCustomUserClaims(uid, hasuraClaims);

    // 2. Create user
    const userId = await createNewUser({
      full_name,
      phone_number,
      email,
      firebase_id: uid,
    });

    // 3. Create user_organization link
    console.log("Creating user_organization link...");
    await createUserOrg({
      user_id: userId,
      organization_id,
    });

    // 4. Create wallet
    await createUserWallet(userId);

    return res.json({
      message: `User and user_organization created, and claims set for user ${uid}`,
      claims: hasuraClaims,
    });
  } catch (err) {
    console.error("Error setting claims:", err);
    return res.status(500).json({ error: "Failed to set custom claims", details: err.message });
  }
});


module.exports = router;