const mongoose = require('mongoose');

// Define the station schema - specialized for stations only
const stationSchema = new mongoose.Schema({
  // Basic station information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  // Station code/identifier
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
  
  // Station status and operational data
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'closed'],
    default: 'active'
  },

  // Operating hours
  operatingHours: {
    monday: {
      open: { type: String, default: '05:00' },
      close: { type: String, default: '23:00' },
      is24Hours: { type: Boolean, default: false }
    },
    tuesday: {
      open: { type: String, default: '05:00' },
      close: { type: String, default: '23:00' },
      is24Hours: { type: Boolean, default: false }
    },
    wednesday: {
      open: { type: String, default: '05:00' },
      close: { type: String, default: '23:00' },
      is24Hours: { type: Boolean, default: false }
    },
    thursday: {
      open: { type: String, default: '05:00' },
      close: { type: String, default: '23:00' },
      is24Hours: { type: Boolean, default: false }
    },
    friday: {
      open: { type: String, default: '05:00' },
      close: { type: String, default: '23:00' },
      is24Hours: { type: Boolean, default: false }
    },
    saturday: {
      open: { type: String, default: '05:00' },
      close: { type: String, default: '23:00' },
      is24Hours: { type: Boolean, default: false }
    },
    sunday: {
      open: { type: String, default: '05:00' },
      close: { type: String, default: '23:00' },
      is24Hours: { type: Boolean, default: false }
    }
  },
  
  // Routes that serve this station
  routes: [{
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: true
    }
  }],
  
  // Station connectivity
  connectivity: {
    nearbyStations: [{
      stationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station'
      },
      distance: {
        type: Number, // in meters
        required: true
      },
      walkingTime: {
        type: Number, // in minutes
        required: true
      }
    }]
  },
  
  // Historical and analytics data
  analytics: {
    dailyPassengerCount: {
      type: Number,
      default: 0
    },
    peakHours: [{
      start: { type: String, required: true },
      end: { type: String, required: true },
      averagePassengers: { type: Number, required: true }
    }],
    averageWaitTime: {
      type: Number,
      default: 0
    },
    onTimePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if station is currently open
stationSchema.virtual('isOpen').get(function() {
  const now = new Date();
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const todayHours = this.operatingHours[dayOfWeek];
  
  if (todayHours.is24Hours) return true;
  
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const openTime = parseInt(todayHours.open.split(':')[0]) * 60 + parseInt(todayHours.open.split(':')[1]);
  const closeTime = parseInt(todayHours.close.split(':')[0]) * 60 + parseInt(todayHours.close.split(':')[1]);
  
  return currentTime >= openTime && currentTime <= closeTime;
});

// Virtual for getting full address
stationSchema.virtual('fullAddress').get(function() {
  const addr = this.location.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Static method to find nearby stations
stationSchema.statics.findNearby = function(latitude, longitude, maxDistance = 1000) {
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

// Static method to find stations by status
stationSchema.statics.findByStatus = function(status) {
  return this.find({ 
    status: status
  });
};

// Static method to find stations by route
stationSchema.statics.findByRoute = function(routeId) {
  return this.find({ 
    'routes.routeId': routeId,
    status: 'active'
  }).populate('routes.routeId');
};

// Instance method to add route
stationSchema.methods.addRoute = function(routeId, routeName, direction, sequence) {
  const existingRoute = this.routes.find(route => 
    route.routeId.toString() === routeId.toString()
  );
  
  if (existingRoute) {
    throw new Error('Route already exists for this direction');
  }
  
  this.routes.push({
    routeId: routeId,
    routeName: routeName,
    direction: direction,
    sequence: sequence
  });
  
  return this.save();
};

// Instance method to remove route
stationSchema.methods.removeRoute = function(routeId, direction) {
  this.routes = this.routes.filter(route => 
    !(route.routeId.toString() === routeId.toString())
  );
  return this.save();
};

// Instance method to update wait time
stationSchema.methods.updateWaitTime = function(waitTime) {
  this.realTimeData.averageWaitTime = waitTime;
  this.realTimeData.lastUpdated = new Date();
  return this.save();
};

// Instance method to check if station is accessible
stationSchema.methods.isAccessible = function() {
  return this.status === 'active';
};

// Create and export the model
const Station = mongoose.model('Station', stationSchema);

module.exports = Station;
