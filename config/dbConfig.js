const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Database Connected Successfully!")
    } catch (error) {
        console.log("Connection Error!", error.message)
    }
}

module.exports = connectDB