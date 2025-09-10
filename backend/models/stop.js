const mongoose = require('mongoose');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

// Define the stop schema - specialized for bus stops only
const stopSchema = new mongoose.Schema({
  // Basic stop information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  // Stop code/identifier
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 10
  },
  
  // Location information
  location: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    address: {
      street: {
        type: String,
        required: true,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      state: {
        type: String,
        required: true,
        trim: true
      },
      zipCode: {
        type: String,
        trim: true
      },
      country: {
        type: String,
        required: true,
        trim: true,
        default: 'India'
      }
    },
    landmark: {
      type: String,
      trim: true
    }
  },
  
  // Stop status
  status: {
    type: String,
    enum: ['active', 'inactive', 'temporary_closed'],
    default: 'active'
  },
  
  // Routes that serve this stop
  routes: [{
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: true
    },
    position: {
      type: String,
      enum: ['start', 'end', 'intermediate'],
      required: true
    },
    sequence: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  
  // Stop timing information
  timing: {
    averageWaitTime: {
      type: Number,
      default: 0, // in minutes
      min: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Nearby connectivity
  nearbyStops: [{
    stopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stop'
    },
    distance: {
      type: Number, // in meters
      required: true
    },
    walkingTime: {
      type: Number, // in minutes
      required: true
    }
  }],
  
  // Basic analytics
  analytics: {
    dailyPassengerCount: {
      type: Number,
      default: 0
    },
    peakHours: [{
      start: { type: String, required: true },
      end: { type: String, required: true },
      averagePassengers: { type: Number, required: true }
    }]
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting full address
stopSchema.virtual('fullAddress').get(function() {
  const addr = this.location.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Pre-save middleware to update timing timestamp
stopSchema.pre('save', function(next) {
  if (this.isModified('timing.averageWaitTime')) {
    this.timing.lastUpdated = new Date();
  }
  next();
});

// Static method to find nearby stops
stopSchema.statics.findNearby = function(latitude, longitude, maxDistance = 500) {
  return this.find({
    'location.latitude': {
      $gte: latitude - (maxDistance / 111), // Rough conversion: 1 degree ≈ 111 km
      $lte: latitude + (maxDistance / 111)
    },
    'location.longitude': {
      $gte: longitude - (maxDistance / (111 * Math.cos(latitude * Math.PI / 180))),
      $lte: longitude + (maxDistance / (111 * Math.cos(latitude * Math.PI / 180)))
    },
    status: 'active'
  });
};

// Static method to find stops by status
stopSchema.statics.findByStatus = function(status) {
  return this.find({ 
    status: status
  });
};

// Static method to find stops by route
stopSchema.statics.findByRoute = function(routeId) {
  return this.find({ 
    'routes.routeId': routeId,
    status: 'active'
  });
};

// Instance method to add route
stopSchema.methods.addRoute = function(routeId, position, sequence) {
  const existingRoute = this.routes.find(route => 
    route.routeId.toString() === routeId.toString()
  );
  
  if (existingRoute) {
    throw new Error('Route already exists for this stop');
  }
  
  this.routes.push({
    routeId: routeId,
    position: position,
    sequence: sequence
  });
  
  return this.save();
};

// Instance method to remove route
stopSchema.methods.removeRoute = function(routeId) {
  this.routes = this.routes.filter(route => 
    !(route.routeId.toString() === routeId.toString())
  );
  return this.save();
};

// Instance method to update wait time
stopSchema.methods.updateWaitTime = function(waitTime) {
  this.timing.averageWaitTime = waitTime;
  this.timing.lastUpdated = new Date();
  return this.save();
};

// Instance method to add nearby stop
stopSchema.methods.addNearbyStop = function(stopId, distance, walkingTime) {
  const existingStop = this.nearbyStops.find(stop => 
    stop.stopId.toString() === stopId.toString()
  );
  
  if (existingStop) {
    throw new Error('Stop already exists in nearby stops');
  }
  
  this.nearbyStops.push({
    stopId: stopId,
    distance: distance,
    walkingTime: walkingTime
  });
  
  return this.save();
};

// Instance method to remove nearby stop
stopSchema.methods.removeNearbyStop = function(stopId) {
  this.nearbyStops = this.nearbyStops.filter(stop => 
    stop.stopId.toString() !== stopId.toString()
  );
  return this.save();
};

// Instance method to check if stop is accessible
stopSchema.methods.isAccessible = function() {
  return this.status === 'active';
};

// Instance method to add peak hour data
stopSchema.methods.addPeakHour = function(start, end, averagePassengers) {
  this.analytics.peakHours.push({
    start: start,
    end: end,
    averagePassengers: averagePassengers
  });
  return this.save();
};

// Create and export the model
stopSchema.plugin(mongooseLeanVirtuals);
const Stop = mongoose.model('Stop', stopSchema);

module.exports = Stop;
