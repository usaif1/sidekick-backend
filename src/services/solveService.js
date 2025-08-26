const {
  generateSolveHash,
  buildSolveCommandBuffer,
} = require("../utils/solveUtils");

async function processSolveRequest(token, encKey) {
  if (!token) {
    throw new Error("Token is required");
  }

  const hash = generateSolveHash(token, encKey);
  const commandBuffer = buildSolveCommandBuffer(hash);

  return { command: commandBuffer };
}

module.exports = { processSolveRequest };
