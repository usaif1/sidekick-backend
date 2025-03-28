// routes/paymentRoutes.js
const express = require("express");
const { initiatePayment } = require("../services/easebuzzService");
const router = express.Router();

router.post("/initiate-payment", initiatePayment);

module.exports = router;
