const express = require("express");
const { getDailyMetrics } = require("../controllers/metricsController");
const { startSleep, stopSleep, manualSleepEntry, getLatestSleep } = require("../controllers/metricsController");
const router = express.Router();


router.post("/sleep/start", startSleep);

router.post("/sleep/stop", stopSleep);

router.post("/sleep/manual", manualSleepEntry);

router.get("/sleep/latest/:userId", getLatestSleep);
router.get("/daily-metrics", getDailyMetrics); // Fetch today's metrics

module.exports = router;
