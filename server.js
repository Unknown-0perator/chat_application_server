require('dotenv').config()
const express = require('express')
const app = express();
const mongoose = require('mongoose')
const connectDB = require('./config/dbConn');


connectDB();




const { PORT } = process.env;

mongoose.connection.once('open', () => {
    console.log('connected to MongoDB')
    app.listen(PORT, () => {
        console.log(`listening on port ${PORT}`)
    })
})

