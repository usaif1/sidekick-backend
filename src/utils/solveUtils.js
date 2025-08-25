const crypto = require("crypto");

function generateSolveHash(token, preSharedKey) {
  return crypto.createHmac("sha256", preSharedKey).update(token).digest(); // Return buffer for base64 encoding
}

function buildSolveCommandBuffer(hashBuffer) {
  const base64Hash = hashBuffer.toString("base64");
  const command = `#solved ${base64Hash}\r\n`;
  return command;
}

module.exports = { generateSolveHash, buildSolveCommandBuffer }; 