require("dotenv").config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectToDatabase = require("./db");
const userRoutes = require("./routes/user.route");
const stationRoutes = require("./routes/station.route")


mongoose
   .connect(process.env.MONGO_URI)
   .then(() => {
    console.log("Mongodb is connected");
   })
   .catch((err) => {
    console.log(err);
   })



const app = express();

app.use(express.json());
app.use(cookieParser());

app.listen(4000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});


app.use('/api', stationRoutes);
app.use('/api', userRoutes);


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});