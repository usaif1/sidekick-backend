// services/easebuzzService.js
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { generateEasebuzzHash } = require("../utils/generateHash");
const { URLSearchParams } = require("url");
const Razorpay = require("razorpay");

const initiatePayment = async (req, res) => {
  const { amount, email, phone, firstname } = req.body;

  const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const response = await razorpayInstance.orders.create({
      amount: amount,
      currency: "INR",
      partial_payment: false,
      receipt: uuidv4().toString(),
    });
    console.log("response", response);
    res.send(response);
  } catch (error) {
    console.error("Easebuzz Error:", error);
    res.status(500).send("Payment failed");
  }

  //   const txnId = uuidv4().toString();
  //   const productinfo = "walletrecharge";

  //   const encodedParams = new URLSearchParams({
  //     key: process.env.MERCHANT_KEY,
  //     txnid: txnId,
  //     amount,
  //     productinfo,
  //     firstname,
  //     phone,
  //     email,
  //     surl: "http://localhost:3000",
  //     furl: "http://localhost:3000",
  //     hash: generateEasebuzzHash(
  //       {
  //         key: process.env.MERCHANT_KEY,
  //         txnid: txnId,
  //         amount,
  //         productinfo,
  //         firstname,
  //         email,
  //       },
  //       process.env.MERCHANT_SALT
  //     ),
  //   });

  //   try {
  //     const { data } = await axios.post(
  //       process.env.EASEBUZZ_ENDPOINT,
  //       encodedParams,
  //       {
  //         headers: { "Content-Type": "application/x-www-form-urlencoded" },
  //       }
  //     );
  //     res.send(data);
  //   } catch (err) {
  //   console.error("Easebuzz Error:", err.message);
  //   res.status(500).send("Payment failed");
  //   }
};

module.exports = { initiatePayment };
