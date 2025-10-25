// 📁 services/decryptService.js
const crypto = require("crypto");
require("dotenv").config();

const AES_SECRET_KEY = process.env.AES_SECRET_KEY || "12345678901234567890123456789012"; // 32 bytes
const AES_IV = process.env.AES_IV || "abcdefghijklmnop"; // 16 bytes

function decryptData(encryptedText) {
  try {

    // console.log(encryptedText)
    const decipher = crypto.createDecipheriv("aes-128-cbc", AES_SECRET_KEY, AES_IV);
    let decrypted = decipher.update(encryptedText, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("❌ AES decryption failed:", err.message);
    return null;
  }
}

module.exports = { decryptData };