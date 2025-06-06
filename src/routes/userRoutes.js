const express = require("express");
const admin = require("firebase-admin");
const {
  createNewUser,
  createUserWallet,
  createUserOrg,
  createOrganization,
  createOrganizationWallet,
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

router.post("/set-claims/org", async (req, res) => {
  const { uid, role, name, email } = req.body;

  if (!uid || !role || !name || !email) {
    return res
      .status(400)
      .json({ error: "`uid`, `role`, `name` and `email` are required" });
  }

  try {
    // 1. Create Organization row in Hasura
    console.log("[create-org] Creating organization with:", { name, email });
    const orgId = await createOrganization({ name, email });
    console.log("[create-org] Created org with id:", orgId);

    // 2. Now set Firebase custom claims, including the new orgId
    const hasuraClaims = {
      "https://hasura.io/jwt/claims": {
        "x-hasura-default-role": role,
        "x-hasura-allowed-roles": [role],
        "x-hasura-user-id": uid,
        "x-hasura-organization-id": orgId,
      },
    };
    console.log("[set-claims] Setting custom claims:", hasuraClaims);
    await admin.auth().setCustomUserClaims(uid, hasuraClaims);
    console.log("[set-claims] Claims set successfully for user:", uid);

    // 3. Create the organization-wallet (if you have a separate table)
    console.log("[create-org-wallet] Creating wallet for orgId:", orgId);
    await createOrganizationWallet(orgId);
    console.log("[create-org-wallet] Wallet created for orgId:", orgId);

    return res.json({
      message: `Organization created and claims set for user ${uid}`,
      organization_id: orgId,
      claims: hasuraClaims,
    });
  } catch (err) {
    console.error("[set-claims/org] Error:", err);
    return res.status(500).json({
      error: "Failed to create org or set claims",
      details: err.message,
    });
  }
});

module.exports = router;
