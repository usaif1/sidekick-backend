// solve.js (drop-in)
const crypto = require("crypto");

function isHex(str) {
  return typeof str === "string" && str.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(str);
}

function generateSolveHash(token, preSharedKey) {
  const t = String(token).trim();
  const k = String(preSharedKey).trim();

  // If the token looks hex, treat it as raw bytes; else as UTF-8 text
  const msg = isHex(t) ? Buffer.from(t, "hex") : Buffer.from(t, "utf8");
  // If the key looks hex, treat it as raw bytes; else as UTF-8 text
  const key = isHex(k) ? Buffer.from(k, "hex") : Buffer.from(k, "utf8");

  // Return raw HMAC bytes (Buffer) – same return type as your original
  return crypto.createHmac("sha256", key).update(msg).digest();
}

function buildSolveCommandBuffer(hashBuffer) {
  // Ajjas expects HEX inside the command
  const hexHash = hashBuffer.toString("hex"); // lowercase hex (64 chars)
  const command = `#solved ${hexHash}\r\n`;
  return command;
}

module.exports = { generateSolveHash, buildSolveCommandBuffer };
