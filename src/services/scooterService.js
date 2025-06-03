const axios = require("axios");
const { graphqlRequest } = require("../utils/hasuraRequest");

const ajjasClient = axios.create({
  baseURL: process.env.AJJAS_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.AJJAS_API_KEY,
  },
  timeout: 10000,
});

const startFetchFetchScooterByNumber = async (_ilike) => {
  const query = `
      query fetchScooterByNumber($_ilike: String!) {
        scooters(where: { registration_number: { _ilike: $_ilike } }) {
          registration_number
          id
        }
      }
    `;
  const variables = { _ilike };
  const result = await graphqlRequest(query, variables);
  return result.data.scooters[0];
};

const toggleScooter = async (imei, immobilize) => {
  const numericImei = parseInt(imei);

  try {
    const response = await ajjasClient.post("/immobilize", {
      imei: numericImei,
      immobilize: immobilize,
    });

    console.log("response", response.data);

    if (response.data.message === "OK") {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error toggling scooter:", error);
    return false;
  }
};

module.exports = {
  startFetchFetchScooterByNumber,
  toggleScooter,
};
