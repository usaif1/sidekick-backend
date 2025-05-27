const express = require("express");
const { processSolveRequest } = require("../services/solveService");
const router = express.Router();

router.get("/solve", async (req, res) => {
  const token = req.query.token;

  console.log("token", token);

  try {
    const result = await processSolveRequest(token);
    console.log(result.command);
    res.json(result);
  } catch (error) {
    console.error("Error processing solve request:", error);
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router; 