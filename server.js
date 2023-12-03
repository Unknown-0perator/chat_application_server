require('dotenv').config()
const express = require('express')
const app = express();
const mongoose = require('mongoose')
const connectDB = require('./config/dbConn');
const userRoutes = require('./routers/users');
const authRoutes = require('./routers/auth');

connectDB();
const { PORT } = process.env;
app.use(express.json());

app.use('/users', userRoutes);
app.use('/auth', authRoutes);

mongoose.connection.once('open', () => {
    console.log('connected to MongoDB')
    app.listen(PORT, () => {
        console.log(`listening on port ${PORT}`)
    })
})

