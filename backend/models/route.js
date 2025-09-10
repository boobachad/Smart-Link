const mongoose = require('mongoose');

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
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true
    },
    stationName: {
      type: String,
      required: true
    },
    departureTime: {
      type: String, // Format: "HH:MM"
      required: true
    }
  },
  
  endStation: {
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true
    },
    stationName: {
      type: String,
      required: true
    },
    arrivalTime: {
      type: String, // Format: "HH:MM"
      required: true
    }
  },
  
  // Intermediate stations and stops
  intermediatePoints: [{
    pointId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    pointType: {
      type: String,
      enum: ['station', 'stop'],
      required: true
    },
    pointName: {
      type: String,
      required: true
    },
    sequence: {
      type: Number,
      required: true,
      min: 1
    },
    isOptional: {
      type: Boolean,
      default: false
    }
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
      min: 1
    },
    firstTrip: {
      type: String, // Format: "HH:MM"
      required: true
    },
    lastTrip: {
      type: String, // Format: "HH:MM"
      required: true
    },
    peakFrequency: {
      type: Number, // minutes between trips during peak hours
      min: 1
    },
    offPeakFrequency: {
      type: Number, // minutes between trips during off-peak hours
      min: 1
    }
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
  
  // List of buses assigned to this route
  assignedBuses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus'
  }],

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
+routeSchema.virtual('totalStops').get(function() {
  return this.intermediatePoints.length + 2; // +2 for start and end stations
});

// Virtual for checking if route is currently operating
routeSchema.virtual('isOperating').get(function() {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const firstTripTime = parseInt(this.timing.firstTrip.split(':')[0]) * 60 + parseInt(this.timing.firstTrip.split(':')[1]);
  const lastTripTime = parseInt(this.timing.lastTrip.split(':')[0]) * 60 + parseInt(this.timing.lastTrip.split(':')[1]);
  
  return this.status === 'active' && currentTime >= firstTripTime && currentTime <= lastTripTime;
});

// Virtual for getting current frequency based on peak hours
routeSchema.virtual('currentFrequency').get(function() {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  
  // Check if current time falls within peak hours
  const isPeakHour = this.peakHours.some(peak => {
    const peakStart = parseInt(peak.start.split(':')[0]) * 60 + parseInt(peak.start.split(':')[1]);
    const peakEnd = parseInt(peak.end.split(':')[0]) * 60 + parseInt(peak.end.split(':')[1]);
    return peak.days.includes(dayOfWeek) && currentTime >= peakStart && currentTime <= peakEnd;
  });
  
  return isPeakHour ? this.timing.peakFrequency : this.timing.offPeakFrequency || this.timing.frequency;
});

// Virtual for getting count of buses assigned to this route
routeSchema.virtual('busCount').get(function() {
  return this.assignedBuses.length;
});

// Pre-save middleware to calculate total duration if not provided
routeSchema.pre('save', function(next) {
  if (!this.timing.totalDuration && this.intermediatePoints.length > 0) {
    // Calculate duration based on first and last trip times
    const firstTime = parseInt(this.timing.firstTrip.split(':')[0]) * 60 + parseInt(this.timing.firstTrip.split(':')[1]);
    const lastTime = parseInt(this.timing.lastTrip.split(':')[0]) * 60 + parseInt(this.timing.lastTrip.split(':')[1]);
    this.timing.totalDuration = lastTime - firstTime;
  }
  next();
});

// Static method to find routes by status
routeSchema.statics.findByStatus = function(status) {
  return this.find({ status: status });
};

// Static method to find routes by type
routeSchema.statics.findByType = function(type) {
  return this.find({ 
    type: type,
    status: 'active'
  });
};

// Static method to find routes serving a specific station/stop
routeSchema.statics.findByStation = function(stationId) {
  return this.find({
    $or: [
      { 'startStation.stationId': stationId },
      { 'endStation.stationId': stationId },
      { 'intermediatePoints.pointId': stationId }
    ],
    status: 'active'
  });
};

// Static method to find routes within a time range
routeSchema.statics.findByTimeRange = function(startTime, endTime) {
  return this.find({
    'timing.firstTrip': { $lte: endTime },
    'timing.lastTrip': { $gte: startTime },
    status: 'active'
  });
};

// Static method to find routes by bus assignment
routeSchema.statics.findByBusAssignment = function(busId) {
  return this.find({
    assignedBuses: busId
  });
};

// Static method to find routes with no buses assigned
routeSchema.statics.findUnassignedRoutes = function() {
  return this.find({
    assignedBuses: { $size: 0 },
    status: 'active'
  });
};

// Instance method to add peak hour
routeSchema.methods.addPeakHour = function(start, end, days) {
  this.peakHours.push({
    start: start,
    end: end,
    days: days
  });
  return this.save();
};

// Instance method to remove peak hour
routeSchema.methods.removePeakHour = function(start, end, days) {
  this.peakHours = this.peakHours.filter(peak => 
    !(peak.start === start && peak.end === end && 
      JSON.stringify(peak.days.sort()) === JSON.stringify(days.sort()))
  );
  return this.save();
};

// Instance method to assign a bus to this route
routeSchema.methods.assignBus = function(busId) {
  // Check if bus is already assigned
  const isAlreadyAssigned = this.assignedBuses.some(bus => 
    bus.toString() === busId.toString()
  );
  
  if (isAlreadyAssigned) {
    throw new Error('Bus is already assigned to this route');
  }
  
  // Add new assignment
  this.assignedBuses.push(busId);
  return this.save();
};

// Instance method to unassign a bus from this route
routeSchema.methods.unassignBus = function(busId) {
  const busIndex = this.assignedBuses.findIndex(bus => 
    bus.toString() === busId.toString()
  );
  
  if (busIndex === -1) {
    throw new Error('Bus is not assigned to this route');
  }
  
  this.assignedBuses.splice(busIndex, 1);
  return this.save();
};

// Instance method to check if a bus is assigned to this route
routeSchema.methods.isBusAssigned = function(busId) {
  return this.assignedBuses.some(bus => 
    bus.toString() === busId.toString()
  );
};

// Comprehensive method to create route with full connectivity management
routeSchema.statics.createRouteWithConnectivity = async function(routeData) {
  const Station = require('./station');
  const Stop = require('./stop');
  
  try {
    // Create the route first
    const route = new this(routeData);
    await route.save();
    
    // Update start station connectivity
    await this.updateStationConnectivity(route.startStation.stationId, route._id, 'start', 1);
    
    // Update end station connectivity
    await this.updateStationConnectivity(route.endStation.stationId, route._id, 'end', route.intermediatePoints.length + 2);
    
    // Update intermediate points connectivity
    for (let i = 0; i < route.intermediatePoints.length; i++) {
      const point = route.intermediatePoints[i];
      const sequence = i + 2; // +2 because start=1, end=last
      
      if (point.pointType === 'station') {
        await this.updateStationConnectivity(point.pointId, route._id, 'intermediate', sequence);
      } else if (point.pointType === 'stop') {
        await this.updateStopConnectivity(point.pointId, route._id, 'intermediate', sequence);
      }
    }
    
    // Update connectivity between all points in the route
    await this.updateRouteConnectivity(route._id);
    
    return route;
  } catch (error) {
    // If anything fails, clean up the created route
    await this.findByIdAndDelete(route._id);
    throw error;
  }
};

// Method to update station connectivity when adding route
routeSchema.statics.updateStationConnectivity = async function(stationId, routeId, position, sequence) {
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
routeSchema.statics.updateStopConnectivity = async function(stopId, routeId, position, sequence) {
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
routeSchema.statics.updateRouteConnectivity = async function(routeId) {
  const Station = require('./station');
  const Stop = require('./stop');
  
  try {
    const route = await this.findById(routeId).populate('startStation.stationId endStation.stationId');
    if (!route) {
      throw new Error(`Route with ID ${routeId} not found`);
    }
    
    // Get all points in the route in sequence
    const allPoints = [
      { id: route.startStation.stationId, type: 'station', name: route.startStation.stationName },
      ...route.intermediatePoints.map(point => ({
        id: point.pointId,
        type: point.pointType,
        name: point.pointName
      })),
      { id: route.endStation.stationId, type: 'station', name: route.endStation.stationName }
    ];
    
    // Update connectivity between consecutive points
    for (let i = 0; i < allPoints.length - 1; i++) {
      const currentPoint = allPoints[i];
      const nextPoint = allPoints[i + 1];
      
      // Calculate distance and walking time between points
      const currentLocation = await this.getPointLocation(currentPoint.id, currentPoint.type);
      const nextLocation = await this.getPointLocation(nextPoint.id, nextPoint.type);
      
      if (currentLocation && nextLocation) {
        const distance = this.calculateDistance(currentLocation, nextLocation);
        const walkingTime = this.calculateWalkingTime(distance);
        
        // Update connectivity for current point
        await this.updatePointConnectivity(
          currentPoint.id, 
          currentPoint.type, 
          nextPoint.id, 
          nextPoint.type, 
          distance, 
          walkingTime
        );
        
        // Update connectivity for next point (bidirectional)
        await this.updatePointConnectivity(
          nextPoint.id, 
          nextPoint.type, 
          currentPoint.id, 
          currentPoint.type, 
          distance, 
          walkingTime
        );
      }
    }

    route.connectivityUpdated = true;
    await route.save();
    
  } catch (error) {
    throw new Error(`Failed to update route connectivity: ${error.message}`);
  }
};

// Helper method to get location of a point (station or stop)
routeSchema.statics.getPointLocation = async function(pointId, pointType) {
  const Station = require('./station');
  const Stop = require('./stop');
  
  try {
    if (pointType === 'station') {
      const station = await Station.findById(pointId);
      return station ? station.location : null;
    } else if (pointType === 'stop') {
      const stop = await Stop.findById(pointId);
      return stop ? stop.location : null;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Helper method to calculate distance between two points
routeSchema.statics.calculateDistance = function(point1, point2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = point1.latitude * Math.PI / 180;
  const φ2 = point2.latitude * Math.PI / 180;
  const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180;
  const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

// Helper method to calculate walking time based on distance
routeSchema.statics.calculateWalkingTime = function(distance) {
  const averageWalkingSpeed = 1.4; // m/s (5 km/h)
  return Math.ceil(distance / (averageWalkingSpeed * 60)); // Convert to minutes
};

// Helper method to update connectivity between two points
routeSchema.statics.updatePointConnectivity = async function(pointId, pointType, connectedPointId, connectedPointType, distance, walkingTime) {
  const Station = require('./station');
  const Stop = require('./stop');
  
  try {
    if (pointType === 'station') {
      const station = await Station.findById(pointId);
      if (station) {
        // Check if connection already exists
        const existingConnection = station.connectivity.nearbyStations.find(
          conn => conn.stationId.toString() === connectedPointId.toString()
        );
        
        if (!existingConnection) {
          station.connectivity.nearbyStations.push({
            stationId: connectedPointId,
            distance: distance,
            walkingTime: walkingTime
          });
          await station.save();
        }
      }
    } else if (pointType === 'stop') {
      const stop = await Stop.findById(pointId);
      if (stop) {
        // Check if connection already exists
        const existingConnection = stop.nearbyStops.find(
          conn => conn.stopId.toString() === connectedPointId.toString()
        );
        
        if (!existingConnection) {
          stop.nearbyStops.push({
            stopId: connectedPointId,
            distance: distance,
            walkingTime: walkingTime
          });
          await stop.save();
        }
      }
    }
  } catch (error) {
    console.error(`Failed to update connectivity for ${pointType} ${pointId}:`, error.message);
  }
};

// Enhanced method to add intermediate point with connectivity updates
routeSchema.methods.addIntermediatePointWithConnectivity = async function(pointId, pointType, pointName, sequence, arrivalTime, departureTime, haltTime = 0, isOptional = false) {
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
routeSchema.methods.removeIntermediatePointWithConnectivity = async function(pointId) {
  try {
    const point = this.intermediatePoints.find(p => p.pointId.toString() === pointId.toString());
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
routeSchema.methods.updateRouteWithConnectivity = async function(updateData) {
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

// Method to delete route and clean up all connectivity
routeSchema.statics.deleteRouteWithConnectivity = async function(routeId) {
  const Station = require('./station');
  const Stop = require('./stop');
  
  try {
    const route = await this.findById(routeId);
    if (!route) {
      throw new Error(`Route with ID ${routeId} not found`);
    }
    
    // Remove route from all stations
    await Station.updateMany(
      { 'routes.routeId': routeId },
      { $pull: { routes: { routeId: routeId } } }
    );
    
    // Remove route from all stops
    await Stop.updateMany(
      { 'routes.routeId': routeId },
      { $pull: { routes: { routeId: routeId } } }
    );
    
    // Remove connectivity entries for this route
    await Station.updateMany(
      {},
      { $pull: { 'connectivity.nearbyStations': { stationId: { $in: route.intermediatePoints.map(p => p.pointId) } } } }
    );
    
    await Stop.updateMany(
      {},
      { $pull: { 'nearbyStops': { stopId: { $in: route.intermediatePoints.map(p => p.pointId) } } } }
    );
    
    // Delete the route
    await this.findByIdAndDelete(routeId);
    
    return { message: 'Route deleted successfully with connectivity cleanup' };
  } catch (error) {
    throw new Error(`Failed to delete route with connectivity: ${error.message}`);
  }
};

// Create and export the model
const Route = mongoose.model('Route', routeSchema);

module.exports = Route;
