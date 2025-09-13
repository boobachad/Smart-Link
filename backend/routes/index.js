const express = require('express');
const router = express.Router();
const {findNearerPoints} = require('../modules/nearerPoints');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/nearby', async (req, res) => {
  const { lat, lon, limit } = req.query;
  if (!lat || !lon) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
  }
  try {
      const points = await findNearerPoints(parseFloat(lat), parseFloat(lon), parseInt(limit) || 5);
      res.status(200).json({ success: true, data: points });
  } catch (error) {
      console.error('Error fetching nearby points:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
