const express = require("express");
const { processSolveRequest } = require("../services/solveService");
const axios = require("axios");
const { graphqlRequest } = require("../utils/hasuraRequest");
const router = express.Router();

router.get("/solve", async (req, res) => {
  const token = req.query.token;
  const scooterRegNo = req.query.scooterRegNo;

  console.log("token", token);
  console.log("scooterRegNo", scooterRegNo);

  try {
    // const encKey = await axios.post(
    //   "https://supreme-mustang-86.hasura.app/api/rest/fetchenckey",
    //   {
    //     regNo: scooterRegNo,
    //   }
    // );

    const query = `query fetchEncKey($regNo: String = "SK01FL0009") {
  scooters(where: {registration_number: {_eq: $regNo}}) {
    enc_key
  }
}`;

    const variables = { regNo: scooterRegNo };

    const response = await graphqlRequest(query, variables);
    const encKey = response.data.scooters[0].enc_key;

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
