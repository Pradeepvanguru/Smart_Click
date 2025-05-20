const express = require("express");
const { sendEmails, cancelEmailProcess,getDynamicKeys } = require("../controllers/emailController");
const Authentication = require("../middleware/AuthMiddleWare");
const router = express.Router();

router.post("/send",Authentication, sendEmails);
router.post("/cancel", cancelEmailProcess); // New route to cancel process
router.get('/keys',Authentication, getDynamicKeys);

module.exports = router;
