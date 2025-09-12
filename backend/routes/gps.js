const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const TripHistory = require('../models/history');
const Bus = require('../models/bus');
const Trip = require('../models/trip');

// Function to calculate distance between two points
function calculateDistance(point1, point2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.latitude * Math.PI / 180;
    const φ2 = point2.latitude * Math.PI / 180;
    const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180;
    const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

// Function to check if point is near a station/stop
function isNearPoint(currentLocation, pointCoordinates, threshold = 100) {
    return calculateDistance(
        { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
        { latitude: pointCoordinates[1], longitude: pointCoordinates[0] }
    ) <= threshold;
}

/**
 * Corrected helper:
 * Returns Date for timeStr on baseDate, rolling over to next day
 * if time is earlier than trip start time.
 */
function getDateTimeFromScheduled(timeStr, baseDate) {
    if (!timeStr || !baseDate) return null;

    const [hours, minutes] = timeStr.split(':').map(Number);

    // Always build in UTC, not local time
    let dt = new Date(Date.UTC(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        hours,
        minutes,
        0,
        0
    ));
    return dt;
}

/**
 * @route POST /api/gps
 * @description Receive GPS data from tracking devices and update trip history
 * @access Public
 */
router.post('/', async (req, res) => {
    try {
        const gpsData = req.body;
        const currentTime = new Date(gpsData.lastUpdated || new Date());
        
        if (!gpsData.busId || !gpsData.latitude || !gpsData.longitude) {
            return res.status(400).json({ success: false });
        }
        console.log('Received GPS Data:', gpsData.busId);

        const bus = await Bus.findOneAndUpdate(
            { busNumber: gpsData.busId },
            {
                'tracking.lastLocation': {
                    latitude: gpsData.latitude,
                    longitude: gpsData.longitude
                },
                'tracking.lastUpdate': currentTime
            },
            { new: true }
        );

        if (!bus) {
            return res.status(200).json({ success: true });
        }

        let tripHistory = await TripHistory.findOne({
            busId: bus._id,
            completed: false
        });

        if (!tripHistory && gpsData.speed > 0) {
            const activeTrip = await Trip.findOne({ busId: bus._id }).populate('routeId');

            if (activeTrip) {
                // 🟢 Fix: base date = date of trip start from GPS
                const baseDate = new Date(currentTime);

                tripHistory = await TripHistory.create({
                    tripId: activeTrip._id,
                    busId: bus._id,
                    routeId: activeTrip.routeId._id,
                    date: baseDate.setHours(0,0,0,0), // Store only the date part
                    startStation: {
                        coordinates: activeTrip.startStation.coordinates,
                        expectedTime: getDateTimeFromScheduled(
                            activeTrip.startStation.scheduledTime,
                            baseDate
                        )
                    },
                    endStation: {
                        coordinates: activeTrip.endStation.coordinates,
                        expectedTime: getDateTimeFromScheduled(
                            activeTrip.endStation.scheduledTime,
                            baseDate
                        )
                    },
                    stops: activeTrip.stops.map(stop => ({
                        coordinates: stop.coordinates,
                        expectedTime: getDateTimeFromScheduled(
                            stop.scheduledTime,
                            baseDate
                        )
                    }))
                });
            }
        }


        const currentLocation = { latitude: gpsData.latitude, longitude: gpsData.longitude };

        if (!tripHistory.completed) {
            const updates = {};

            if (!tripHistory.isStarted) {
                if (isNearPoint(currentLocation, tripHistory.startStation.coordinates)) {
                    updates['startStation.arrivedTime'] = currentTime;
                    updates['isStarted'] = true;
                }
            } else if (tripHistory.isStarted) {
                if (tripHistory.nextStopIndex < tripHistory.stops.length) {
                    const nextStop = tripHistory.stops[tripHistory.nextStopIndex];
                    if (isNearPoint(currentLocation, nextStop.coordinates)) {
                        updates[`stops.${tripHistory.nextStopIndex}.arrivedTime`] = currentTime;
                        updates['nextStopIndex'] = tripHistory.nextStopIndex + 1;
                    }
                } else if (!tripHistory.endStation.arrivedTime) {
                    if (isNearPoint(currentLocation, tripHistory.endStation.coordinates)) {
                        updates['endStation.arrivedTime'] = currentTime;
                        updates['completed'] = true;
                    }
                }
            }

            if (Object.keys(updates).length > 0) {
                await TripHistory.updateOne(
                    { _id: tripHistory._id },
                    { $set: updates }
                );
            }
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error('Error processing GPS data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process GPS data',
            message: error.message
        });
    }
});

module.exports = router;
