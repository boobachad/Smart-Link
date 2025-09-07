const express = require('express');
const router = express.Router();
const Route = require('../models/route');
const { verifyUser } = require('../middleware/authMiddleware');

// POST - Add a single route (Admin only)
router.post('/', verifyUser, async (req, res) => {
  try {
    
    // // Check if user is admin
    if (!req.user || !req.user.admin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const routeData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'code', 'type', 'startStation', 'endStation', 'timing'];
    const missingFields = requiredFields.filter(field => !routeData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields: missingFields
      });
    }

    // Validate start station
    const startStationRequiredFields = ['stationId', 'stationName', 'departureTime'];
    const missingStartStationFields = startStationRequiredFields.filter(field => !routeData.startStation[field]);
    
    if (missingStartStationFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required start station information',
        missingFields: missingStartStationFields
      });
    }

    // Validate end station
    const endStationRequiredFields = ['stationId', 'stationName', 'arrivalTime'];
    const missingEndStationFields = endStationRequiredFields.filter(field => !routeData.endStation[field]);
    
    if (missingEndStationFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required end station information',
        missingFields: missingEndStationFields
      });
    }

    // Validate timing
    const timingRequiredFields = ['totalDuration', 'frequency', 'firstTrip', 'lastTrip'];
    const missingTimingFields = timingRequiredFields.filter(field => !routeData.timing[field]);
    
    if (missingTimingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required timing information',
        missingFields: missingTimingFields
      });
    }

    const route = new Route(routeData);
    const savedRoute = await route.save();
    
    res.status(201).json({
      success: true,
      message: 'Route created successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: 'Duplicate key error',
        errorType: 'duplicate',
        field: field,
        message: `${field} already exists`,
        errorCode: 11000
      });
    }
    
    if (error.name === 'ValidationError') {
      // Mongoose validation error
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        errorType: 'validation',
        message: 'Data validation failed',
        validationErrors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create route',
      errorType: 'database',
      message: error.message,
      errorCode: error.code || 'UNKNOWN'
    });
  }
});

// POST - Add multiple routes (Bulk insert - Admin only)
router.post('/bulk', verifyUser, async (req, res) => {
  try {
    // // Check if user is admin
    if (!req.user || !req.user.admin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

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
    const validRoutes = [];
    const validationErrors = [];
    const requiredFields = ['name', 'code', 'type', 'startStation', 'endStation', 'timing'];
    const startStationRequiredFields = ['stationId', 'stationName', 'departureTime'];
    const endStationRequiredFields = ['stationId', 'stationName', 'arrivalTime'];
    const timingRequiredFields = ['totalDuration', 'frequency', 'firstTrip', 'lastTrip'];

    routes.forEach((route, index) => {
      const errors = [];
      
      // Check required fields
      const missingFields = requiredFields.filter(field => !route[field]);
      if (missingFields.length > 0) {
        errors.push(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Check start station
      if (route.startStation) {
        const missingStartStationFields = startStationRequiredFields.filter(field => !route.startStation[field]);
        if (missingStartStationFields.length > 0) {
          errors.push(`Missing start station fields: ${missingStartStationFields.join(', ')}`);
        }
      } else if (route.startStation === undefined) {
        errors.push('startStation object is required');
      }

      // Check end station
      if (route.endStation) {
        const missingEndStationFields = endStationRequiredFields.filter(field => !route.endStation[field]);
        if (missingEndStationFields.length > 0) {
          errors.push(`Missing end station fields: ${missingEndStationFields.join(', ')}`);
        }
      } else if (route.endStation === undefined) {
        errors.push('endStation object is required');
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

      if (errors.length > 0) {
        validationErrors.push({
          index: index,
          routeCode: route.code || 'Unknown',
          errors: errors,
          routeData: route // Include the problematic route data for debugging
        });
      } else {
        validRoutes.push(route);
      }
    });

    let createdRoutes = [];
    let insertErrors = [];

    // Insert valid routes if any exist
    if (validRoutes.length > 0) {
      try {
        createdRoutes = await Route.insertMany(validRoutes, { ordered: false });
      } catch (insertError) {
        if (insertError.name === 'BulkWriteError') {
          // Handle partial success in bulk insert
          createdRoutes = insertError.result.insertedDocs || [];
          
          // Process write errors
          insertError.writeErrors.forEach(err => {
            const errorType = err.code === 11000 ? 'duplicate' : 'database';
            const field = err.code === 11000 ? Object.keys(err.keyPattern)[0] : null;
            
            insertErrors.push({
              routeCode: err.op.code || 'Unknown',
              errorType: errorType,
              field: field,
              message: err.code === 11000 
                ? `${field} already exists` 
                : err.errmsg,
              errorCode: err.code,
              routeData: err.op
            });
          });
        } else {
          // Handle other database errors
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
      createdRoutes: createdRoutes,
      errors: {
        validationErrors: validationErrors,
        insertErrors: insertErrors
      }
    };

    // Determine status code based on results
    let statusCode = 201;
    if (validationErrors.length > 0 || insertErrors.length > 0) {
      statusCode = 207; // Multi-Status (partial success)
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

module.exports = router;
