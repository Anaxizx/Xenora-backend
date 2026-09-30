const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { sendNotification } = require("../controllers/notificationController");

const router = express.Router();

router.post("/", protect, sendNotification);

module.exports = router;
