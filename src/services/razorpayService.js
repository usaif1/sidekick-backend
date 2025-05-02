// services/easebuzzService.js
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
// const { generateEasebuzzHash } = require("../utils/generateHash");
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
};

module.exports = { initiatePayment };
