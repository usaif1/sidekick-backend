// services/easebuzzService.js
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { generateEasebuzzHash } = require("../utils/generateHash");
const { URLSearchParams } = require("url");

const initiatePayment = async (req, res) => {
  const { amount, email, phone, firstname } = req.body;
  const txnId = uuidv4().toString();
  const productinfo = "walletrecharge";

  const encodedParams = new URLSearchParams({
    key: process.env.MERCHANT_KEY,
    txnid: txnId,
    amount,
    productinfo,
    firstname,
    phone,
    email,
    surl: "http://localhost:3000",
    furl: "http://localhost:3000",
    hash: generateEasebuzzHash(
      {
        key: process.env.MERCHANT_KEY,
        txnid: txnId,
        amount,
        productinfo,
        firstname,
        email,
      },
      process.env.MERCHANT_SALT
    ),
  });

  try {
    const { data } = await axios.post(
      process.env.EASEBUZZ_ENDPOINT,
      encodedParams,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    res.send(data);
  } catch (err) {
    console.error("Easebuzz Error:", err.message);
    res.status(500).send("Payment failed");
  }
};

module.exports = { initiatePayment };
