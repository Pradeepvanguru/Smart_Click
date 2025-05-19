require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const emailRoutes = require("./routes/emailRoutes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const path = require("path");
const fileUpload =require('./routes/uploadCsv')

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// // Serve uploaded resume files
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use('/api',fileUpload)
app.use("/api/email", emailRoutes);


// app.use(express.static(path.join(__dirname, "../frontend/build")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend", "build", "index.html"));
// });
app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
