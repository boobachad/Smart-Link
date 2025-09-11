const mongoose = require('mongoose');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

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
      // required: function() {
      //   return this.currentStatus === 'active';
      // },
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      // required: function() {
      //   return this.currentStatus === 'active';
      // },
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
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
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

// Virtual for checking if bus has a driver assigned
busSchema.virtual('hasDriver').get(function() {
  return !!this.driverId;
});

// Pre-save middleware to update lastSeen when location is updated
busSchema.pre('save', async function(next) {
  if (this.isModified('location.latitude') || this.isModified('location.longitude')) {
    this.location.lastUpdated = new Date();
    this.tracking.lastSeen = new Date();
  }

  // Only run this middleware if driverId is being modified
  if (this.isModified('driverId')) {
    try {
      const Driver = require('./driver');
      
      // If driverId is being set, update the driver's assignedBus
      if (this.driverId) {
        await Driver.findByIdAndUpdate(
          this.driverId,
          { assignedBus: this._id }
        );
      }
    } catch (err) {
      console.error('Failed to update driver assignment:', err.message);
      // Don't throw error to prevent save failure
    }
  }

  // Only run this middleware if routeId is being modified
  if (this.isModified('routeId')) {
    try {
      const Route = require('./route');

      // Remove this bus from the old route's assignedBuses, if any
      if (this.$__.priorDoc && this.$__.priorDoc.routeId && this.$__.priorDoc.routeId.toString() !== this.routeId?.toString()) {
        await Route.findByIdAndUpdate(
          this.$__.priorDoc.routeId,
          { $pull: { assignedBuses: this._id } }
        );
      }

      // Add this bus to the new route's assignedBuses
      if (this.routeId) {
        await Route.findByIdAndUpdate(
          this.routeId,
          { $addToSet: { assignedBuses: this._id } }
        );
      }
    } catch (err) {
      console.error('Failed to update route assignment:', err.message);
      // Don't throw error to prevent save failure
    }
  }
});

// Pre-insertMany middleware
busSchema.pre("insertMany", async function (next, docs) {
  try {
    const Driver = require("./driver");
    const Route = require("./route");

    for (let doc of docs) {
      // Ensure _id exists before insert
      if (!doc._id) doc._id = new mongoose.Types.ObjectId();

      // Update lastSeen when location is present
      if (doc.location && (doc.location.latitude || doc.location.longitude)) {
        doc.location.lastUpdated = new Date();
        if (!doc.tracking) doc.tracking = {};
        doc.tracking.lastSeen = new Date();
      }

      // Assign driver
      if (doc.driverId) {
        await Driver.findByIdAndUpdate(doc.driverId, { assignedBus: doc._id });
      }

      // Assign route
      if (doc.routeId) {
        await Route.findByIdAndUpdate(
          doc.routeId,
          { $addToSet: { assignedBuses: doc._id } }
        );
      }
    }

    next();
  } catch (err) {
    next(err);
  }
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
  }).populate('routeId').lean({virtuals: true});
};

// Static method to find buses by driver
busSchema.statics.findByDriver = function(driverId) {
  return this.find({ 
    driverId: driverId
  })
};

// Static method to find buses without drivers
busSchema.statics.findWithoutDriver = function() {
  return this.find({ 
    driverId: { $exists: false }
  });
};

// Instance method to change the route of the bus
busSchema.methods.changeRoute = async function(newRouteId) {
  // If the route is not actually changing, do nothing
  if (this.routeId && this.routeId.toString() === newRouteId.toString()) {
    return this;
  }

  // Remove this bus from the assignedBuses of the old route, if any
  if (this.routeId) {
    try {
      const Route = require('./route');
      await Route.findByIdAndUpdate(
        this.routeId,
        { $pull: { assignedBuses: this._id } }
      );
    } catch (err) {
      // Log error but continue
      console.error('Failed to remove bus from old route:', err.message);
    }
  }

  // Assign this bus to the new route's assignedBuses
  if (newRouteId) {
    try {
      const Route = require('./route');
      await Route.findByIdAndUpdate(
        newRouteId,
        { $addToSet: { assignedBuses: this._id } }
      );
    } catch (err) {
      // Log error but continue
      console.error('Failed to add bus to new route:', err.message);
    }
  }

  // Update the bus's routeId
  this.routeId = newRouteId;
  return this.save();
};

// Instance method to change the driver of the bus
busSchema.methods.changeDriver = async function(newDriverId) {
  // If the driver is not actually changing, do nothing
  if (this.driverId && this.driverId.toString() === newDriverId.toString()) {
    return this;
  }

  // Remove this bus from the old driver's assignedBus, if any
  if (this.driverId) {
    try {
      const Driver = require('./driver');
      await Driver.findByIdAndUpdate(
        this.driverId,
        { $unset: { assignedBus: 1 } }
      );
    } catch (err) {
      // Log error but continue
      console.error('Failed to remove bus from old driver:', err.message);
    }
  }

  // Assign this bus to the new driver's assignedBus
  if (newDriverId) {
    try {
      const Driver = require('./driver');
      await Driver.findByIdAndUpdate(
        newDriverId,
        { assignedBus: this._id }
      );
    } catch (err) {
      // Log error but continue
      console.error('Failed to assign bus to new driver:', err.message);
    }
  }

  // Update the bus's driverId
  this.driverId = newDriverId;
  return this.save();
};

// Instance method to unassign driver from bus
busSchema.methods.unassignDriver = async function() {
  if (!this.driverId) {
    return this;
  }

  // Remove this bus from the driver's assignedBus
  try {
    const Driver = require('./driver');
    await Driver.findByIdAndUpdate(
      this.driverId,
      { $unset: { assignedBus: 1 } }
    );
  } catch (err) {
    console.error('Failed to remove bus from driver:', err.message);
  }

  // Clear the bus's driverId
  this.driverId = undefined;
  return this.save();
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
busSchema.plugin(mongooseLeanVirtuals);
const Bus = mongoose.model('Bus', busSchema);

module.exports = Bus;
