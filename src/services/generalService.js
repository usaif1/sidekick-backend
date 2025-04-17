// services/pdfParserService.js
const { exec } = require("child_process");
const fs = require("fs");

function parsePDFtoHTML(pdfPath, outputHtmlPath) {
  return new Promise((resolve, reject) => {
    const command = `pdf2htmlEX --zoom 1.3 "${pdfPath}" "${outputHtmlPath}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Error converting PDF to HTML:", stderr);
        reject(error);
      } else {
        const htmlContent = fs.readFileSync(outputHtmlPath, "utf8");
        resolve(htmlContent);
      }
    });
  });
}

modules.export = {
  parsePDFtoHTML,
};
