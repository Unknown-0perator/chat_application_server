const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const userRoutes = require('./routers/users');
const cors = require('cors');
const Message = require('./model/Message');

const { CORS_ORIGIN, PORT } = process.env;

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: CORS_ORIGIN,
        methods: ['GET', 'POST'],
    },
});

connectDB();

app.use(express.json());
app.use(cors({ origin: CORS_ORIGIN }));
app.use('/user', userRoutes);
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('chat message', async (message) => {
        console.log('Received message:', message);

        try {
            const chatMessage = new Message({
                senderId: message.senderId,
                recipientId: message.recipientId,
                text: message.text,
                timestamp: message.timestamp,
            });

            await chatMessage.save();
            io.emit('chat message', message);
        } catch (error) {
            console.error('Error saving message to MongoDB:', error);
        }
    });
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
});
