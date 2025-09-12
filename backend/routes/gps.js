const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const TripHistory = require('../models/history');
const Bus = require('../models/bus');
const Trip = require('../models/trip');

// Configuration for the external server
const EXTERNAL_SERVER_URL = process.env.EXTERNAL_SERVER_URL || 'http://10.140.195.67:5000/predict_eta';

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
        console.log('Received GPS Data:', gpsData);


        const bus = await Bus.findOneAndUpdate(
            { busNumber: gpsData.busId },
            {
                location: {
                    latitude: gpsData.latitude,
                    longitude: gpsData.longitude,
                    heading: gpsData.heading || 0,
                    speed: gpsData.speed || 30,
                    lastUpdated: currentTime
                },
                'tracking.lastSeen': currentTime
            },
            { new: true }
        );



        if (!bus) {
            return res.status(200).json({ success: true });
        }

        let tripHistory = await TripHistory.findOne({
            historyId: gpsData.tripInstanceId,
            completed: false
        });

        if (!tripHistory && gpsData.speed > 0) {
            const activeTrip = await Trip.findOne({ busId: bus._id }).populate('routeId');

            if (activeTrip) {
                // base date = current trip day
                const baseDate = new Date(currentTime);
                const historyId = `${activeTrip._id}_${baseDate.toISOString().slice(0, 10).replace(/-/g, "")}`;

                // idempotent create-or-return existing
                tripHistory = await TripHistory.findOneAndUpdate(
                    { historyId }, // unique key prevents duplicates
                    {
                        $setOnInsert: {
                            historyId,
                            tripId: activeTrip._id,
                            busId: bus._id,
                            routeId: activeTrip.routeId._id,
                            date: baseDate.setHours(0, 0, 0, 0),
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
                        }
                    },
                    { new: true, upsert: true }
                );
            }
        }



        const currentLocation = { latitude: gpsData.latitude, longitude: gpsData.longitude };

        if (!tripHistory.completed) {
            // Send location data to external server
            // try {
            //     const response = await fetch(EXTERNAL_SERVER_URL, {
            //         method: 'POST',
            //         headers: {
            //             'Content-Type': 'application/json',
            //         },
            //         body: JSON.stringify({
            //             start_lat: gpsData.latitude,
            //             start_lon: gpsData.longitude,
            //             end_lat: tripHistory.stops[tripHistory.nextStopIndex].coordinates[1],
            //             end_lon: tripHistory.stops[tripHistory.nextStopIndex].coordinates[0],
            //             scheduled_time_minutes: (tripHistory.endStation.expectedTime - tripHistory.startStation.expectedTime) / (1000 * 60),
            //             num_stops: tripHistory.stops.length + 2,
            //         })
            //     });

            //     if (!response.ok) {
            //         console.error('Failed to send data to external server:', await response.text());
            //     } else {
            //         const eta = await response.json();
            //         console.log('Successfully sent location data to external server', eta);
            //     }
            // } catch (error) {
            //     console.error('Error sending data to external server:', error);
            //     // Continue processing even if external server request fails
            // }
            const updates = {};

            if (!tripHistory.isStarted) {
                updates['startStation.arrivedTime'] = currentTime;
                updates['isStarted'] = true;
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
