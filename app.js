require('dotenv').config();
const express = require('express');
const app = express();
const { rateLimit } = require('express-rate-limit');
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');


// Database
const connectDB = require('./config/dbConfig');

// Routes
const authRoutes = require('./routes/authRoute')
const postRoutes = require('./routes/postRoute')
const userRoutes = require('./routes/userRoute')
const messageRoutes = require('./routes/messageRoute')
const notificationRoutes = require('./routes/notificationRoute')
const searchRoutes = require('./routes/searchRoute')

app.set('trust proxy' , true)
// Connect to Database
connectDB();

// Middleware
app.use(express.json());
const corsOrigin = process.env.NODE_ENV === 'development'
    ? /^http:\/\/localhost:\d+$/
    : process.env.ALLOWED_ORIGIN;

app.use(cors({
    origin: corsOrigin,
    credentials: true
}));

// RateLimiter
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs
    validate: { xForwardedForHeader: false },
    message: { message: 'Too many requests, please try again after 15 minutes.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // limit each IP to 20 login attempts per windowMs
    validate: { xForwardedForHeader: false },
    message: { message: 'Too many login attempts, please try again after 15 minutes.' }
});

app.use(generalLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use("/uploads", express.static(path.join((__dirname), "uploads")));



const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: corsOrigin, credentials: true }
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
    socket.on('disconnect', () => console.log(`Client disconnected: ${socket.id}`));
});

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
