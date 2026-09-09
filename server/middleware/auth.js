import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/helpers.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized. No token provided.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('User no longer exists.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Account has been deactivated.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired.', 401));
    }
    return next(new AppError('Not authorized.', 401));
  }
};
