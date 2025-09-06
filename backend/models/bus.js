const mongoose = require('mongoose');

// Define the bus schema
const busSchema = new mongoose.Schema({
  // Basic bus information
  busNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  
  // Route information
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  
  // Vehicle details
  vehicleInfo: {
    make: {
      type: String,
      required: true,
      trim: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      required: true,
      min: 1990,
      max: new Date().getFullYear() + 1
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 200
    },
    licensePlate: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    }
  },
  
  // Current status and location
  currentStatus: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'breakdown'],
    default: 'inactive'
  },
  
  // Real-time location data
  location: {
    latitude: {
      type: Number,
      required: function() {
        return this.currentStatus === 'active';
      },
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: function() {
        return this.currentStatus === 'active';
      },
      min: -180,
      max: 180
    },
    heading: {
      type: Number,
      min: 0,
      max: 360
    },
    speed: {
      type: Number,
      min: 0,
      max: 200 // km/h
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Driver information
  driver: {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    },
    name: {
      type: String,
      trim: true
    },
    licenseNumber: {
      type: String,
      trim: true
    }
  },
  
  // Schedule and timing
  schedule: {
    startTime: {
      type: String, // Format: "HH:MM"
      required: true
    },
    endTime: {
      type: String, // Format: "HH:MM"
      required: true
    },
    frequency: {
      type: Number, // minutes between trips
      default: 15
    }
  },
  
  // Maintenance and service records
  maintenance: {
    lastServiceDate: {
      type: Date
    },
    nextServiceDate: {
      type: Date
    },
    mileage: {
      type: Number,
      min: 0
    },
    fuelLevel: {
      type: Number,
      min: 0,
      max: 100 // percentage
    }
  },
  
  // Real-time tracking metadata
  tracking: {
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    deviceId: {
      type: String,
      unique: true,
      sparse: true
    },
    signalStrength: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  
  // Operational data
  operationalData: {
    totalTrips: {
      type: Number,
      default: 0
    },
    totalDistance: {
      type: Number,
      default: 0 // in kilometers
    },
    averageSpeed: {
      type: Number,
      default: 0
    },
    onTimePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if bus is currently running
busSchema.virtual('isRunning').get(function() {
  return this.currentStatus === 'active' && this.tracking.isOnline;
});

// Pre-save middleware to update lastSeen when location is updated
busSchema.pre('save', function(next) {
  if (this.isModified('location.latitude') || this.isModified('location.longitude')) {
    this.location.lastUpdated = new Date();
    this.tracking.lastSeen = new Date();
  }
  next();
});

// Static method to find nearby buses
busSchema.statics.findNearby = function(latitude, longitude, maxDistance = 1000) {
  return this.find({
    'location.latitude': {
      $gte: latitude - (maxDistance / 111), // Rough conversion: 1 degree ≈ 111 km
      $lte: latitude + (maxDistance / 111)
    },
    'location.longitude': {
      $gte: longitude - (maxDistance / (111 * Math.cos(latitude * Math.PI / 180))),
      $lte: longitude + (maxDistance / (111 * Math.cos(latitude * Math.PI / 180)))
    },
    currentStatus: 'active',
    'tracking.isOnline': true
  });
};

// Static method to find buses by route
busSchema.statics.findByRoute = function(routeId) {
  return this.find({ 
    routeId: routeId,
    currentStatus: 'active'
  }).populate('routeId');
};

// Instance method to update location
busSchema.methods.updateLocation = function(latitude, longitude, heading, speed) {
  this.location.latitude = latitude;
  this.location.longitude = longitude;
  this.location.heading = heading;
  this.location.speed = speed;
  this.location.lastUpdated = new Date();
  this.tracking.lastSeen = new Date();
  this.tracking.isOnline = true;
  return this.save();
};

// Instance method to start trip
busSchema.methods.startTrip = function() {
  this.currentStatus = 'active';
  this.tracking.isOnline = true;
  this.tracking.lastSeen = new Date();
  return this.save();
};

// Instance method to end trip
busSchema.methods.endTrip = function() {
  this.currentStatus = 'inactive';
  this.operationalData.totalTrips += 1;
  return this.save();
};

// Create and export the model
const Bus = mongoose.model('Bus', busSchema);

module.exports = Bus;
