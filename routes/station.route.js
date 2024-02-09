const express = require('express');
const { getAllTrainsInStation } = require('../controllers/station.controller');
const router = express.Router();

router.get("/stations/:station_id/trains", getAllTrainsInStation);

module.exports = router