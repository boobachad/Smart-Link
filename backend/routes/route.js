const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Route = require('../models/route');
const { verifyUser } = require('../middleware/authMiddleware');
const { create } = require('../models/driver');
const Trip = require('../models/trip');

// Helper function to convert HH:mm to minutes since midnight
const timeStringToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to convert minutes to HH:mm format
const minutesToTimeString = (minutes) => {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

async function generateTripsForRoute(routeId, timing) {
  if (!timing || !timing.firstTrip || !timing.lastTrip || !timing.frequency) {
    throw new Error('Invalid timing object provided');
  }

  const firstTripMinutes = timeStringToMinutes(timing.firstTrip);
  const lastTripMinutes = timeStringToMinutes(timing.lastTrip);
  const frequency = timing.frequency;

  // Handle case where last trip is on next day
  const totalMinutes = lastTripMinutes < firstTripMinutes
    ? (lastTripMinutes + 24 * 60) - firstTripMinutes
    : lastTripMinutes - firstTripMinutes;

  const numberOfTrips = Math.floor(totalMinutes / frequency) + 1;

  const createdTrips = [];

  for (let i = 0; i < numberOfTrips; i++) {
    const tripTimeMinutes = (firstTripMinutes + i * frequency) % (24 * 60);
    const tripTime = minutesToTimeString(tripTimeMinutes);

    try {
      const trip = await Trip.createTrip(routeId, tripTime);
      createdTrips.push(trip);
    } catch (err) {
      console.error(`Failed to create trip at ${tripTime}:`, err);
    }
  }

  // Return array of trip IDs
  return createdTrips
    .filter(trip => trip && trip._id)
    .map(trip => trip._id);
}

// GET - Get all routes (paginated, Admin only)
router.get('/', async (req, res) => {
  try {
    // Check if user is admin
    // if (!req.user || !req.user.admin) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Access denied. Admin privileges required.'
    //   });
    // }

    // Parse pagination query params
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalRoutes = await Route.countDocuments();

    // Fetch paginated routes
    const routes = await Route.find()
      .skip(skip)
      .limit(limit)
      .populate('startStation', 'location name')
      .populate('endStation', 'location name')
      .populate({
        path: 'stops.pointId',
        select: 'location name',
        model: doc => mongoose.model(doc.pointType)
      })
      .populate('trips')
      .lean();

    res.json({
      success: true,
      data: routes,
      pagination: {
        total: totalRoutes,
        page,
        limit,
        totalPages: Math.ceil(totalRoutes / limit)
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch routes',
      details: err.message
    });
  }
});

router.get('/:code', async (req, res) => {
  try {
    // if (!req.user || !req.user.admin) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Access denied. Admin privileges required.'
    //   });
    // }

    const route = await Route.findOne({ code: req.params.code })
      .populate('startStation', 'location name')
      .populate('endStation', 'location name')
      .populate({
        path: 'stops.pointId',
        select: 'location name',
        model: doc => mongoose.model(doc.pointType)
      })
      .populate({
        path: 'trips',
        populate: {
          path: 'busId',
          select: 'busNumber currentStatus'
        }
      })
      .lean();
    if (!route) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }
    res.json({
      success: true,
      data: route
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch route',
      details: err.message
    });
  }
});

// POST - Add a single route (Admin only)
router.post('/', async (req, res) => {
  try {
    // // Check if user is admin
    // if (!req.user || !req.user.admin) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Access denied. Admin privileges required.'
    //   });
    // }

    const route = req.body;

    // Required fields
    const requiredFields = ['name', 'code', 'type', 'startStation', 'endStation', 'timing'];
    const timingRequiredFields = ['frequency', 'firstTrip', 'lastTrip'];

    let errors = [];

    // Check required fields
    const missingFields = requiredFields.filter(field => !route[field]);
    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Check timing
    if (route.timing) {
      const missingTimingFields = timingRequiredFields.filter(field => !route.timing[field]);
      if (missingTimingFields.length > 0) {
        errors.push(`Missing timing fields: ${missingTimingFields.join(', ')}`);
      }
    } else if (route.timing === undefined) {
      errors.push('timing object is required');
    }

    // Additional validation for data types and ranges
    if (route.timing && route.timing.totalDuration) {
      if (route.timing.totalDuration < 1) {
        errors.push('Total duration must be at least 1 minute');
      }
    }

    if (route.timing && route.timing.frequency) {
      if (route.timing.frequency < 1) {
        errors.push('Frequency must be at least 1 minute');
      }
    }

    // Return validation errors if any
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: errors,
        routeData: route
      });
    }
    let createdRoute;
    try {
      createdRoute = await Route.create(route);
      const createTrips = await generateTripsForRoute(createdRoute._id, createdRoute.timing);
      await Route.findByIdAndUpdate(createdRoute._id, { $push: { trips: { $each: createTrips } } });
      createdRoute.trips = createTrips;
    } catch (insertError) {
      if (insertError.code === 11000) {
        // Duplicate key error
        const field = Object.keys(insertError.keyPattern)[0];
        return res.status(400).json({
          success: false,
          error: 'Duplicate key error',
          errorType: 'duplicate',
          field: field,
          message: `${field} already exists`,
          errorCode: 11000,
          routeData: route
        });
      } else if (insertError.name === 'ValidationError') {
        // Mongoose validation error
        const validationErrors = Object.values(insertError.errors).map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }));

        return res.status(400).json({
          success: false,
          error: 'Validation error',
          errorType: 'validation',
          message: 'Data validation failed',
          validationErrors: validationErrors,
          routeData: route
        });
      } else {
        // Other DB error
        return res.status(500).json({
          success: false,
          error: 'Failed to create route',
          errorType: 'database',
          message: insertError.message,
          errorCode: insertError.code || 'UNKNOWN',
          routeData: route
        });
      }
    }

    // Success response
    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      createdRoute: createdRoute
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unexpected server error',
      message: error.message
    });
  }
});


// POST - Add multiple routes (Bulk insert - Admin only)
router.post('/bulk', async (req, res) => {
  try {
    // const { routes } = req.body
    const { routes } = req.body;

    if (!Array.isArray(routes) || routes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Routes array is required and must not be empty'
      });
    }

    if (routes.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Cannot create more than 100 routes at once'
      });
    }

    // Validate each route and separate valid from invalid
    let validRoutes = [];
    const validationErrors = [];
    const requiredFields = ['name', 'code', 'type', 'startStation', 'endStation', 'timing'];
    const timingRequiredFields = ['frequency', 'firstTrip', 'lastTrip'];

    routes.forEach((route, index) => {
      const errors = [];

      const missingFields = requiredFields.filter(field => !route[field]);
      if (missingFields.length > 0) errors.push(`Missing required fields: ${missingFields.join(', ')}`);

      if (route.timing) {
        const missingTimingFields = timingRequiredFields.filter(field => !route.timing[field]);
        if (missingTimingFields.length > 0) errors.push(`Missing timing fields: ${missingTimingFields.join(', ')}`);
      } else if (route.timing === undefined) {
        errors.push('timing object is required');
      }

      if (route.timing && route.timing.totalDuration && route.timing.totalDuration < 1)
        errors.push('Total duration must be at least 1 minute');

      if (route.timing && route.timing.frequency && route.timing.frequency < 1)
        errors.push('Frequency must be at least 1 minute');

      if (errors.length > 0) {
        validationErrors.push({ index, routeCode: route.code || 'Unknown', errors, routeData: route });
      } else {
        validRoutes.push(route);
      }
    });

    let createdRoutes = [];
    let insertErrors = [];

    // Insert valid routes
    if (validRoutes.length > 0) {
      try {
        validRoutes = validRoutes.map(route => ({ _id: new mongoose.Types.ObjectId(), ...route }));
        createdRoutes = await Route.insertMany(validRoutes, { ordered: false, lean: false, validateBeforeSave: true });

        // Generate trips for each created route
        const tripPromises = createdRoutes.map(async (routeDoc) => {
          try {
            const trips = await generateTripsForRoute(routeDoc._id, routeDoc.timing);
            routeDoc.trips = trips;
            await routeDoc.save(); // update the trips array in the route
          } catch (err) {
            console.error(`Failed to generate trips for route ${routeDoc.code}:`, err);
          }
        });

        await Promise.all(tripPromises);

      } catch (insertError) {
        console.error('Insert error:', insertError);
        if (insertError.name === 'BulkWriteError') {
          createdRoutes = insertError.result.insertedDocs || [];
          insertError.writeErrors.forEach(err => {
            const errorType = err.code === 11000 ? 'duplicate' : 'database';
            const field = err.code === 11000 ? Object.keys(err.keyPattern)[0] : null;
            insertErrors.push({
              routeCode: err.op.code || 'Unknown',
              errorType,
              field,
              message: err.code === 11000 ? `${field} already exists` : err.errmsg,
              errorCode: err.code,
              routeData: err.op
            });
          });
        } else {
          insertErrors.push({
            routeCode: 'Multiple',
            errorType: 'database',
            field: null,
            message: insertError.message,
            errorCode: insertError.code || 'UNKNOWN',
            routeData: null
          });
        }
      }
    }

    // Prepare response
    const response = {
      success: true,
      message: '',
      summary: {
        totalRoutes: routes.length,
        validRoutes: validRoutes.length,
        createdRoutes: createdRoutes.length,
        validationErrors: validationErrors.length,
        insertErrors: insertErrors.length
      },
      createdRoutes,
      errors: { validationErrors, insertErrors }
    };

    let statusCode = 201;
    if (validationErrors.length > 0 || insertErrors.length > 0) {
      statusCode = 207;
      response.message = `Partial success: ${createdRoutes.length} routes created, ${validationErrors.length + insertErrors.length} failed`;
    } else {
      response.message = `All ${createdRoutes.length} routes created successfully`;
    }

    res.status(statusCode).json(response);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to process bulk route creation',
      message: error.message
    });
  }
});

// Assign a bus to a route (Admin only)
// Assign multiple buses to a route using route code (Admin only)
router.put('/:routeCode/assign-bus', async (req, res) => {
  try {
    // Check if user is admin
    // if (!req.user || !req.user.admin) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Access denied. Admin privileges required.'
    //   });
    // }

    const { routeCode } = req.params;
    let { busIds } = req.body;

    // Accept both single value and array, but always work with array
    if (!busIds) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: busIds'
      });
    }
    if (!Array.isArray(busIds)) {
      busIds = [busIds];
    }

    // Find route by code instead of ID
    const route = await Route.findOne({ code: routeCode });
    if (!route) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    const results = [];
    for (const busId of busIds) {
      try {
        await route.assignBus(busId);
        results.push({
          busId,
          success: true,
          message: 'Bus assigned to route successfully'
        });
      } catch (err) {
        results.push({
          busId,
          success: false,
          error: err.message
        });
      }
    }

    res.json({
      success: results.every(r => r.success),
      routeId: route._id,
      routeCode: route.code,
      results
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to assign buses to route',
      message: err.message
    });
  }
});

// Unassign multiple buses from a route using route code (Admin only)
router.put('/:routeCode/unassign-bus', async (req, res) => {
  try {
    // Check if user is admin
    // if (!req.user || !req.user.admin) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Access denied. Admin privileges required.'
    //   });
    // }

    const { routeCode } = req.params;
    let { busIds } = req.body;

    // Accept both single value and array, but always work with array
    if (!busIds) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: busIds'
      });
    }
    if (!Array.isArray(busIds)) {
      busIds = [busIds];
    }

    // Find route by code instead of ID
    const route = await Route.findOne({ code: routeCode });
    if (!route) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    const results = [];
    for (const busId of busIds) {
      try {
        await route.unassignBus(busId);
        results.push({
          busId,
          success: true,
          message: 'Bus unassigned from route successfully'
        });
      } catch (err) {
        results.push({
          busId,
          success: false,
          error: err.message
        });
      }
    }

    res.json({
      success: results.every(r => r.success),
      routeId: route._id,
      routeCode: route.code,
      results
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to unassign buses from route',
      message: err.message
    });
  }
});

// GET - Get list of buses assigned to a route (by route code)
router.get('/:routeCode/assigned-buses', async (req, res) => {
  try {
    // if (!req.user || !req.user.admin) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Access denied. Admin privileges required.'
    //   });
    // }

    const { routeCode } = req.params;

    // Find the route by code
    const route = await Route.findOne({ code: routeCode }).populate('assignedBuses', "busNumber driverId currentStatus tracking.deviceId").lean({ virtuals: true });
    if (!route) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    res.json({
      success: true,
      routeId: route._id,
      routeCode: route.code,
      assignedBuses: route.assignedBuses
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to get assigned buses',
      message: err.message
    });
  }
});

// POST - Add intermediate point to route with connectivity (Admin only)
router.post('/:routeCode/intermediate-points', async (req, res) => {
  try {
    // Check if user is admin
    // if (!req.user || !req.user.admin) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Access denied. Admin privileges required.'
    //   });
    // }

    const { routeCode } = req.params;
    const { pointId, pointType, pointName, sequence, arrivalTime, departureTime, haltTime = 0, isOptional = false } = req.body;

    // Validate required fields
    const requiredFields = ['pointId', 'pointType', 'pointName', 'sequence', 'arrivalTime', 'departureTime'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields: missingFields
      });
    }

    // Validate pointType
    if (!['station', 'stop'].includes(pointType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pointType. Must be "station" or "stop"'
      });
    }

    // Find route by code
    const route = await Route.findOne({ code: routeCode });
    if (!route) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    // Add intermediate point with connectivity
    await route.addIntermediatePointWithConnectivity(
      pointId, pointType, pointName, sequence, arrivalTime, departureTime, haltTime, isOptional
    );

    res.status(201).json({
      success: true,
      message: 'Intermediate point added successfully with connectivity',
      data: {
        routeId: route._id,
        routeCode: route.code,
        pointId: pointId,
        pointType: pointType,
        pointName: pointName,
        sequence: sequence
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add intermediate point',
      message: error.message
    });
  }
});

// DELETE - Remove intermediate point from route with connectivity (Admin only)
router.delete('/:routeCode/intermediate-points/:pointId', async (req, res) => {
  try {
    // Check if user is admin
    // if (!req.user || !req.user.admin) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Access denied. Admin privileges required.'
    //   });
    // }

    const { routeCode, pointId } = req.params;

    // Find route by code
    const route = await Route.findOne({ code: routeCode });
    if (!route) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    // Remove intermediate point with connectivity
    await route.removeIntermediatePointWithConnectivity(pointId);

    res.json({
      success: true,
      message: 'Intermediate point removed successfully with connectivity',
      data: {
        routeId: route._id,
        routeCode: route.code,
        pointId: pointId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to remove intermediate point',
      message: error.message
    });
  }
});

// PUT - Update route with connectivity refresh (Admin only)
router.put('/:routeCode', async (req, res) => {
  try {
    // Check if user is admin
    // if (!req.user || !req.user.admin) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Access denied. Admin privileges required.'
    //   });
    // }

    const { routeCode } = req.params;
    const updateData = req.body;

    // Find route by code
    const route = await Route.findOne({ code: routeCode });
    if (!route) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    // Update route with connectivity refresh
    await route.updateRouteWithConnectivity(updateData);

    res.json({
      success: true,
      message: 'Route updated successfully with connectivity refresh',
      data: {
        routeId: route._id,
        routeCode: route.code,
        routeName: route.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update route',
      message: error.message
    });
  }
});

// DELETE - Delete route with connectivity cleanup (Admin only)
router.delete('/:routeCode', async (req, res) => {
  try {
    // Check if user is admin
    // if (!req.user || !req.user.admin) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Access denied. Admin privileges required.'
    //   });
    // }

    const { routeCode } = req.params;

    // Find route by code first to get the ID
    const route = await Route.findOne({ code: routeCode });
    if (!route) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    // Delete route with connectivity cleanup
    const result = await Route.deleteRouteWithConnectivity(route._id);

    res.json({
      success: true,
      message: result.message,
      data: {
        routeId: route._id,
        routeCode: route.code,
        routeName: route.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete route',
      message: error.message
    });
  }
});

// POST - Update route connectivity manually (Admin only)
router.post('/update-connectivitys', async (req, res) => {
  try {
    // Check if user is admin
    // if (!req.user || !req.user.admin) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Access denied. Admin privileges required.'
    //   });
    // }

    // Find route by code first to get the ID
    const routes = await Route.find({ connectivityUpdated: false });
    if (!routes) {
      return res.status(201).json({
        success: true,
        message: 'All routes connectivity are up to date.'
      })
        ;
    }

    let failedRoutes = [];

    for (const route of routes) {
      try {
        await Route.updateRouteConnectivity(route._id);
      } catch (error) {
        failedRoutes.push({ routeCode: route.code, error: error.message });
      }
    }


    // Update route connectivity

    res.json({
      success: true,
      message: ` ${routes.length - failedRoutes.length} Routes connectivity updated successfully.`,
      failedRoutes: failedRoutes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update route connectivity',
      message: error.message
    });
  }
});

module.exports = router;
