const express = require("express");
const router = express.Router();
const { parsePDFtoHTML } = require("../services/pdfParserService");

router.get("/parse-pdf", async (req, res) => {
  const fileName = req.query.fileName;
  const localPath = `./downloads/${fileName}`; // assume PDF already downloaded
  const outputHtmlPath = `./downloads/${fileName}.html`;

  try {
    const html = await parsePDFtoHTML(localPath, outputHtmlPath);
    res.send(html); // OR res.json({ html }) if using WebView in frontend
  } catch (err) {
    console.error("Failed to parse PDF:", err.message);
    res.status(500).json({ error: "Failed to parse PDF" });
  }
});

module.exports = router;
