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

// Instance method to add intermediate point
routeSchema.methods.addIntermediatePoint = function(pointId, pointType, pointName, sequence, arrivalTime, departureTime, haltTime = 0, isOptional = false) {
  const existingPoint = this.intermediatePoints.find(point => 
    point.pointId.toString() === pointId.toString()
  );
  
  if (existingPoint) {
    throw new Error('Point already exists in route');
  }
  
  this.intermediatePoints.push({
    pointId: pointId,
    pointType: pointType,
    pointName: pointName,
    sequence: sequence,
    arrivalTime: arrivalTime,
    departureTime: departureTime,
    haltTime: haltTime,
    isOptional: isOptional
  });
  
  // Sort by sequence
  this.intermediatePoints.sort((a, b) => a.sequence - b.sequence);
  
  return this.save();
};

// Instance method to remove intermediate point
routeSchema.methods.removeIntermediatePoint = function(pointId) {
  this.intermediatePoints = this.intermediatePoints.filter(point => 
    point.pointId.toString() !== pointId.toString()
  );
  return this.save();
};

// Instance method to update point timing
routeSchema.methods.updatePointTiming = function(pointId, arrivalTime, departureTime, haltTime) {
  const point = this.intermediatePoints.find(p => p.pointId.toString() === pointId.toString());
  if (!point) {
    throw new Error('Point not found in route');
  }
  
  point.arrivalTime = arrivalTime;
  point.departureTime = departureTime;
  point.haltTime = haltTime;
  
  return this.save();
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

// Instance method to get next trip time
routeSchema.methods.getNextTripTime = function(currentTime) {
  const currentMinutes = parseInt(currentTime.split(':')[0]) * 60 + parseInt(currentTime.split(':')[1]);
  const frequency = this.currentFrequency;
  
  // Calculate next trip time
  const nextTripMinutes = Math.ceil(currentMinutes / frequency) * frequency;
  const hours = Math.floor(nextTripMinutes / 60);
  const minutes = nextTripMinutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Instance method to calculate fare for distance
routeSchema.methods.calculateFare = function(distance) {
  const fare = this.fare.baseFare + (distance * this.fare.farePerKm);
  return this.fare.maxFare ? Math.min(fare, this.fare.maxFare) : fare;
};

// Instance method to update analytics
routeSchema.methods.updateAnalytics = function(passengers, onTime, speed, revenue) {
  if (passengers !== undefined) this.analytics.averagePassengers = passengers;
  if (onTime !== undefined) this.analytics.onTimePercentage = onTime;
  if (speed !== undefined) this.analytics.averageSpeed = speed;
  if (revenue !== undefined) this.analytics.revenue = revenue;
  
  return this.save();
};

// Create and export the model
const Route = mongoose.model('Route', routeSchema);

module.exports = Route;
