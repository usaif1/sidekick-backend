const express = require("express");
const admin = require("firebase-admin");
const axios = require("axios");
const sha512 = require("js-sha512");
const CryptoJS = require("crypto-js");
const qs = require("querystring");

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
// app.post("/txnkey", async (req, res) => {
//   const { amount, email, phone, firstname } = req.body;
//   console.log("body =>", amount, email, phone, firstname);

//   const merchantKey = "CI3E63WOM";
//   const merchantSalt = "IH40QYYUR";
//   const txnId = uuidv4().toString();
//   const productinfo = "Wallet recharge for ride";
//   const initiateTxnEndpoint = "https://pay.easebuzz.in/payment/initiateLink";
//   // "https://testpay.easebuzz.in/payment/initiateLink";

//   const paymentHash = `${merchantKey}|${txnId}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${merchantSalt}`;

//   const data = {
//     key: merchantKey,
//     txnid: txnId,
//     amount: amount,
//     email: email,
//     phone: phone,
//     firstname: firstname,
//     udf1: "",
//     udf2: "",
//     udf3: "",
//     udf4: "",
//     udf5: "",
//     productinfo: "test",
//     udf6: "",
//     udf7: "",
//     udf8: "",
//     udf9: "",
//     udf10: "",
//     furl: "http://localhost:3000/response",
//     surl: "http://localhost:3000/response",
//     hash: sha512(paymentHash),
//     unique_id: "",
//     split_payments: "",
//     sub_merchant_id: "",
//     customer_authentication_id: "",
//   };

//   try {
//     const transactionResult = await axios.post(initiateTxnEndpoint, data, {
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//     });

//     res.send(transactionResult.data);
//   } catch (error) {
//     console.error("Error creating transaction key", error?.message);
//     res.send("error initiating transaction");
//   }
// });

app.post("/initiate-payment", async (req, res) => {
  const merchantKey = "CI3E63WOM";
  const salt = "IH40QYYUR"; // WARNING: Never expose salt publicly
  const env = "test";

  // Generate transaction ID
  const txnid = `TXN${Date.now()}`;

  // Raw values for hash generation
  const rawParams = {
    key: merchantKey,
    txnid: txnid,
    amount: "10.00",
    firstname: "John Doe",
    email: "john@example.com",
    phone: "9876543210",
    productinfo: "Test Product",
    udf1: "",
    udf2: "",
    udf3: "",
    udf4: "",
    udf5: "",
    udf6: "",
    udf7: "",
    udf8: "",
    udf9: "",
    udf10: "",
  };

  // Generate hash in EXACT order
  const hashString = [
    rawParams.key,
    rawParams.txnid,
    rawParams.amount,
    rawParams.firstname,
    rawParams.email,
    rawParams.udf1,
    rawParams.udf2,
    rawParams.udf3,
    rawParams.udf4,
    rawParams.udf5,
    rawParams.udf6,
    rawParams.udf7,
    rawParams.udf8,
    rawParams.udf9,
    rawParams.udf10,
    salt,
  ].join("|");

  const hash = CryptoJS.SHA512(hashString).toString(CryptoJS.enc.Hex);

  // Prepare final request data with URL encoding
  const requestData = {
    ...rawParams,
    surl: "http://yourdomain.com/success",
    furl: "http://yourdomain.com/failure",
    hash: hash,
  };

  try {
    const response = await axios.post(
      "https://testdashboard.easebuzz.in/payment/initiateLink",
      qs.stringify(requestData), // Encode here
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Handle response
    if (response.data.status === 1) {
      res.send(response.data.data);
    } else {
      res.status(400).json({
        error: "Easebuzz Error",
        message: response.data.message,
      });
    }
  } catch (error) {
    console.error("Full Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Payment Failed",
      debug: {
        generatedHash: hash,
        serverMessage: error.response?.data,
      },
    });
  }
});
