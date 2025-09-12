const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', default: null },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    startStation: {
        coordinates: { type: [Number], required: true },
        scheduledTime: { type: String, required: true } // Format: "HH:mm"
    },
    endStation: {
        coordinates: { type: [Number], required: true },
        scheduledTime: { type: String, required: true } // Format: "HH:mm"
    },
    stops: [
        {
            coordinates: { type: [Number], required: true }, // [longitude, latitude]
            scheduledTime: { type: String, required: true } // Format: "HH:mm"
        }
    ],
    overallOnTimePerformance: { type: Boolean, default: true }
});

// Trip schema static method
TripSchema.statics.createTrip = async function(routeId, startTime) {
    try {
        const Route = require('./route'); // Import here to avoid circular dependency
        const axios = require('axios');

        // Fetch the route details
        const route = await Route.findById(routeId)
            .populate('startStation')
            .populate('endStation')
            .populate('stops.pointId');

        if (!route) throw new Error('Route not found');

        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startTime)) {
            throw new Error('Start time must be in HH:mm format');
        }

        const [hours, minutes] = startTime.split(':').map(Number);
        let currentTimeInMinutes = hours * 60 + minutes;

        const tripData = { routeId, stops: [] };

        const allPoints = [
            { point: route.startStation, type: 'Station' },
            ...route.stops.map(stop => ({ point: stop.pointId, type: stop.pointType })),
            { point: route.endStation, type: 'Station' }
        ];

        const minutesToTimeString = (minutes) => {
            const h = Math.floor(minutes / 60) % 24;
            const m = minutes % 60;
            return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
        };

        tripData.startStation = {
            coordinates: [route.startStation.location.longitude, route.startStation.location.latitude],
            scheduledTime: startTime
        };

        for (let i = 0; i < allPoints.length - 1; i++) {
            const currentPoint = allPoints[i];
            const nextPoint = allPoints[i + 1];
            const from = currentPoint.point.location;
            const to = nextPoint.point.location;

            const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}`;
            const response = await axios.get(osrmUrl);

            if (!response.data.routes || !response.data.routes[0]) throw new Error('Failed to get route from OSRM service');

            const durationMinutes = Math.ceil(response.data.routes[0].duration / 60);
            currentTimeInMinutes += durationMinutes;

            if (i > 0 && i < allPoints.length - 1) {
                tripData.stops.push({
                    coordinates: [nextPoint.point.location.longitude, nextPoint.point.location.latitude],
                    scheduledTime: minutesToTimeString(currentTimeInMinutes)
                });
            }

            currentTimeInMinutes += nextPoint.type === 'Station'
                ? (route.timing.stationHaltTime || 2)
                : (route.timing.stopHaltTime || 1);
        }

        tripData.endStation = {
            coordinates: [route.endStation.location.longitude, route.endStation.location.latitude],
            scheduledTime: minutesToTimeString(currentTimeInMinutes)
        };

        const trip = new this(tripData);
        await trip.save();
        return trip;

    } catch (error) {
        throw new Error(`Failed to create trip: ${error.message}`);
    }
};


module.exports = mongoose.model('Trip', TripSchema);