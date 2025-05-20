const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fsp = require('fs/promises');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const path = require('path');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Authentication =require('../middleware/AuthMiddleWare')



const router = express.Router();

// MongoDB setup
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedEmail = req.userEmail.replace(/[@.]/g, '_'); // Replace @ and . to make filename safe
    const ext = path.extname(file.originalname); // Keep file extension
    const baseName = path.basename(file.originalname, ext); // Get base name without extension
    const customFileName = `${sanitizedEmail}_${timestamp}-${baseName}${ext}`;
    cb(null, customFileName);
  }
});

const upload = multer({ storage });


// // Add middleware to extract email from token
// const extractEmail = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ message: 'No token provided' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.userEmail = decoded.email;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: 'Invalid token' });
//   }
// };





router.post('/upload-csv', Authentication, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const filePath = req.file.path;
  
  // Use user's email as collection name
  const collectionName = `collection_${req.userEmail}_${Date.now()}`;

  try {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', async () => {
        await client.connect();
        const db = client.db('Resume');
        const collection = db.collection(collectionName);

        if (results.length > 0) {
          await collection.insertMany(results);
          console.log(`Inserted ${results.length} documents into ${collectionName}`);
        }

        // fs.unlinkSync(filePath); // Remove temp file

        res.status(200).json({
          message: 'CSV data imported successfully',
          collectionName,
          fileName: path.basename(filePath),
          count: results.length
        });
      });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Failed to import CSV' });
  }
});

// router.delete('/delete-csv', Authentication, async (req, res) => {
//   const { collectionName } = req.query;
//   const userEmail = req.userEmail; // Extracted from token
//   console.log(userEmail, "email");

//   if (!collectionName) {
//     return res.status(400).json({ message: 'Missing collection name' });
//   }

//   const expectedPrefix = `collection_${userEmail}_`;
//   console.log(expectedPrefix, "prefix");

//   if (!collectionName.startsWith(expectedPrefix)) {
//     return res.status(403).json({ message: 'Unauthorized: collection does not belong to user' });
//   }

//   try {
//     // Delete MongoDB collection
//     await client.connect();
//     const db = client.db('Resume');
//     await db.collection(collectionName).drop();

//     // Extract timestamp from collection name
//     const match = collectionName.match(/_(\d{13})$/);
//     console.log(match, "match");

//     if (!match) {
//       return res.status(400).json({ message: 'Invalid collection name format' });
//     }

//     const timestamp = Number(match[1]);
//     console.log(timestamp, "timestamp");

//     // Delete the matching file from uploads folder
//     const uploadFolder = path.join(__dirname, '../uploads');
//     const files = await fsp.readdir(uploadFolder);
//     const userFilePrefix = userEmail.replace(/[@.]/g, '_');

//     const fileToDelete = files.find(file => {
//       if (!file.includes(userFilePrefix)) return false;
//       const timeMatch = file.match(/\d{13}/);
//       if (!timeMatch) return false;
//       const fileTimestamp = Number(timeMatch[0]);
//       return Math.abs(fileTimestamp - timestamp) <= 100; // fuzzy match within 100ms
//     });

//     console.log(fileToDelete, "fileToDelete");

//     if (fileToDelete) {
//       const filePath = path.join(uploadFolder, fileToDelete);
//       await fsp.unlink(filePath);
//       console.log(`Deleted file: ${fileToDelete}`);
//       return res.status(200).json({
//         message: `Collection '${collectionName}' and file '${fileToDelete}' deleted successfully`
//       });
//     } else {
//       return res.status(404).json({ message: 'Matching file not found for deletion' });
//     }

//   } catch (error) {
//     console.error('Deletion failed:', error);
//     return res.status(500).json({ message: 'Failed to delete collection or file' });
//   }
// });


// GET: Check if a specific collection has data


router.delete('/delete-csv', Authentication, async (req, res) => {
  const { collectionName } = req.query;
  const userEmail = req.userEmail;

  if (!collectionName) {
    return res.status(400).json({ message: 'Missing collection name' });
  }

  const expectedPrefix = `collection_${userEmail}_`;

  if (!collectionName.startsWith(expectedPrefix)) {
    return res.status(403).json({ message: 'Unauthorized: collection does not belong to user' });
  }

  try {
    // Delete MongoDB collection
    await client.connect();
    const db = client.db('Resume');
    await db.collection(collectionName).drop();

    // Define the folder and email-based prefix
    const uploadFolder = path.join(__dirname, '../uploads');
    const emailSafePrefix = userEmail.replace(/[@.]/g, '_');

    // Read files and delete those matching the email
    const files = await fsp.readdir(uploadFolder);
    const deletedFiles = [];

    for (const file of files) {
      if (file.includes(emailSafePrefix)) {
        const filePath = path.join(uploadFolder, file);
        await fsp.unlink(filePath);
        deletedFiles.push(file);
      }
    }

    return res.status(200).json({
      message: `Collection '${collectionName}' and ${deletedFiles.length} file(s) deleted successfully.`,
      deletedFiles
    });

  } catch (error) {
    console.error('Deletion failed:', error);
    return res.status(500).json({ message: 'Failed to delete collection or files' });
  }
});

router.get('/check-data', Authentication, async (req, res) => {
  const { collectionName } = req.query;
  if (!collectionName) return res.status(400).json({ message: 'Missing collection name' });

  const expectedPrefix = `collection_${req.userEmail}_`;
  if (!collectionName.startsWith(expectedPrefix)) {
    return res.status(403).json({ message: 'Unauthorized access to collection' });
  }

  try {
    await client.connect();
    const db = client.db('Resume');
    const collection = db.collection(collectionName);

    const count = await collection.countDocuments();

    // 🔍 NEW CODE: Check uploads folder too
    const uploadDir = path.join(__dirname, '../uploads', req.userEmail);
    let uploadFiles = [];
    if (fs.existsSync(uploadDir)) {
      uploadFiles = fs.readdirSync(uploadDir);
    }

    const uploadCount = uploadFiles.length;
    const hasData = count > 0 || uploadCount > 0;

    res.json({
      hasData,
      mongoCount: count,
      uploadCount,
      uploadFiles,
    });
  } catch (error) {
    console.error('❌ Backend error:', error);
    res.status(500).json({ message: 'Error checking data status' });
  }
});


module.exports = router;