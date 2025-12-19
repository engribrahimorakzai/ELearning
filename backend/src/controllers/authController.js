import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { email, password, full_name, role, bio, avatar_url } = req.body;

  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const user = await User.create({ email, password, full_name, role, bio, avatar_url });
  const token = generateToken(user.id);

  res.status(201).json({
    message: 'User registered successfully',
    user,
    token
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isPasswordValid = await User.verifyPassword(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken(user.id);

  // Remove password from response
  delete user.password;

  res.json({
    message: 'Login successful',
    user,
    token
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { full_name, bio, avatar_url } = req.body;

  const user = await User.update(req.user.id, { full_name, bio, avatar_url });

  res.json({
    message: 'Profile updated successfully',
    user
  });
});
