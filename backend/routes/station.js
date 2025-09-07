const express = require('express');
const router = express.Router();
const Station = require('../models/station');
const { verifyUser } = require('../middleware/authMiddleware');

// GET - Get all stations (paginated, Admin only)
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
    const totalStations = await Station.countDocuments();

    // Fetch paginated stations
    const stations = await Station.find()
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: stations,
      pagination: {
        total: totalStations,
        page,
        limit,
        totalPages: Math.ceil(totalStations / limit)
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stations',
      details: err.message
    });
  }
});

// POST - Add a single station (Admin only)
router.post('/', verifyUser, async (req, res) => {
  try {
    
    // Check if user is admin
    if (!req.user || !req.user.admin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const stationData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'code', 'location'];
    const missingFields = requiredFields.filter(field => !stationData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields: missingFields
      });
    }

    // Validate location
    const locationRequiredFields = ['latitude', 'longitude', 'address'];
    const missingLocationFields = locationRequiredFields.filter(field => !stationData.location[field]);
    
    if (missingLocationFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required location information',
        missingFields: missingLocationFields
      });
    }

    // Validate address
    const addressRequiredFields = ['street', 'city', 'state'];
    const missingAddressFields = addressRequiredFields.filter(field => !stationData.location.address[field]);
    
    if (missingAddressFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required address information',
        missingFields: missingAddressFields
      });
    }

    const station = new Station(stationData);
    const savedStation = await station.save();
    
    res.status(201).json({
      success: true,
      message: 'Station created successfully'
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
      error: 'Failed to create station',
      errorType: 'database',
      message: error.message,
      errorCode: error.code || 'UNKNOWN'
    });
  }
});

// POST - Add multiple stations (Bulk insert - Admin only)
router.post('/bulk', verifyUser, async (req, res) => {
  try {
    // // Check if user is admin
    if (!req.user || !req.user.admin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const { stations } = req.body;
    
    if (!Array.isArray(stations) || stations.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Stations array is required and must not be empty'
      });
    }

    if (stations.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Cannot create more than 100 stations at once'
      });
    }

    // Validate each station and separate valid from invalid
    const validStations = [];
    const validationErrors = [];
    const requiredFields = ['name', 'code', 'location'];
    const locationRequiredFields = ['latitude', 'longitude', 'address'];
    const addressRequiredFields = ['street', 'city', 'state'];

    stations.forEach((station, index) => {
      const errors = [];
      
      // Check required fields
      const missingFields = requiredFields.filter(field => !station[field]);
      if (missingFields.length > 0) {
        errors.push(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Check location
      if (station.location) {
        const missingLocationFields = locationRequiredFields.filter(field => !station.location[field]);
        if (missingLocationFields.length > 0) {
          errors.push(`Missing location fields: ${missingLocationFields.join(', ')}`);
        }
      } else if (station.location === undefined) {
        errors.push('location object is required');
      }

      // Check address
      if (station.location && station.location.address) {
        const missingAddressFields = addressRequiredFields.filter(field => !station.location.address[field]);
        if (missingAddressFields.length > 0) {
          errors.push(`Missing address fields: ${missingAddressFields.join(', ')}`);
        }
      } else if (station.location && station.location.address === undefined) {
        errors.push('address object is required');
      }

      // Additional validation for data types and ranges
      if (station.location && station.location.latitude) {
        if (station.location.latitude < -90 || station.location.latitude > 90) {
          errors.push('Latitude must be between -90 and 90');
        }
      }

      if (station.location && station.location.longitude) {
        if (station.location.longitude < -180 || station.location.longitude > 180) {
          errors.push('Longitude must be between -180 and 180');
        }
      }

      if (errors.length > 0) {
        validationErrors.push({
          index: index,
          stationCode: station.code || 'Unknown',
          errors: errors,
          stationData: station // Include the problematic station data for debugging
        });
      } else {
        validStations.push(station);
      }
    });

    let createdStations = [];
    let insertErrors = [];

    // Insert valid stations if any exist
    if (validStations.length > 0) {
      try {
        createdStations = await Station.insertMany(validStations, { ordered: false });
      } catch (insertError) {
        if (insertError.name === 'BulkWriteError') {
          // Handle partial success in bulk insert
          createdStations = insertError.result.insertedDocs || [];
          
          // Process write errors
          insertError.writeErrors.forEach(err => {
            const errorType = err.code === 11000 ? 'duplicate' : 'database';
            const field = err.code === 11000 ? Object.keys(err.keyPattern)[0] : null;
            
            insertErrors.push({
              stationCode: err.op.code || 'Unknown',
              errorType: errorType,
              field: field,
              message: err.code === 11000 
                ? `${field} already exists` 
                : err.errmsg,
              errorCode: err.code,
              stationData: err.op
            });
          });
        } else {
          // Handle other database errors
          insertErrors.push({
            stationCode: 'Multiple',
            errorType: 'database',
            field: null,
            message: insertError.message,
            errorCode: insertError.code || 'UNKNOWN',
            stationData: null
          });
        }
      }
    }

    // Prepare response
    const response = {
      success: true,
      message: '',
      summary: {
        totalStations: stations.length,
        validStations: validStations.length,
        createdStations: createdStations.length,
        validationErrors: validationErrors.length,
        insertErrors: insertErrors.length
      },
      createdStations: createdStations,
      errors: {
        validationErrors: validationErrors,
        insertErrors: insertErrors
      }
    };

    // Determine status code based on results
    let statusCode = 201;
    if (validationErrors.length > 0 || insertErrors.length > 0) {
      statusCode = 207; // Multi-Status (partial success)
      response.message = `Partial success: ${createdStations.length} stations created, ${validationErrors.length + insertErrors.length} failed`;
    } else {
      response.message = `All ${createdStations.length} stations created successfully`;
    }

    res.status(statusCode).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to process bulk station creation',
      message: error.message
    });
  }
});

module.exports = router;
