const prisma = require('../config/db');
const { asyncHandler, AppError } = require('../utils/helpers');

/**
 * Check if phone exists and start signup process
 */
const checkPhone = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  console.log(phone)

  if (!phone) {
    throw new AppError('Phone number is required', 400);
  }

  // Check if phone already exists
  const existingUser = await prisma.user.findUnique({
    where: { phone },
  });

  if (existingUser && existingUser.signupComplete) {
    // User exists and has completed signup
    return res.status(200).json({ 
      exists: true, 
      signupComplete: true,
      userId: existingUser.id
    });
  } else if (existingUser) {
    // User exists but hasn't completed signup
    return res.status(200).json({ 
      exists: true, 
      signupComplete: false,
      userId: existingUser.id,
      nextStep: getNextSignupStep(existingUser)
    });
  }

  // Create new user with phone
  const newUser = await prisma.user.create({
    data: {
      phone,
      signupComplete: false
    },
  });

  res.status(201).json({ 
    exists: false, 
    signupComplete: false,
    userId: newUser.id,
    nextStep: 'basic-info'
  });
});

/**
 * Save user's basic information (name, gender, birthdate)
 */
const saveBasicInfo = asyncHandler(async (req, res) => {
  const { userId, name, gender, birthDate } = req.body;

  if (!userId || !name || !gender || !birthDate) {
    throw new AppError('User ID, name, gender, and birth date are required', 400);
  }

  // Validate the user exists
  const user = await getUserById(userId);

  // Update user with basic info
  const updatedUser = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      name,
      gender,
      birthDate: new Date(birthDate)
    },
  });

  res.status(200).json({
    success: true,
    userId: updatedUser.id,
    nextStep: 'physical-attributes'
  });
});

/**
 * Save user's physical attributes (height, weight, ideal weight)
 */
const savePhysicalAttributes = asyncHandler(async (req, res) => {
  const { userId, height, weight, idealWeight } = req.body;

  if (!userId || !height || !weight || !idealWeight) {
    throw new AppError('User ID, height, weight, and ideal weight are required', 400);
  }

  // Validate the user exists
  const user = await getUserById(userId);

  // Update user with physical attributes
  const updatedUser = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      height: parseFloat(height),
      weight: parseFloat(weight),
      idealWeight: parseFloat(idealWeight)
    },
  });

  res.status(200).json({
    success: true,
    userId: updatedUser.id,
    nextStep: 'health-info'
  });
});

/**
 * Save user's health information (activity level, illnesses)
 */
const saveHealthInfo = asyncHandler(async (req, res) => {
  const { userId, activityLevel, illnesses } = req.body;

  if (!userId || !activityLevel) {
    throw new AppError('User ID and activity level are required', 400);
  }

  // Validate the user exists
  const user = await getUserById(userId);

  // Update user with activity level
  const updatedUser = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      activityLevel
    },
  });

  // Process illnesses if provided
  if (illnesses && illnesses.length > 0) {
    // Validate provided illness IDs exist
    const illnessIds = illnesses.map(i => parseInt(i.id));
    const found = await prisma.illness.findMany({
      where: { id: { in: illnessIds } },
      select: { id: true }
    });
    if (found.length !== illnessIds.length) {
      throw new AppError('One or more illness IDs are invalid', 400);
    }

    // Delete existing user illnesses
    await prisma.userIllness.deleteMany({
      where: { userId: parseInt(userId) }
    });

    // Create new user illnesses
    const userIllnessData = illnesses.map(illness => ({
      userId: parseInt(userId),
      illnessId: parseInt(illness.id),
      level: illness.level || 'MEDIUM'
    }));

    await prisma.userIllness.createMany({
      data: userIllnessData
    });
  }

  res.status(200).json({
    success: true,
    userId: updatedUser.id,
    nextStep: 'dietary-preferences'
  });
});

/**
 * Save user's dietary preferences (appetite mode, food preferences)
 */
const saveDietaryPreferences = asyncHandler(async (req, res) => {
  const { userId, appetiteMode, foodPreferences } = req.body;

  if (!userId || !appetiteMode) {
    throw new AppError('User ID and appetite mode are required', 400);
  }

  // Validate the user exists
  const user = await getUserById(userId);

  // Update user with appetite mode
  const updatedUser = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      appetiteMode
    },
  });

  // Process food preferences if provided
  if (foodPreferences && foodPreferences.length > 0) {
    // Delete existing user preferences
    await prisma.userFoodPreference.deleteMany({
      where: { userId: parseInt(userId) }
    });

    // Create new user preferences
    const userPreferenceData = foodPreferences.map(pref => ({
      userId: parseInt(userId),
      foodPreferenceId: parseInt(pref.id)
    }));

    await prisma.userFoodPreference.createMany({
      data: userPreferenceData
    });
  }

  res.status(200).json({
    success: true,
    userId: updatedUser.id,
    nextStep: 'allergies'
  });
});

/**
 * Save user's allergies
 */
const saveAllergies = asyncHandler(async (req, res) => {
  const { userId, allergies } = req.body;

  if (!userId) {
    throw new AppError('User ID is required', 400);
  }

  // Validate the user exists
  const user = await getUserById(userId);

  // Process allergies if provided
  if (allergies && allergies.length > 0) {
    // Delete existing user allergies
    await prisma.userAllergy.deleteMany({
      where: { userId: parseInt(userId) }
    });

    // Create new user allergies
    const userAllergyData = allergies.map(allergy => ({
      userId: parseInt(userId),
      allergyId: parseInt(allergy.id)
    }));

    await prisma.userAllergy.createMany({
      data: userAllergyData
    });
  }

  res.status(200).json({
    success: true,
    userId: user.id,
    nextStep: 'water-intake'
  });
});

/**
 * Save user's water intake
 */
const saveWaterIntake = asyncHandler(async (req, res) => {
  const { userId, waterIntake } = req.body;

  if (!userId || !waterIntake) {
    throw new AppError('User ID and water intake are required', 400);
  }

  // Validate the user exists
  const user = await getUserById(userId);

  // Update user with water intake
  const updatedUser = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      waterIntake: parseFloat(waterIntake)
    },
  });

  res.status(200).json({
    success: true,
    userId: updatedUser.id,
    nextStep: 'complete'
  });
});

/**
 * Complete the signup process
 */
const completeSignup = asyncHandler(async (req, res) => {
  const { userId, password } = req.body;

  if (!userId) {
    throw new AppError('User ID is required', 400);
  }

  // Validate the user exists
  const user = await getUserById(userId);

  // Update user signup status and password if provided
  const updateData = {
    signupComplete: true
  };

  if (password) {
    updateData.password = password; // In a real app, hash the password
  }

  const updatedUser = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: updateData,
  });

  res.status(200).json({
    success: true,
    userId: updatedUser.id,
    message: 'Signup completed successfully'
  });
});

/**
 * Get user's signup progress
 */
const getSignupProgress = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Validate the user exists
  const user = await getUserById(userId);

  // Get user with all related data
  const userWithData = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    include: {
      userIllnesses: {
        include: {
          illness: true
        }
      },
      userAllergies: {
        include: {
          allergy: true
        }
      },
      userPreferences: {
        include: {
          foodPreference: true
        }
      }
    }
  });

  const signupStatus = {
    userId: user.id,
    signupComplete: user.signupComplete,
    completedSteps: getCompletedSteps(userWithData),
    nextStep: getNextSignupStep(userWithData)
  };

  res.status(200).json(signupStatus);
});

/**
 * Get illnesses for reference data
 */
const getIllnesses = asyncHandler(async (req, res) => {
  const illnesses = await prisma.illness.findMany({
    orderBy: { name: 'asc' },
    include: {
      levels: true
    }
  });

  res.status(200).json(illnesses);
});

/**
 * Get allergies for reference data
 */
const getAllergies = asyncHandler(async (req, res) => {
  const allergies = await prisma.allergy.findMany({
    orderBy: { name: 'asc' }
  });

  res.status(200).json(allergies);
});

/**
 * Get food preferences for reference data
 */
const getFoodPreferences = asyncHandler(async (req, res) => {
  const foodPreferences = await prisma.foodPreference.findMany({
    orderBy: { name: 'asc' }
  });

  res.status(200).json(foodPreferences);
});

/**
 * Get activity levels with translations
 */
const getActivityLevels = asyncHandler(async (req, res) => {
  const activityLevels = [
    {
      id: 1,
      name: "Sedentary",
      name_fa: "کم تحرک",
      description: "Little to no exercise, desk job",
      description_fa: "تمرین کم یا بدون تمرین، شغل پشت میز"
    },
    {
      id: 2,
      name: "Lightly Active",
      name_fa: "کمی فعال",
      description: "Light exercise 1-3 days per week",
      description_fa: "تمرین سبک 1-3 روز در هفته"
    },
    {
      id: 3,
      name: "Moderately Active",
      name_fa: "نسبتا فعال",
      description: "Moderate exercise 3-5 days per week",
      description_fa: "تمرین متوسط 3-5 روز در هفته"
    },
    {
      id: 4,
      name: "Very Active",
      name_fa: "بسیار فعال",
      description: "Hard exercise 6-7 days per week",
      description_fa: "تمرین سخت 6-7 روز در هفته"
    },
    {
      id: 5,
      name: "Extremely Active",
      name_fa: "به شدت فعال",
      description: "Hard daily exercise and physical job or training twice a day",
      description_fa: "تمرین سخت روزانه و شغل فیزیکی یا تمرین دو بار در روز"
    }
  ];

  res.status(200).json(activityLevels);
});

/**
 * Get illnesses with levels and translations
 */
const getIllnessesWithLevels = asyncHandler(async (req, res) => {
  const illnesses = await prisma.illness.findMany({
    orderBy: { name: 'asc' }
  });

  // Use enum values from Prisma schema
  const illnessLevels = [
    {
      id: "LOW",
      name: "Low",
      name_fa: "کم"
    },
    {
      id: "MEDIUM",
      name: "Medium",
      name_fa: "متوسط"
    },
    {
      id: "HIGH",
      name: "High",
      name_fa: "زیاد"
    }
  ];

  res.status(200).json({
    illnesses,
    levels: illnessLevels
  });
});

/**
 * Get food preferences with translations 
 */
const getFullFoodPreferences = asyncHandler(async (req, res) => {
  const preferences = await prisma.foodPreference.findMany({
    orderBy: { name: 'asc' }
  });

  // Add translations for each preference
  const preferencesWithTranslations = preferences.map(pref => {
    return {
      ...pref,
      name_fa: pref.persianName || "" // Using nameFa if it exists in the DB, otherwise empty string
    };
  });

  res.status(200).json(preferencesWithTranslations);
});

/**
 * Get appetite modes with translations
 */
const getAppetiteModes = asyncHandler(async (req, res) => {
  // Try to get translations from database first
  let appetiteModeTranslations = [];
  try {
    appetiteModeTranslations = await prisma.appetiteModeTranslation.findMany();
  } catch (error) {
    // Table might not exist yet or be empty, handle gracefully
    console.log('Appetite mode translations table not found or empty', error);
  }

  // If translations exist in database, use them
  if (appetiteModeTranslations.length > 0) {
    const formattedModes = appetiteModeTranslations.map(trans => ({
      id: trans.mode,
      name: trans.mode.charAt(0) + trans.mode.slice(1).toLowerCase(),
      name_fa: trans.persianName
    }));
    return res.status(200).json(formattedModes);
  }

  // Fallback to hardcoded values if database doesn't have translations yet
  const appetiteModes = [
    {
      id: "LOW",
      name: "Low",
      name_fa: "کم"
    },
    {
      id: "NORMAL", 
      name: "Normal",
      name_fa: "معمولی"
    },
    {
      id: "HIGH",
      name: "High",
      name_fa: "زیاد"
    }
  ];

  res.status(200).json(appetiteModes);
});

/**
 * Helper function to get user by ID
 */
const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

/**
 * Helper function to determine the next signup step
 */
const getNextSignupStep = (user) => {
  if (!user.name || !user.gender || !user.birthDate) {
    return 'basic-info';
  }
  
  if (!user.height || !user.weight || !user.idealWeight) {
    return 'physical-attributes';
  }
  
  if (!user.activityLevel) {
    return 'health-info';
  }
  
  if (!user.appetiteMode) {
    return 'dietary-preferences';
  }
  
  if (!user.waterIntake) {
    return 'water-intake';
  }
  
  if (!user.signupComplete) {
    return 'complete';
  }
  
  return null; // All steps completed
};

/**
 * Helper function to get completed signup steps
 */
const getCompletedSteps = (user) => {
  const steps = [];
  
  if (user.phone) steps.push('phone');
  if (user.name && user.gender && user.birthDate) steps.push('basic-info');
  if (user.height && user.weight && user.idealWeight) steps.push('physical-attributes');
  if (user.activityLevel) steps.push('health-info');
  if (user.appetiteMode) steps.push('dietary-preferences');
  if (user.userAllergies && user.userAllergies.length > 0) steps.push('allergies');
  if (user.waterIntake) steps.push('water-intake');
  if (user.signupComplete) steps.push('complete');
  
  return steps;
};

/**
 * Get user data by phone number
 */
const getUserByPhone = asyncHandler(async (req, res) => {
  const { phone } = req.params;

  if (!phone) {
    throw new AppError('Phone number is required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { phone },
    include: {
      userIllnesses: {
        include: {
          illness: true
        }
      },
      userAllergies: {
        include: {
          allergy: true
        }
      },
      userPreferences: {
        include: {
          foodPreference: true
        }
      }
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      phone: user.phone,
      email: user.email,
      name: user.name,
      gender: user.gender,
      birthDate: user.birthDate,
      height: user.height,
      weight: user.weight,
      idealWeight: user.idealWeight,
      activityLevel: user.activityLevel,
      waterIntake: user.waterIntake,
      appetiteMode: user.appetiteMode,
      signupComplete: user.signupComplete,
      illnesses: user.userIllnesses.map(ui => ({
        id: ui.illness.id,
        name: ui.illness.name,
        persianName: ui.illness.persianName,
        level: ui.level
      })),
      allergies: user.userAllergies.map(ua => ({
        id: ua.allergy.id,
        name: ua.allergy.name,
        persianName: ua.allergy.persianName
      })),
      foodPreferences: user.userPreferences.map(up => ({
        id: up.foodPreference.id,
        name: up.foodPreference.name,
        persianName: up.foodPreference.persianName
      }))
    }
  });
});

module.exports = {
  checkPhone,
  saveBasicInfo,
  savePhysicalAttributes,
  saveHealthInfo,
  saveDietaryPreferences,
  saveAllergies,
  saveWaterIntake,
  completeSignup,
  getSignupProgress,
  getIllnesses,
  getAllergies,
  getFoodPreferences,
  getActivityLevels,
  getIllnessesWithLevels,
  getFullFoodPreferences,
  getAppetiteModes,
  getUserByPhone
}; 