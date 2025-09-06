const express = require('express');
const router = express.Router();

const { verifyUser } = require('../middleware/authMiddleware');
const bus = require('../models/bus');
const route = require('../models/route');
const station = require('../models/station');
const stop = require('../models/stop');


/* GET admin page. */
router.get('/', function (req, res, next) {
    res.send('Admin panel - respond with admin resource');
});

// router.get("/dashboard", verifyUser, async (req, res) => {
router.get("/dashboard", async (req, res) => {
    // Check if the authenticated user has the 'admin' custom claim
    // if (req.user && req.user.email_verified === false) {
    if (true) {
        const buses = await bus.countDocuments();
        const routes = await route.countDocuments();
        const stations = await station.countDocuments();
        const stops = await stop.countDocuments();
        const onTimePercentage = await bus.aggregate([
            { $match: { currentStatus: 'active' } },
            { $group: { _id: null, avg: { $avg: '$operationalData.onTimePercentage' } } }
        ]);
        res.json({ message: "Welcome to the admin dashboard!", buses, routes, stations, stops, onTimePerformance: onTimePercentage[0]?.avg});
    } else {
        res.status(403).json({ error: "Access denied. Admins only." });
    }
});


// Uncomment this to set the user as admin
// const admin = require('../firebase.js');
// async function setAdmin(uid) {
//     await admin.auth().setCustomUserClaims(uid, { admin: true });
//     console.log(`User ${uid} set as admin ✅`);
// }

module.exports = router;