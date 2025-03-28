const axios = require("axios");
require("dotenv").config();

async function graphqlRequest(query, variables = {}) {
  const response = await axios.post(
    process.env.HASURA_URL,
    { query, variables },
    {
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_SECRET,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

module.exports = { graphqlRequest };
