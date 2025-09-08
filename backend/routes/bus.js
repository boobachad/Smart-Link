const express = require('express');
const router = express.Router();
const Bus = require('../models/bus');
const { verifyUser } = require('../middleware/authMiddleware');

// GET - Get all buses (paginated, Admin only)
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

    // Get bus counts and paginated data in parallel for optimization
    const [busCounts, buses] = await Promise.all([
      // Get counts for different bus statuses
      Bus.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $eq: ['$currentStatus', 'active'] }, 1, 0] }
            },
            maintenance: {
              $sum: { $cond: [{ $eq: ['$currentStatus', 'maintenance'] }, 1, 0] }
            },
            inactive: {
              $sum: { $cond: [{ $eq: ['$currentStatus', 'inactive'] }, 1, 0] }
            },
            breakdown: {
              $sum: { $cond: [{ $eq: ['$currentStatus', 'breakdown'] }, 1, 0] }
            }
          }
        }
      ]),
      // Fetch paginated buses
      Bus.find()
        .skip(skip)
        .limit(limit)
        .populate('routeId', 'name') // Populate only route name
        .lean()
    ]);

    // Extract counts from aggregation result
    const counts = busCounts[0] || { total: 0, active: 0, maintenance: 0, inactive: 0, breakdown: 0 };

    res.json({
      success: true,
      data: buses,
      counts: {
        total: counts.total,
        active: counts.active,
        maintenance: counts.maintenance,
        inactive: counts.inactive,
        breakdown: counts.breakdown
      },
      pagination: {
        total: counts.total,
        page,
        limit,
        totalPages: Math.ceil(counts.total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch buses',
      details: err.message
    });
  }
});



// POST - Add a single bus (Admin only)
router.post('/', verifyUser, async (req, res) => {
  try {
    
    // // Check if user is admin
    if (!req.user || !req.user.admin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const busData = req.body;
    
    // Validate required fields
    const requiredFields = ['busNumber', 'routeId', 'vehicleInfo', 'schedule'];
    const missingFields = requiredFields.filter(field => !busData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields: missingFields
      });
    }

    // Validate vehicle info
    const vehicleRequiredFields = ['make', 'model', 'year', 'capacity', 'licensePlate'];
    const missingVehicleFields = vehicleRequiredFields.filter(field => !busData.vehicleInfo[field]);
    
    if (missingVehicleFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required vehicle information',
        missingFields: missingVehicleFields
      });
    }

    // Validate schedule
    const scheduleRequiredFields = ['startTime', 'endTime'];
    const missingScheduleFields = scheduleRequiredFields.filter(field => !busData.schedule[field]);
    
    if (missingScheduleFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required schedule information',
        missingFields: missingScheduleFields
      });
    }

    const bus = new Bus(busData);
    const savedBus = await bus.save();
    
    res.status(201).json({
      success: true,
      message: 'Bus created successfully'
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
      error: 'Failed to create bus',
      errorType: 'database',
      message: error.message,
      errorCode: error.code || 'UNKNOWN'
    });
  }
});

// POST - Add multiple buses (Bulk insert - Admin only)
router.post('/bulk', verifyUser, async (req, res) => {
  try {
    // // Check if user is admin
    if (!req.user || !req.user.admin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const { buses } = req.body;
    
    if (!Array.isArray(buses) || buses.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Buses array is required and must not be empty'
      });
    }

    if (buses.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Cannot create more than 100 buses at once'
      });
    }

    // Validate each bus and separate valid from invalid
    const validBuses = [];
    const validationErrors = [];
    const requiredFields = ['busNumber', 'routeId', 'vehicleInfo', 'schedule'];
    const vehicleRequiredFields = ['make', 'model', 'year', 'capacity', 'licensePlate'];
    const scheduleRequiredFields = ['startTime', 'endTime'];

    buses.forEach((bus, index) => {
      const errors = [];
      
      // Check required fields
      const missingFields = requiredFields.filter(field => !bus[field]);
      if (missingFields.length > 0) {
        errors.push(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Check vehicle info
      if (bus.vehicleInfo) {
        const missingVehicleFields = vehicleRequiredFields.filter(field => !bus.vehicleInfo[field]);
        if (missingVehicleFields.length > 0) {
          errors.push(`Missing vehicle fields: ${missingVehicleFields.join(', ')}`);
        }
      } else if (bus.vehicleInfo === undefined) {
        errors.push('vehicleInfo object is required');
      }

      // Check schedule
      if (bus.schedule) {
        const missingScheduleFields = scheduleRequiredFields.filter(field => !bus.schedule[field]);
        if (missingScheduleFields.length > 0) {
          errors.push(`Missing schedule fields: ${missingScheduleFields.join(', ')}`);
        }
      } else if (bus.schedule === undefined) {
        errors.push('schedule object is required');
      }

      // Additional validation for data types and ranges
      if (bus.vehicleInfo && bus.vehicleInfo.year) {
        const currentYear = new Date().getFullYear();
        if (bus.vehicleInfo.year < 1990 || bus.vehicleInfo.year > currentYear + 1) {
          errors.push(`Year must be between 1990 and ${currentYear + 1}`);
        }
      }

      if (bus.vehicleInfo && bus.vehicleInfo.capacity) {
        if (bus.vehicleInfo.capacity < 1 || bus.vehicleInfo.capacity > 200) {
          errors.push('Capacity must be between 1 and 200');
        }
      }

      if (errors.length > 0) {
        validationErrors.push({
          index: index,
          busNumber: bus.busNumber || 'Unknown',
          errors: errors,
          busData: bus // Include the problematic bus data for debugging
        });
      } else {
        validBuses.push(bus);
      }
    });

    let createdBuses = [];
    let insertErrors = [];

    // Insert valid buses if any exist
    if (validBuses.length > 0) {
      try {
        createdBuses = await Bus.insertMany(validBuses, { ordered: false });
      } catch (insertError) {
        if (insertError.name === 'BulkWriteError') {
          // Handle partial success in bulk insert
          createdBuses = insertError.result.insertedDocs || [];
          
          // Process write errors
          insertError.writeErrors.forEach(err => {
            const errorType = err.code === 11000 ? 'duplicate' : 'database';
            const field = err.code === 11000 ? Object.keys(err.keyPattern)[0] : null;
            
            insertErrors.push({
              busNumber: err.op.busNumber || 'Unknown',
              errorType: errorType,
              field: field,
              message: err.code === 11000 
                ? `${field} already exists` 
                : err.errmsg,
              errorCode: err.code,
              busData: err.op
            });
          });
        } else {
          // Handle other database errors
          insertErrors.push({
            busNumber: 'Multiple',
            errorType: 'database',
            field: null,
            message: insertError.message,
            errorCode: insertError.code || 'UNKNOWN',
            busData: null
          });
        }
      }
    }

    // Prepare response
    const response = {
      success: true,
      message: '',
      summary: {
        totalBuses: buses.length,
        validBuses: validBuses.length,
        createdBuses: createdBuses.length,
        validationErrors: validationErrors.length,
        insertErrors: insertErrors.length
      },
      createdBuses: createdBuses,
      errors: {
        validationErrors: validationErrors,
        insertErrors: insertErrors
      }
    };

    // Determine status code based on results
    let statusCode = 201;
    if (validationErrors.length > 0 || insertErrors.length > 0) {
      statusCode = 207; // Multi-Status (partial success)
      response.message = `Partial success: ${createdBuses.length} buses created, ${validationErrors.length + insertErrors.length} failed`;
    } else {
      response.message = `All ${createdBuses.length} buses created successfully`;
    }

    res.status(statusCode).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to process bulk bus creation',
      message: error.message
    });
  }
});

// PUT - Change route assignment for a bus (Admin only)
router.put('/:busNumber/change-route', verifyUser, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || !req.user.admin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const { busNumber } = req.params;
    const { newRouteId } = req.body;

    if (!newRouteId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: newRouteId'
      });
    }

    // Find the bus by its number
    const bus = await Bus.findOne({ busNumber: busNumber });
    if (!bus) {
      return res.status(404).json({
        success: false,
        error: 'Bus not found'
      });
    }

    // Use the model's changeRoute method
    await bus.changeRoute(newRouteId);

    res.json({
      success: true,
      message: 'Bus route assignment updated successfully',
      busNumber: bus.busNumber,
      newRouteId: newRouteId
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to change bus route assignment',
      message: err.message
    });
  }
});


// PUT - Change status of a bus (Admin only)
router.put('/:busNumber/change-status', verifyUser, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || !req.user.admin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const { busNumber } = req.params;
    const { newStatus } = req.body;

    // Validate newStatus
    const allowedStatuses = ['active', 'inactive', 'maintenance', 'breakdown'];
    if (!newStatus || !allowedStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing required field: newStatus',
        allowedStatuses
      });
    }

    // Find the bus by its number
    const bus = await Bus.findOne({ busNumber: busNumber });
    if (!bus) {
      return res.status(404).json({
        success: false,
        error: 'Bus not found'
      });
    }

    // Update the status
    bus.currentStatus = newStatus;
    await bus.save();

    res.json({
      success: true,
      message: 'Bus status updated successfully',
      busNumber: bus.busNumber,
      newStatus: bus.currentStatus
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to change bus status',
      message: err.message
    });
  }
});

// POST - Change the driver of a bus (Admin only)
router.put('/:busNumber/change-driver', verifyUser, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || !req.user.admin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const { busNumber } = req.params;
    const { newDriverId } = req.body;

    // Validate newDriverId
    if (!newDriverId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: newDriverId'
      });
    }

    // Find the bus by its number
    const bus = await Bus.findOne({ busNumber: busNumber });
    if (!bus) {
      return res.status(404).json({
        success: false,
        error: 'Bus not found'
      });
    }

    // Update the driver
    await bus.changeDriver(newDriverId);

    res.json({
      success: true,
      message: 'Bus driver changed successfully',
      busNumber: bus.busNumber,
      newDriverId: bus.driverId
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to change bus driver',
      message: err.message
    });
  }
});

// PATCH - Update multiple details of a bus (Admin only)
router.patch('/:busNumber', verifyUser, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || !req.user.admin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const { busNumber } = req.params;
    const updateData = req.body;

    // Find the bus by its number
    const bus = await Bus.findOne({ busNumber: busNumber });
    if (!bus) {
      return res.status(404).json({
        success: false,
        error: 'Bus not found'
      });
    }

    // List of fields that can be updated directly
    const updatableFields = [
      'busNumber',
      'routeId',
      'currentStatus',
      'driverId',
      'schedule',
      'maintenance',
      'vehicleInfo',
      'location',
      'tracking',
      'operationalData'
    ];

    // Update allowed fields
    updatableFields.forEach(field => {
      if (updateData[field] !== undefined) {
        // If the field is an object, merge instead of replace
        if (typeof updateData[field] === 'object' && updateData[field] !== null && typeof bus[field] === 'object' && bus[field] !== null) {
          bus[field] = { ...bus[field]._doc || bus[field], ...updateData[field] };
        } else {
          bus[field] = updateData[field];
        }
      }
    });

    await bus.save();

    res.json({
      success: true,
      message: 'Bus details updated successfully',
      bus: bus
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to update bus details',
      message: err.message
    });
  }
});


module.exports = router;