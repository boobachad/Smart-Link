const mongoose = require('mongoose');
const Station = require('./station');
const Stop = require('./stop');
const Trip = require('./trip');

// Define the route schema
const routeSchema = new mongoose.Schema({
  // Basic route information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  // Route code/identifier
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 10
  },

  // Route description
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },

  // Route type
  type: {
    type: String,
    enum: ['local', 'express', 'rapid', 'intercity', 'airport', 'metro'],
    required: true,
    default: 'local'
  },

  // Start and end stations
  startStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },

  endStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },

  // Intermediate stations and stops
  stops: [{
    pointId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "stops.pointType"
    },
    pointType: {
      type: String,
      enum: ['Station', 'Stop'],
      required: true
    },
    sequence: {
      type: Number,
      required: true,
      min: 1
    }
  }],

  // List of trips assigned to this route
  trips: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  }],

  // Route timing and frequency
  timing: {
    totalDuration: {
      type: Number, // in minutes
      required: true,
      min: 1
    },
    frequency: {
      type: Number, // minutes between trips
      required: true,
      min: 10
    },
    firstTrip: {
      type: String, // Format: "HH:MM"
      required: true
    },
    lastTrip: {
      type: String, // Format: "HH:MM"
      required: true
    },
  },

  // Peak hours definition
  peakHours: [{
    start: {
      type: String, // Format: "HH:MM"
      required: true
    },
    end: {
      type: String, // Format: "HH:MM"
      required: true
    },
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    }]
  }],

  // Route status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'maintenance'],
    default: 'active'
  },

  connectivityUpdated: {
    type: Boolean,
    default: false
  },

  // Fare information
  fare: {
    baseFare: {
      type: Number,
      required: true,
      min: 0
    },
    farePerKm: {
      type: Number,
      default: 0,
      min: 0
    },
    maxFare: {
      type: Number,
      min: 0
    },
    concessions: [{
      type: {
        type: String,
        enum: ['student', 'senior', 'disabled', 'monthly_pass'],
        required: true
      },
      discount: {
        type: Number, // percentage
        required: true,
        min: 0,
        max: 100
      }
    }]
  },

  // Route analytics and performance
  analytics: {
    averagePassengers: {
      type: Number,
      default: 0
    },
    onTimePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageSpeed: {
      type: Number, // km/h
      default: 0
    },
    totalTrips: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    }
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total stops count
+routeSchema.virtual('totalStops').get(function () {
  return this.stops.length + 2; // +2 for start and end stations
});

// Virtual for checking if route is currently operating
routeSchema.virtual('isOperating').get(function () {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const firstTripTime = parseInt(this.timing.firstTrip.split(':')[0]) * 60 + parseInt(this.timing.firstTrip.split(':')[1]);
  const lastTripTime = parseInt(this.timing.lastTrip.split(':')[0]) * 60 + parseInt(this.timing.lastTrip.split(':')[1]);

  return this.status === 'active' && currentTime >= firstTripTime && currentTime <= lastTripTime;
});

// Pre-save middleware to calculate total duration if not provided
routeSchema.pre('save', function (next) {
  if (!this.timing.totalDuration && this.stops.length > 0) {
    // Calculate duration based on first and last trip times
    const firstTime = parseInt(this.timing.firstTrip.split(':')[0]) * 60 + parseInt(this.timing.firstTrip.split(':')[1]);
    const lastTime = parseInt(this.timing.lastTrip.split(':')[0]) * 60 + parseInt(this.timing.lastTrip.split(':')[1]);
    this.timing.totalDuration = lastTime - firstTime;
  }
  next();
});

routeSchema.pre("insertMany", function (next, docs) {
  for (const doc of docs) {
    if (!doc.timing.totalDuration && doc.stops.length > 0) {
      const firstTime =
        parseInt(doc.timing.firstTrip.split(":")[0]) * 60 +
        parseInt(doc.timing.firstTrip.split(":")[1]);
      const lastTime =
        parseInt(doc.timing.lastTrip.split(":")[0]) * 60 +
        parseInt(doc.timing.lastTrip.split(":")[1]);
      doc.timing.totalDuration = lastTime - firstTime;
    }
  }
  next();
});

// Static method to find routes by status
routeSchema.statics.findByStatus = function (status) {
  return this.find({ status: status });
};

// Static method to find routes by type
routeSchema.statics.findByType = function (type) {
  return this.find({
    type: type,
    status: 'active'
  });
};

// Static method to find routes serving a specific station/stop
routeSchema.statics.findByStation = function (stationId) {
  return this.find({
    $or: [
      { startStation: stationId },
      { endStation: stationId },
      { 'stops.pointId': stationId, 'stops.pointType': 'Station' }
    ],
    status: 'active'
  });
};

// Static method to find routes within a time range
routeSchema.statics.findByTimeRange = function (startTime, endTime) {
  return this.find({
    'timing.firstTrip': { $lte: endTime },
    'timing.lastTrip': { $gte: startTime },
    status: 'active'
  });
};

// Instance method to add peak hour
routeSchema.methods.addPeakHour = function (start, end, days) {
  this.peakHours.push({
    start: start,
    end: end,
    days: days
  });
  return this.save();
};

// Instance method to remove peak hour
routeSchema.methods.removePeakHour = function (start, end, days) {
  this.peakHours = this.peakHours.filter(peak =>
    !(peak.start === start && peak.end === end &&
      JSON.stringify(peak.days.sort()) === JSON.stringify(days.sort()))
  );
  return this.save();
};

// Method to update station connectivity when adding route
routeSchema.statics.updateStationConnectivity = async function (stationId, routeId, position, sequence) {
  const Station = require('./station');

  try {
    const station = await Station.findById(stationId);
    if (!station) {
      throw new Error(`Station with ID ${stationId} not found`);
    }

    // Add route to station if not already present
    const existingRoute = station.routes.find(route =>
      route.routeId.toString() === routeId.toString()
    );

    if (!existingRoute) {
      station.routes.push({
        routeId: routeId,
        position: position,
        sequence: sequence
      });
      await station.save();
    }

    return station;
  } catch (error) {
    throw new Error(`Failed to update station connectivity: ${error.message}`);
  }
};

// Method to update stop connectivity when adding route
routeSchema.statics.updateStopConnectivity = async function (stopId, routeId, position, sequence) {
  const Stop = require('./stop');

  try {
    const stop = await Stop.findById(stopId);
    if (!stop) {
      throw new Error(`Stop with ID ${stopId} not found`);
    }

    // Add route to stop if not already present
    const existingRoute = stop.routes.find(route =>
      route.routeId.toString() === routeId.toString()
    );

    if (!existingRoute) {
      stop.routes.push({
        routeId: routeId,
        position: position,
        sequence: sequence
      });
      await stop.save();
    }

    return stop;
  } catch (error) {
    throw new Error(`Failed to update stop connectivity: ${error.message}`);
  }
};

// Method to update connectivity between all points in a route
routeSchema.statics.updateRouteConnectivity = async function (routeId) {
  try {
    const route = await this.findById(routeId).populate('startStation.stationId endStation.stationId').lean({ virtuals: true });
    if (!route) {
      throw new Error(`Route with ID ${routeId} not found`);
    }

    // Get all points in the route in sequence
    const allPoints = [
      { id: route.startStation, type: 'Station' },
      ...route.stops.map(point => ({
        id: point.pointId,
        type: point.pointType
      })),
      { id: route.endStation, type: 'Station' }
    ];

    // Update connectivity between consecutive points
    for (let i = 0; i < allPoints.length - 1; i++) {
      const currentPoint = allPoints[i];
      const nextPoint = allPoints[i + 1];

      await this.updatePointConnectivity(
        currentPoint.id,
        currentPoint.type,
        nextPoint.id,
        nextPoint.type
      );

      // Update connectivity for next point (bidirectional)
      await this.updatePointConnectivity(
        nextPoint.id,
        nextPoint.type,
        currentPoint.id,
        currentPoint.type
      );
    }

    route.connectivityUpdated = true;
    await route.save();

  } catch (error) {
    throw new Error(`Failed to update route connectivity: ${error.message}`);
  }
};

// Helper method to update connectivity between two points
routeSchema.statics.updatePointConnectivity = async function (pointId, pointType, connectedPointId, connectedPointType) {
  try {
    if (pointType === 'Station') {
      const station = await Station.findById(pointId);
      if (station) {
        if (connectedPointType === 'Station') {
          // Check if connection already exists
          station.nearbyStops = station.nearbyStops || [];
          const existingConnection = station.nearbyStops.find(
            conn => conn.stopId.toString() === connectedPointId.toString()
          );

          if (!existingConnection) {
            station.nearbyStops.push({
              stopId: connectedPointId,
              pointType: connectedPointType
            });
          }
        } else {
          // Connected to a stop
          station.nearbyStops = station.nearbyStops || [];
          const existingConnection = station.nearbyStops.find(
            conn => conn.stopId.toString() === connectedPointId.toString()
          );

          if (!existingConnection) {
            station.nearbyStops.push({
              stopId: connectedPointId,
              pointType: connectedPointType
            });
          }
        }
        await station.save();
      }
    } else {
      const stop = await Stop.findById(pointId);
      if (stop) {
        if (connectedPointType === 'Station') {
          // Check if connection already exists
          // Ensure the array exists
          stop.nearbyStops = stop.nearbyStops || [];
          const existingConnection = stop.nearbyStops.find(
            conn => conn.stopId.toString() === connectedPointId.toString()
          );

          if (!existingConnection) {
            stop.nearbyStops.push({
              stopId: connectedPointId,
              pointType: connectedPointType
            });
          }
        } else {
          // Connected to another stop
          stop.nearbyStops = stop.nearbyStops || [];
          const existingConnection = stop.nearbyStops.find(
            conn => conn.stopId.toString() === connectedPointId.toString()
          );

          if (!existingConnection) {
            stop.nearbyStops.push({
              stopId: connectedPointId,
              pointType: connectedPointType
            });
          }
        }
        await stop.save();
      }
    }
  } catch (error) {
    console.error(`Failed to update connectivity for ${pointType} ${pointId}:`, error.message);
  }
};

// Enhanced method to add intermediate point with connectivity updates
routeSchema.methods.addIntermediatePointWithConnectivity = async function (pointId, pointType, pointName, sequence, arrivalTime, departureTime, haltTime = 0, isOptional = false) {
  try {
    // Add the intermediate point
    await this.addIntermediatePoint(pointId, pointType, pointName, sequence, arrivalTime, departureTime, haltTime, isOptional);

    // Update connectivity for the new point
    if (pointType === 'station') {
      await this.constructor.updateStationConnectivity(pointId, this._id, 'intermediate', sequence);
    } else if (pointType === 'stop') {
      await this.constructor.updateStopConnectivity(pointId, this._id, 'intermediate', sequence);
    }

    // Update route connectivity to include the new point
    await this.constructor.updateRouteConnectivity(this._id);

    return this;
  } catch (error) {
    throw new Error(`Failed to add intermediate point with connectivity: ${error.message}`);
  }
};

// Method to remove intermediate point and update connectivity
routeSchema.methods.removeIntermediatePointWithConnectivity = async function (pointId) {
  try {
    const point = this.stops.find(p => p.pointId.toString() === pointId.toString());
    if (!point) {
      throw new Error('Point not found in route');
    }

    // Remove the point from route
    await this.removeIntermediatePoint(pointId);

    // Update connectivity by recalculating the entire route
    await this.constructor.updateRouteConnectivity(this._id);

    return this;
  } catch (error) {
    throw new Error(`Failed to remove intermediate point with connectivity: ${error.message}`);
  }
};

// Method to update route and refresh all connectivity
routeSchema.methods.updateRouteWithConnectivity = async function (updateData) {
  try {
    // Update the route
    Object.assign(this, updateData);
    await this.save();

    // Refresh all connectivity
    await this.constructor.updateRouteConnectivity(this._id);

    return this;
  } catch (error) {
    throw new Error(`Failed to update route with connectivity: ${error.message}`);
  }
};

// Create and export the model
const Route = mongoose.model('Route', routeSchema);

module.exports = Route;
