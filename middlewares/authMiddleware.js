const { verifyToken } = require('../utils/tokenService');

const authMiddleware = (request, response, next) => {
    try {
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

        next();
    } catch (error) {
        return response.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            error: error.message
        });
    }
};

module.exports = authMiddleware;