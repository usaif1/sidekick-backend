// utils/generateHash.js
const { sha512 } = require("js-sha512");

function generateEasebuzzHash(data, salt) {
  const { key, txnid, amount, productinfo, firstname, email } = data;
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
  return sha512(hashString);
}

module.exports = { generateEasebuzzHash };
