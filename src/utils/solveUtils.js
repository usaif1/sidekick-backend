// solve.js
const crypto = require("crypto");

function generateSolveHash(token, preSharedKey) {
  // Return raw HMAC bytes (Buffer), same as before
  return crypto
    .createHmac("sha256", preSharedKey)
    .update(String(token).trim(), "utf8")
    .digest(); // Buffer
}

function buildSolveCommandBuffer(hashBuffer) {
  // Ajjas expects HEX inside the command (not base64)
  const hexHash = hashBuffer.toString("hex"); // <-- key change
  const command = `#solved ${hexHash}\r\n`;
  return command;
}

module.exports = { generateSolveHash, buildSolveCommandBuffer };
