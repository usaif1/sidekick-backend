const express = require("express");
const {
  startFetchFetchScooterByNumber,
  toggleScooter,
} = require("../services/scooterService");
const router = express.Router();

router.get("/scooter", async (req, res) => {
  const { regno } = req.query;
  try {
    const scooter = await startFetchFetchScooterByNumber(regno);
    res.send(!!scooter);
  } catch (err) {
    console.error("Error fetching scooter:", err);
    res.status(500).send(false);
  }
});

router.post("/scooter/toggle", async (req, res) => {
  const { imei, immobilize } = req.body;
  try {
    const response = await toggleScooter(imei, immobilize);
    res.send(response);
  } catch (err) {
    console.error("Error toggling scooter:", err);
    res.status(500).send(false);
  }
});

module.exports = router;
