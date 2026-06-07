import jwt from 'jsonwebtoken';
import { getRequiredEnv } from '../config/env.js';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Not authorized to access this route' });
    }

    try {
      const decoded = jwt.verify(token, getRequiredEnv('JWT_SECRET'));

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res
          .status(401)
          .json({ message: 'User no longer exists' });
      }

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(500).json({ message: 'Server error' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export default protect;
