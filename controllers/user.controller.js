const User = require("../models/user.model");
const Station = require("../models/station.model");
const Train = require('../models/train.model');


const addUser = async (req, res, next) => {
    const { user_id, user_name, balance } = req.body;

    try {
        // Check if user_id already exists
        const existingUser = await User.findOne({ user_id });

        if (existingUser) {
            return res.status(400).json({ message: 'User ID already exists' });
        }

        const newuser = new User({
            user_id,
            user_name,
            balance
        });

        await newuser.save();
        
        const responseUser = {
            user_id: newuser.user_id,
            user_name: newuser.user_name,
            balance: newuser.balance
        };

        return res.status(201).json(responseUser);
    } catch (error) {
        next(error);
    }
};



const addStation = async (req, res, next) => {
    const { station_id, station_name, longitude, latitude } = req.body;

    try {
        // Check if station_id already exists
        const existingStation = await Station.findOne({ station_id });

        if (existingStation) {
            return res.status(400).json({ message: 'Station ID already exists' });
        }

        const newStation = new Station({
            station_id,
            station_name,
            longitude,
            latitude
        });

        await newStation.save();
        
        const responseStation = {
            station_id: newStation.station_id,
            station_name: newStation.station_name,
            longitude: newStation.longitude,
            latitude: newStation.latitude
        };

        return res.status(201).json(responseStation);
    } catch (error) {
        next(error);
    }
};

// train.controller.js


const addTrain = async (req, res, next) => {
    const { train_id, train_name, capacity, stops } = req.body;

    try {
        const newTrain = new Train({
            train_id,
            train_name,
            capacity,
            stops
        });

        await newTrain.save();

        const service_start = newTrain.stops[0].departure_time;
        const service_ends = newTrain.stops[newTrain.stops.length - 1].arrival_time;
        const num_stations = newTrain.stops.length;

        const responseTrain = {
            train_id: newTrain.train_id,
            train_name: newTrain.train_name,
            capacity: newTrain.capacity,
            service_start,
            service_ends,
            num_stations
        };

        return res.status(201).json(responseTrain);
    } catch (error) {
        next(error);
    }
};

const getAllStations = async (req, res, next) => {
    try {
        // Find all stations and sort them by station_id in ascending order
        const stations = await Station.find().sort({ station_id: 1 });

        // Format the stations array according to the response model
        const formattedStations = stations.map(station => ({
            station_id: station.station_id,
            station_name: station.station_name,
            longitude: station.longitude,
            latitude: station.latitude
        }));

        // Construct the response object
        const response = {
            stations: formattedStations
        };

        // Send the successful response with status code 200
        return res.status(200).json(response);
    } catch (error) {
        // Forward the error to the error handling middleware
        next(error);
    }
};

const getWallet = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        // Find the user with the given wallet ID
        const user = await User.findOne({ user_id: parseInt(user_id) });

        // If user not found, return 404 error
        if (!user) {
            return res.status(404).json({ message: `Wallet with ID ${user_id} was not found` });
        }

        // Construct the response object
        const walletInfo = {
            wallet_id: user.user_id,
            balance: user.balance,
            wallet_user: {
                user_id: user.user_id,
                user_name: user.user_name
            }
        };

        // Return the wallet information
        return res.status(200).json(walletInfo);
    } catch (error) {
        // Handle any errors
        next(error);
    }
};


const addWalletBalance = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const { recharge } = req.body;

        // Find the user with the provided user_id
        const user = await User.findOne({ user_id });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: `User with ID ${user_id} was not found` });
        }

        // Validate recharge amount range (between 100 and 10000)
        if (recharge < 100 || recharge > 10000) {
            return res.status(400).json({ message: `Invalid amount: ${recharge}` });
        }

        // Update user balance
        user.balance += recharge;

        // Save the updated user balance
        await user.save();

        // Return success response with updated user object
        return res.status(200).json({
            wallet_id: user.user_id,
            balance: user.balance,
            wallet_user: {
                user_id: user.user_id,
                user_name: user.user_name
            }
        });
    } catch (error) {
        next(error);
    }
};


const purchaseTicket = async (req, res, next) => {
    try {
        const { wallet_id, time_after, station_from, station_to } = req.body;

        // Find the user with the provided wallet_id
        const user = await User.findOne({ user_id: wallet_id });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: `User with wallet ID ${wallet_id} was not found` });
        }

        // Find the available trains for the given stations and departure time after time_after
        const availableTrains = await Train.find({
            'stops.station_id': { $all: [station_from, station_to] },
            'stops.departure_time': { $gte: time_after }
        });

        // Check if any trains are available for the route
        if (availableTrains.length === 0) {
            return res.status(403).json({ message: `No ticket available for station: ${station_from} to station: ${station_to}` });
        }

        // Calculate total fare for the trip
        let totalFare = 0;
        for (const train of availableTrains) {
            const fromIndex = train.stops.findIndex(stop => stop.station_id === station_from);
            const toIndex = train.stops.findIndex(stop => stop.station_id === station_to);
            if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
                for (let i = fromIndex; i < toIndex; i++) {
                    totalFare += train.stops[i].fare;
                }
            }
        }

        // Check if user has sufficient balance
        if (user.balance < totalFare) {
            const shortageAmount = totalFare - user.balance;
            return res.status(402).json({ message: `Recharge amount: ${shortageAmount} to purchase the ticket` });
        }

        // Deduct fare from user's balance
        user.balance -= totalFare;

        // Save the updated balance
        await user.save();

        // Generate ticket ID
        const ticketId = Math.floor(Math.random() * 1000) + 1;

        // Prepare response
        const response = {
            ticket_id: ticketId,
            wallet_id: user.user_id,
            balance: user.balance,
            stations: []
        };

        // Populate response with station and train details
        for (const train of availableTrains) {
            const fromIndex = train.stops.findIndex(stop => stop.station_id === station_from);
            const toIndex = train.stops.findIndex(stop => stop.station_id === station_to);
            if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
                response.stations.push({
                    station_id: station_from,
                    train_id: train.train_id,
                    arrival_time: fromIndex === 0 ? null : train.stops[fromIndex - 1].departure_time,
                    departure_time: train.stops[fromIndex].departure_time
                });
                response.stations.push({
                    station_id: station_to,
                    train_id: train.train_id,
                    arrival_time: train.stops[toIndex - 1].arrival_time,
                    departure_time: null
                });
                break;
            }
        }

        // Return success response with ticket details
        return res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};


const planningRoutes = async (req, res, next) => {
    try {
        const { from, to } = req.query;
        const optimize = req.query.optimize; // Extracting the 'optimize' field from the query parameters

        // Find the starting and destination stations
        const startingStation = await Station.findOne({ station_id: from });
        const destinationStation = await Station.findOne({ station_id: to });

        // Check if the stations exist
        if (!startingStation || !destinationStation) {
            return res.status(404).json({ message: `Stations not found` });
        }

        // Find all trains with stops at both starting and destination stations
        const trainsWithStops = await Train.find({
            'stops.station_id': { $all: [from, to] }
        }).populate({
            path: 'stops',
            match: { station_id: { $in: [from, to] } },
            select: 'station_id arrival_time departure_time -_id',
            options: { sort: { 'stops.station_id': 1 } }
        });

        // Check if any trains are available for the route
        if (trainsWithStops.length === 0) {
            return res.status(403).json({ message: `No routes available from station: ${from} to station: ${to}` });
        }

        // Calculate total cost and time based on optimization
        let totalCost = 0;
        let totalTime = 0;
        const stations = [];

        // Sort trains based on optimization parameter
        const sortedTrains = trainsWithStops.sort((a, b) => {
            if (optimize === 'cost') {
                return calculateTotalFare(a) - calculateTotalFare(b);
            } else if (optimize === 'time') {
                return calculateTotalTime(a) - calculateTotalTime(b);
            }
            return 0;
        });

        // Iterate through sorted trains
        for (const train of sortedTrains) {
            const [firstStop, lastStop] = train.stops;

            const fromStop = firstStop.station_id === from ? firstStop : lastStop;
            const toStop = firstStop.station_id === to ? firstStop : lastStop;

            // Calculate time difference
            const arrivalTime = new Date(fromStop.arrival_time);
            const departureTime = new Date(toStop.departure_time);
            const timeDifference = (departureTime - arrivalTime) / (1000 * 60); // Convert milliseconds to minutes

            // Calculate cost based on the sum of fares
            const cost = calculateTotalFare(train);

            // Add to total cost and time based on optimization
            totalCost += cost;
            totalTime += timeDifference;

            // Push stations data
            stations.push({
                station_id: fromStop.station_id,
                train_id: train.train_id,
                arrival_time: firstStop.station_id === from ? null : fromStop.arrival_time,
                departure_time: lastStop.station_id === to ? null : toStop.departure_time
            });
        }

        // Prepare response
        const response = {
            total_cost: totalCost,
            total_time: totalTime,
            stations: stations
        };

        // Return success response with route details
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

// Helper function to calculate total fare for a train
const calculateTotalFare = (train) => {
    let totalFare = 0;
    for (const stop of train.stops) {
        totalFare += stop.fare;
    }
    return totalFare;
};

// Helper function to calculate total time for a train
const calculateTotalTime = (train) => {
    const [firstStop, lastStop] = train.stops;
    const arrivalTime = new Date(firstStop.arrival_time);
    const departureTime = new Date(lastStop.departure_time);
    return (departureTime - arrivalTime) / (1000 * 60); // Convert milliseconds to minutes
};

module.exports = { addUser, addStation, addTrain, getAllStations, getWallet, addWalletBalance, purchaseTicket, planningRoutes }