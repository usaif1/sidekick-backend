const express = require("express");
const {
  getScooterLastSeen,
  startFetchFetchScooterByNumber,
  toggleScooter,
  getScooterStats,
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

router.post("/scooter/lastseen", async (req, res) => {
  const { imei } = req.body;
  try {
    const response = await getScooterLastSeen(imei);
    res.send(response);
  } catch (err) {
    console.error("Error fetching scooter:", err);
    res.status(500).send(false);
  }
});

router.post("/scooter/get-stats", async (req, res) => {
  const { imei, toTime, fromTime } = req.body;
  try {
    const response = await getScooterStats(imei, toTime, fromTime);
    res.send(response);
  } catch (err) {
    console.error("Error fetching scooter stats:", err);
    res.status(500).send(false);
  }
});

module.exports = router;
