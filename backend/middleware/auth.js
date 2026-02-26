const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from Authorization header
 * Attaches decoded user to req.user
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    return res.status(401).json({ error: 'Token verification failed.' });
  }
}

/**
 * Middleware to check if user has one of the required roles
 * Usage: authorize(['admin', 'sales'])
 * If roles array is empty, any authenticated user can access
 */
function authorize(roles = []) {
  return (req, res, next) => {
    // First verify token
    verifyToken(req, res, () => {
      // If no roles specified, any authenticated user can access
      if (roles.length === 0) {
        return next();
      }

      // Check if user has required role
      if (!req.user || !req.user.role) {
        return res.status(403).json({ error: 'Access denied. Invalid user data.' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Access denied. Insufficient permissions.',
          required: roles,
          current: req.user.role
        });
      }

      next();
    });
  };
}

/**
 * Middleware to check if user has specific permission
 * Usage: checkPermission('product:update')
 */
function checkPermission(permission) {
  return (req, res, next) => {
    verifyToken(req, res, () => {
      if (!req.user || !req.user.permissions) {
        return res.status(403).json({ error: 'Access denied. No permissions found.' });
      }

      const userPermissions = req.user.permissions || [];
      const hasPermission = userPermissions.includes(permission) || 
                           userPermissions.includes(permission.split(':')[0] + ':*') ||
                           userPermissions.includes('*');

      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Access denied. Insufficient permissions.',
          required: permission
        });
      }

      next();
    });
  };
}

module.exports = {
  verifyToken,
  authorize,
  checkPermission
};

