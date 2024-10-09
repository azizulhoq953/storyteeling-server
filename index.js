import express, { json } from 'express';
import { connect } from 'mongoose';
import cors from 'cors';
import { Server as socketIo } from 'socket.io';
import http from 'http';
import { config } from 'dotenv';
import userRoutes from './routes/users.js';
import storyRoutes from './routes/stories.js';
import authRoutes from './routes/authRoutes.js';

config();  

const app = express();
const server = http.createServer(app);


const io = new socketIo(server, {
    cors: {
        origin: 'http://localhost:3000', 
        methods: ['GET', 'POST'],
        credentials: true  
    }
});



app.use(cors({
    origin: 'http://localhost:3000',  // Frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allow all required methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Allow necessary headers
    credentials: true  
}));
// Handle preflight requests for all routes
app.options('*', cors()); 
// Middleware
app.use(json());  
// app.use(cors(corsOptions));

io.on('connection', (socket) => {
    console.log('New client connected');
    
    
    socket.on('trackData', (data) => {
        // Handle tracking data here
        io.emit('dataUpdate', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));


app.use('/api/users', userRoutes);       
app.use('/api/stories', storyRoutes);    
app.use('/api/auth', authRoutes);  
// app.put('/api/stories/edit/:id',storyRoutes)  
   

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
