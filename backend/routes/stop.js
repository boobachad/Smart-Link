const express = require('express');
const router = express.Router();
const Stop = require('../models/stop');
const { verifyUser } = require('../middleware/authMiddleware');

// GET - Get all stops (paginated, Admin only)
router.get('/', verifyUser, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || !req.user.admin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    // Parse pagination query params
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalStops = await Stop.countDocuments();

    // Fetch paginated stops
    const stops = await Stop.find()
      .skip(skip)
      .limit(limit)
      .lean({virtuals: true});

    res.json({
      success: true,
      data: stops,
      pagination: {
        total: totalStops,
        page,
        limit,
        totalPages: Math.ceil(totalStops / limit)
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stops',
      details: err.message
    });
  }
});

// POST - Add a single stop (Admin only)
router.post('/', async (req, res) => {
  try {
    
    // // Check if user is admin
    // if (!req.user || !req.user.admin) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Access denied. Admin privileges required.'
    //   });
    // }

    const stopData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'code', 'location'];
    const missingFields = requiredFields.filter(field => !stopData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields: missingFields
      });
    }

    // Validate location
    const locationRequiredFields = ['latitude', 'longitude', 'address'];
    const missingLocationFields = locationRequiredFields.filter(field => !stopData.location[field]);
    
    if (missingLocationFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required location information',
        missingFields: missingLocationFields
      });
    }

    // Validate address
    const addressRequiredFields = ['street', 'city', 'state'];
    const missingAddressFields = addressRequiredFields.filter(field => !stopData.location.address[field]);
    
    if (missingAddressFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required address information',
        missingFields: missingAddressFields
      });
    }

    const stop = new Stop(stopData);
    const savedStop = await stop.save();
    
    res.status(201).json({
      success: true,
      message: 'Stop created successfully'
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
      error: 'Failed to create stop',
      errorType: 'database',
      message: error.message,
      errorCode: error.code || 'UNKNOWN'
    });
  }
});

// POST - Add multiple stops (Bulk insert - Admin only)
router.post('/bulk', async (req, res) => {
  try {
    // // Check if user is admin
    // if (!req.user || !req.user.admin) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Access denied. Admin privileges required.'
    //   });
    // }

    const { stops } = req.body;
    
    if (!Array.isArray(stops) || stops.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Stops array is required and must not be empty'
      });
    }

    if (stops.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Cannot create more than 100 stops at once'
      });
    }

    // Validate each stop and separate valid from invalid
    const validStops = [];
    const validationErrors = [];
    const requiredFields = ['name', 'code', 'location'];
    const locationRequiredFields = ['latitude', 'longitude', 'address'];
    const addressRequiredFields = ['street', 'city', 'state'];

    stops.forEach((stop, index) => {
      const errors = [];
      
      // Check required fields
      const missingFields = requiredFields.filter(field => !stop[field]);
      if (missingFields.length > 0) {
        errors.push(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Check location
      if (stop.location) {
        const missingLocationFields = locationRequiredFields.filter(field => !stop.location[field]);
        if (missingLocationFields.length > 0) {
          errors.push(`Missing location fields: ${missingLocationFields.join(', ')}`);
        }
      } else if (stop.location === undefined) {
        errors.push('location object is required');
      }

      // Check address
      if (stop.location && stop.location.address) {
        const missingAddressFields = addressRequiredFields.filter(field => !stop.location.address[field]);
        if (missingAddressFields.length > 0) {
          errors.push(`Missing address fields: ${missingAddressFields.join(', ')}`);
        }
      } else if (stop.location && stop.location.address === undefined) {
        errors.push('address object is required');
      }

      // Additional validation for data types and ranges
      if (stop.location && stop.location.latitude) {
        if (stop.location.latitude < -90 || stop.location.latitude > 90) {
          errors.push('Latitude must be between -90 and 90');
        }
      }

      if (stop.location && stop.location.longitude) {
        if (stop.location.longitude < -180 || stop.location.longitude > 180) {
          errors.push('Longitude must be between -180 and 180');
        }
      }

      if (errors.length > 0) {
        validationErrors.push({
          index: index,
          stopCode: stop.code || 'Unknown',
          errors: errors,
          stopData: stop // Include the problematic stop data for debugging
        });
      } else {
        validStops.push(stop);
      }
    });

    let createdStops = [];
    let insertErrors = [];

    // Insert valid stops if any exist
    if (validStops.length > 0) {
      try {
        createdStops = await Stop.insertMany(validStops, { ordered: false });
      } catch (insertError) {
        if (insertError.name === 'BulkWriteError') {
          // Handle partial success in bulk insert
          createdStops = insertError.result.insertedDocs || [];
          
          // Process write errors
          insertError.writeErrors.forEach(err => {
            const errorType = err.code === 11000 ? 'duplicate' : 'database';
            const field = err.code === 11000 ? Object.keys(err.keyPattern)[0] : null;
            
            insertErrors.push({
              stopCode: err.op.code || 'Unknown',
              errorType: errorType,
              field: field,
              message: err.code === 11000 
                ? `${field} already exists` 
                : err.errmsg,
              errorCode: err.code,
              stopData: err.op
            });
          });
        } else {
          // Handle other database errors
          insertErrors.push({
            stopCode: 'Multiple',
            errorType: 'database',
            field: null,
            message: insertError.message,
            errorCode: insertError.code || 'UNKNOWN',
            stopData: null
          });
        }
      }
    }

    // Prepare response
    const response = {
      success: true,
      message: '',
      summary: {
        totalStops: stops.length,
        validStops: validStops.length,
        createdStops: createdStops.length,
        validationErrors: validationErrors.length,
        insertErrors: insertErrors.length
      },
      createdStops: createdStops,
      errors: {
        validationErrors: validationErrors,
        insertErrors: insertErrors
      }
    };

    // Determine status code based on results
    let statusCode = 201;
    if (validationErrors.length > 0 || insertErrors.length > 0) {
      statusCode = 207; // Multi-Status (partial success)
      response.message = `Partial success: ${createdStops.length} stops created, ${validationErrors.length + insertErrors.length} failed`;
    } else {
      response.message = `All ${createdStops.length} stops created successfully`;
    }

    res.status(statusCode).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to process bulk stop creation',
      message: error.message
    });
  }
});

module.exports = router;
