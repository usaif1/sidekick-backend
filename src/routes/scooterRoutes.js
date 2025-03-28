const express = require("express");
const { startFetchFetchScooterByNumber } = require("../services/hasuraService");
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

module.exports = router;
