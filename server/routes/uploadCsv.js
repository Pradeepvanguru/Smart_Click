const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });





// MongoDB setup
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

router.post('/upload-csv', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const filePath = req.file.path;
  const { collectionName } = req.body;

  if (!collectionName) {
    return res.status(400).json({ message: 'Missing collection name in request' });
  }

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
          count: results.length
        });
      });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Failed to import CSV' });
  }
});



// DELETE all data from a specific collection (pass name via query param)
router.delete('/delete-csv', async (req, res) => {
  const { collectionName } = req.query;
  if (!collectionName) return res.status(400).json({ message: 'Missing collection name' });

  try {
    // Delete MongoDB collection
    await client.connect();
    const db = client.db('Resume');
    await db.collection(collectionName).drop();

    // Delete all files in upload folder
    const uploadFolder = path.join(__dirname, '../uploads'); // adjust folder path if needed
    fs.readdir(uploadFolder, (err, files) => {
      if (err) {
        console.error('Error reading upload folder:', err);
        // Not failing the whole operation, just logging
      } else {
        for (const file of files) {
          const filePath = path.join(uploadFolder, file);
          fs.unlink(filePath, err => {
            if (err) console.error('Error deleting file:', filePath, err);
          });
        }
      }
    });

    res.status(200).json({ message: `Collection '${collectionName}' and upload folder files deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete collection or files' });
  }
});

// GET: Check if a specific collection has data
router.get('/check-data', async (req, res) => {
  const { collectionName } = req.query;
  if (!collectionName) return res.status(400).json({ message: 'Missing collection name' });

  try {
    await client.connect();
    const db = client.db('Resume');
    const collection = db.collection(collectionName);

    const count = await collection.countDocuments();
    res.json({ hasData: count > 0, count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error checking data status' });
  }
});

module.exports = router;