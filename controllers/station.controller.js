const Station = require('../models/station.model');
const Train = require('../models/train.model');

const getAllTrainsInStation = async (req, res, next) => {
    try {
        const { station_id } = req.params;

        // Search for the station in the Station schema
        const station = await Station.findOne({ station_id });

        if (!station) {
            return res.status(404).json({ message: `Station with ID ${station_id} not found` });
        }

        // Find all trains with stops at the given station_id
        const trainsWithStops = await Train.find({ "stops.station_id": station_id })
            .populate({
                path: 'stops',
                match: { station_id }, // Filter stops to get only the ones at the specified station
                select: 'arrival_time departure_time -_id' // Select only necessary fields
            });

        // Extract relevant information from populated stops
        let trains = trainsWithStops.map(train => ({
            train_id: train.train_id,
            arrival_time: train.stops[0].arrival_time,
            departure_time: train.stops[0].departure_time
        }));

        // Sort the trains array based on the specified rules
        trains.sort((a, b) => {
            // Sort by departure time
            if (a.departure_time === null) return -1; // Null values first
            if (b.departure_time === null) return 1;
            if (a.departure_time === b.departure_time) {
                // Sort by arrival time if departure times are equal
                if (a.arrival_time === null) return -1;
                if (b.arrival_time === null) return 1;
                if (a.arrival_time === b.arrival_time) {
                    // Sort by train_id if arrival times are also equal
                    return a.train_id - b.train_id;
                }
                return a.arrival_time.localeCompare(b.arrival_time); // Ascending order
            }
            return a.departure_time.localeCompare(b.departure_time); // Ascending order
        });

        // Return the response with the sorted trains array
        return res.status(200).json({ station_id, trains });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllTrainsInStation };
