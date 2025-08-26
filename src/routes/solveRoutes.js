const express = require("express");
const { processSolveRequest } = require("../services/solveService");
const axios = require("axios");
const router = express.Router();

router.get("/solve", async (req, res) => {
  const token = req.query.token;
  const scooterRegNo = req.query.scooterRegNo;

  try {
    const encKey = await axios.post(
      "https://supreme-mustang-86.hasura.app/api/rest/fetchenckey",
      {
        scooterRegNo: scooterRegNo,
      }
    );

    const result = await processSolveRequest(token, encKey);
    console.log(result.command);
    res.json(result);
  } catch (error) {
    console.error("Error processing solve request:", error);
    return res.status(400).json({ error: error.message });
  }

  console.log("token", token);

  // try {
  //   const result = await processSolveRequest(token);
  //   console.log(result.command);
  //   res.json(result);
  // } catch (error) {
  //   console.error("Error processing solve request:", error);
  //   return res.status(400).json({ error: error.message });
  // }
});

module.exports = router;
