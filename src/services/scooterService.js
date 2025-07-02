const axios = require("axios");
const { graphqlRequest } = require("../utils/hasuraRequest");

const ajjasClient = axios.create({
  baseURL: process.env.AJJAS_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.AJJAS_API_KEY,
  },
  timeout: 100000,
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
      return {
        success: true,
        message: "Scooter immobilized",
        data: response.data,
      };
    }
    return {
      success: false,
      message: "Failed to immobilize scooter",
      data: response.data,
    };
  } catch (error) {
    console.error("Error toggling scooter:", error);
    return {
      success: false,
      message: "Failed to immobilize scooter",
      data: error,
    };
  }
};

const getScooterLastSeen = async (imei) => {
  try {
    const numericImei = parseInt(imei);
    const response = await ajjasClient.get(`/lastseen/`, {
      params: {
        imei: numericImei,
      },
    });

    if (response.data.message === "OK") {
      return {
        success: true,
        message: "Scooter last seen",
        data: response.data,
      };
    }

    return {
      success: false,
      message: "Failed to get scooter last seen",
      data: response.data,
    };
  } catch (error) {
    console.error("Error getting scooter last seen:", error);
    return {
      success: false,
      message: "Failed to get scooter last seen",
      data: error,
    };
  }
};

const getScooterStats = async (imei, toTime, fromTime) => {
  try {
    const numericImei = parseInt(imei);
    const response = await ajjasClient.get(`/dailyStats/`, {
      params: {
        imei: numericImei,
        toTs: toTime,
        fromTs: fromTime,
      },
    });

    return {
      success: true,
      message: "Scooter stats",
      data: response.data,
    };
  } catch (error) {
    console.error("Error getting scooter stats:", error);
    return {
      success: false,
      message: "Failed to get scooter stats",
      data: error,
    };
  }
};

module.exports = {
  startFetchFetchScooterByNumber,
  toggleScooter,
  getScooterLastSeen,
  getScooterStats,
};
