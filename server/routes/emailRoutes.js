const express = require("express");
const { sendEmails, cancelEmailProcess,getDynamicKeys } = require("../controllers/emailController");

const router = express.Router();

router.post("/send", sendEmails);
router.post("/cancel", cancelEmailProcess); // New route to cancel process
router.get('/keys', getDynamicKeys);

module.exports = router;
