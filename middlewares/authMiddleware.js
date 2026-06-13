const { verifyToken } = require('../utils/tokenService');

const authMiddleware = (request, response, next) => {
    try {
        // Get token from header
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return response.status(401).json({
                success: false,
                message: 'No token provided. Authorization header must be: Bearer [token]'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return response.status(401).json({
                success: false,
                message: 'Token is missing'
            });
        }

        const decoded = verifyToken(token);
        request.user = decoded;

        next(); // proceed to the next middleware 
    } catch (error) {
        return response.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            error: error.message
        });
    }
};

module.exports = authMiddleware;