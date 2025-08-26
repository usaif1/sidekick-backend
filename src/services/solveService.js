const {
  generateSolveHash,
  buildSolveCommandBuffer,
} = require("../utils/solveUtils");

async function processSolveRequest(token, encKey) {
  const PRE_SHARED_KEY = encKey;

  if (!PRE_SHARED_KEY) {
    throw new Error("PRE_SHARED_KEY environment variable is not set");
  }

  if (!token) {
    throw new Error("Token is required");
  }

  const hash = generateSolveHash(token, PRE_SHARED_KEY);
  const commandBuffer = buildSolveCommandBuffer(hash);

  return { command: commandBuffer };
}

module.exports = { processSolveRequest };
