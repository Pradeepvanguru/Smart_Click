const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const multer = require("multer");
const Authentication =require('../middleware/AuthMiddleWare')



// Use 'fs' for mkdirSync and existsSync
const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const userEmail = req.userEmail || 'unknown_user'; // Fallback if not available
    const sanitizedEmail = userEmail.replace(/[@.]/g, '_'); // Avoid invalid filename characters
    const timestamp = Date.now();
    const originalName = file.originalname;

    const fileName = `${sanitizedEmail}_${timestamp}-${originalName}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage }).single('resume');



const sendEmails = (req, res) => {
  isCancelled = false;
  upload(req, res, async function (err) {
    if (isCancelled) {
      console.log("⛔ Process cancelled by user");
      return;
    }

    if (err) {
      console.error("Multer Error:", err);
      return res.status(500).json({ message: "File upload failed", error: err });
    }

    const { subject, template, email, collectionName } = req.body;

    if (!subject || !template || !req.file || !collectionName) {
      return res.status(400).json({ message: "Subject, template, file, and collectionName are required" });
    }

    const extension = path.extname(req.file.originalname).toLowerCase();
    if (extension !== ".pdf") {
      return res.status(400).json({ message: "Only PDF files are supported as resume" });
    }

    try {
      let DynamicModel;
      if (mongoose.models[collectionName]) {
        DynamicModel = mongoose.model(collectionName);
      } else {
        const genericSchema = new mongoose.Schema({}, { strict: false });
        DynamicModel = mongoose.model(collectionName, genericSchema, collectionName);
      }

      const data = await DynamicModel.find({}).lean();

      if (data.length === 0) {
        return res.status(400).json({ message: "No data found in the collection" });
      }

      // Initialize email sending process
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const filePath = path.join(__dirname, "../uploads", req.file.filename);
      let emailsSent = 0;
      const totalEmails = data.length;
      // Send initial response with estimated time
<<<<<<< HEAD
      res.status(200).json({ estimatedTime: totalEmails * 2, totalEmails: totalEmails,emailsent:emailsSent });
=======
      res.status(200).json({ estimatedTime: totalEmails * 6, totalEmails: totalEmails,emailsent:emailsSent });
>>>>>>> 646642111932e87d2d253d391f23d9f58cafc653

      // Continue with email sending process
      for (const hr of data) {
        if (isCancelled) {
          console.log("⛔ Process cancelled by user");
          return;
        }
        

        const personalizedTemplate = template.replace(/\[([^\]]+)\]/g, (_, key) => hr[key.trim()] || "");

        const mailOptions = {
          from: `"${email}" <${process.env.EMAIL_USER}>`,
          to: hr.email,
          subject,
          html: personalizedTemplate,
          attachments: [{ filename: req.file.originalname, path: filePath }],
        };

        try {
          await transporter.sendMail(mailOptions);
          emailsSent++;
          console.log(`✅ Email sent to ${hr.email} (${emailsSent}/${totalEmails})`);

        } catch (emailErr) {
          console.error(`❌ Failed to send email to ${hr.email}`, emailErr);
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
     
      console.log("✅ All emails sent.");
      
    } catch (err) {
      console.error("Error:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Internal error", error: err.message });
      }
    }
});
};



// Cancel operation
const cancelEmailProcess = (req, res) => {
  isCancelled = true;
  res.json({ message: "Email sending process cancelled" });
};

const getDynamicKeys = (req, res) => {
  const { collectionName } = req.query;
  if (!collectionName) {
    return res.status(400).json({ message: "Missing collectionName" });
  }

  const uploadsDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadsDir)) {
    return res.status(404).json({ message: "Uploads folder does not exist." });
  }

  // Extract email from collection name
  const match = collectionName.match(/^collection_(.+)_\d+$/);
  if (!match || !match[1]) {
    return res.status(400).json({ message: "Invalid collectionName format" });
  }

  const userEmail = match[1]; // e.g., vangurupradeep123@gmail.com
  const sanitizedEmail = userEmail.replace(/[@.]/g, '_');

  // Find all matching CSV files
  const files = fs.readdirSync(uploadsDir)
    .filter(f => f.endsWith(".csv") && f.startsWith(sanitizedEmail))
    .map(f => ({
      name: f,
      time: fs.statSync(path.join(uploadsDir, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time); // Most recent first

  if (files.length === 0) {
    return res.status(404).json({ message: `No CSV files found for user: ${userEmail}` });
  }

  const latestFile = path.join(uploadsDir, files[0].name);

  fs.createReadStream(latestFile)
    .pipe(csv())
    .on("headers", (headerList) => {
      res.json({ keys: headerList });
    })
    .on("error", (err) => {
      console.error("Error reading CSV:", err);
      res.status(500).json({ message: "Error reading CSV file." });
    });
};







module.exports = { sendEmails, cancelEmailProcess,getDynamicKeys };
