import express, { json } from 'express';
import { connect } from 'mongoose';
import cors from 'cors';
import { Server as socketIo } from 'socket.io';
import http from 'http';
import { config } from 'dotenv';
import userRoutes from './routes/users.js';
import storyRoutes from './routes/stories.js';
import authRoutes from './routes/authRoutes.js';

config();  // Load environment variables

const app = express();
const server = http.createServer(app);

// Setting up Socket.IO with CORS
const io = new socketIo(server, {
    cors: {
        origin: 'https://storytelling-client.vercel.app',  // Update to your deployed frontend
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// CORS setup for API
app.use(cors({
    // origin: 'https://storytelling-client.vercel.app',  // Frontend origin
    // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'Authorization'],
    // credentials: true
      origin: [
        'https://storytelling-client.vercel.app',  // Original frontend origin
        'https://storytelling-client-bf24x6fyg-azizuls-projects-69ab18f1.vercel.app'  // New frontend origin
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Handle preflight requests (OPTIONS)
app.options('*', cors());

// Middleware to parse JSON requests
app.use(json());

// Test route to ensure server is running
app.get('/', (req, res) => {
    res.json({ message: "Hello from the server!" });
});

// Socket.IO events
io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('trackData', (data) => {
        // Handle tracking data here
        io.emit('dataUpdate', data);  // Emit data back to all clients
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// MongoDB Connection
connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes for API
app.use('/api/users', userRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/auth', authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
