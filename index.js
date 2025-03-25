const express = require("express");
const admin = require("firebase-admin");
const axios = require("axios");
const sha512 = require("js-sha512");

const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

const { createNewUser, createUserWallet } = require("./actions");
const { initializeFirebase } = require("./firebaseAdmin");

initializeFirebase();

const app = express();
app.use(express.urlencoded({ extended: true }));

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

// wallet
app.post("/txnkey", async (req, res) => {
  const { amount, email, phone, firstname } = req.body;
  console.log("body =>", amount, email, phone, firstname);

  const merchantKey = "CI3E63WOM";
  const merchantSalt = "IH40QYYUR";
  const txnId = uuidv4().toString();
  const productinfo = "Wallet recharge for ride";
  const initiateTxnEndpoint = "https://pay.easebuzz.in/payment/initiateLink";
  // "https://testpay.easebuzz.in/payment/initiateLink";

  const paymentHash = `${merchantKey}|${txnId}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${merchantSalt}`;

  const data = {
    key: merchantKey,
    txnid: txnId,
    amount: amount,
    email: email,
    phone: phone,
    firstname: firstname,
    udf1: "",
    udf2: "",
    udf3: "",
    udf4: "",
    udf5: "",
    productinfo: "test",
    udf6: "",
    udf7: "",
    udf8: "",
    udf9: "",
    udf10: "",
    furl: "http://localhost:3000/response",
    surl: "http://localhost:3000/response",
    hash: sha512(paymentHash),
    unique_id: "",
    split_payments: "",
    sub_merchant_id: "",
    customer_authentication_id: "",
  };

  try {
    const transactionResult = await axios.post(initiateTxnEndpoint, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    res.send(transactionResult.data);
  } catch (error) {
    console.error("Error creating transaction key", error?.message);
    res.send("error initiating transaction");
  }
});
