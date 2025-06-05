const express = require("express");
const admin = require("firebase-admin");
const {
  createNewUser,
  createUserWallet,
  createUserOrg,
  createEmployee,
  checkUserExists,
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
  const { uid, role, full_name, phone_number, email, organization_id } =
    req.body;

  if (!uid || !organization_id || !role) {
    return res
      .status(400)
      .json({ error: "uid, role, and organization_id are required" });
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
    return res
      .status(500)
      .json({ error: "Failed to set custom claims", details: err.message });
  }
});

router.post("/create-org-user", async (req, res) => {
  const { full_name, phone_number, email, organization_id, employeeId } =
    req.body;

  if (!full_name || !phone_number || !organization_id || !employeeId) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newEmployee = await createEmployee({
      full_name,
      phone_number,
      email,
      organization_id,
      employeeId,
    });

    res
      .status(200)
      .json({ success: true, data: newEmployee, message: "User created" });
  } catch (error) {
    console.error("Error in createEmployee:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create user",
      details: error.message,
    });
  }
});

router.post("/user-exists", async (req, res) => {
  const { phone_number } = req.body;
  if (!phone_number) {
    return res.status(400).json({ error: "phone_number is required" });
  }

  try {
    const user = await checkUserExists(phone_number);

    if (!user) {
      return res
        .status(200)
        .json({ success: false, data: null, message: "User does not exist" });
    }

    return res
      .status(200)
      .json({ success: true, data: user, message: "User already exists" });
  } catch (error) {
    console.error("Error in checkUserExists:", error);
    return res.status(200).json({
      success: false,
      error: "User does not exist",
      data: null,
    });
  }
});

module.exports = router;
