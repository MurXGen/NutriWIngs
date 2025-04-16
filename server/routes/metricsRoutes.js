const express = require("express");
const { getDailyMetrics } = require("../controllers/metricsController");
const { calculateStrengthScore,deleteWaterEntry,getStrengthDates,getStrengthScoreByDate, getTodaysWaterEntries, addWaterEntry, deleteSleepEntry, getTodaysSleepEntries, getTotalSleepDuration, startSleep, stopSleep, manualSleepEntry, getLatestSleep } = require("../controllers/metricsController");
const router = express.Router();

router.delete("/sleep/delete/:userId/:entryId", deleteSleepEntry);
router.get("/sleep/entries/:userId", getTodaysSleepEntries);

router.get('/sleep/total/:userId', getTotalSleepDuration);

router.post("/sleep/start", startSleep);

router.post("/sleep/stop", stopSleep);

router.post("/sleep/manual", manualSleepEntry);

router.get("/sleep/latest/:userId", getLatestSleep);
router.get("/daily-metrics", getDailyMetrics);



router.post('/water/add/:userId', addWaterEntry);
router.get('/water/today/:userId', getTodaysWaterEntries);
router.delete('/water/delete/:userId/:entryId', deleteWaterEntry);



router.get("/strength/daily-score/:userId", calculateStrengthScore);

router.get('/strength/daily-score/:userId/:date', getStrengthScoreByDate);

router.get('/strength/dates/:userId', getStrengthDates);

module.exports = router;
