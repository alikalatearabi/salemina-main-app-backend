const prisma = require('../config/db');
const { asyncHandler, AppError } = require('../utils/helpers');

// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  res.json(users);
});

// Get a single user by ID
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json(user);
});

// Create a new user
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Simple validation
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // Check if user with email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password, // Note: In a real app, password should be hashed
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(201).json(newUser);
});

// Update a user
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    // Handle case where user doesn't exist
    if (error.code === 'P2025') {
      throw new AppError('User not found', 404);
    }
    throw error;
  }
});

// Delete a user
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (error) {
    // Handle case where user doesn't exist
    if (error.code === 'P2025') {
      throw new AppError('User not found', 404);
    }
    throw error;
  }
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
}; 