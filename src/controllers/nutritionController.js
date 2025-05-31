const prisma = require('../config/db');
const { asyncHandler, AppError } = require('../utils/helpers');

/**
 * Add a consumed product for a user
 */
const addConsumedProduct = asyncHandler(async (req, res) => {
  const { userId, productId, quantity, servingSize, mealType, consumedAt, unit } = req.body;

  if (!userId || !productId || !quantity || !mealType) {
    throw new AppError('User ID, product ID, quantity, and meal type are required', 400);
  }

  // Verify the user and product exist
  const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Handle unit conversion if needed
  let normalizedServingSize = servingSize ? parseFloat(servingSize) : null;
  
  // Convert to standard units (grams/ml) if a different unit is specified
  if (normalizedServingSize && unit) {
    const unitLower = unit.toLowerCase();
    
    if (unitLower === 'tablespoon' || unitLower === 'tbsp') {
      // Convert tablespoon to grams/ml (approximately 15ml or 15g)
      normalizedServingSize = normalizedServingSize * 15;
    } else if (unitLower === 'teaspoon' || unitLower === 'tsp') {
      // Convert teaspoon to grams/ml (approximately 5ml or 5g)
      normalizedServingSize = normalizedServingSize * 5;
    } else if (unitLower === 'cup') {
      // Convert cup to grams/ml (approximately 240ml)
      normalizedServingSize = normalizedServingSize * 240;
    } else if (unitLower === 'oz' || unitLower === 'ounce') {
      // Convert ounce to grams/ml (approximately 28g)
      normalizedServingSize = normalizedServingSize * 28.35;
    }
    // Units 'g', 'gram', 'ml', 'milliliter' are already in the standard unit
  }

  const consumedProduct = await prisma.userConsumedProduct.create({
    data: {
      userId: parseInt(userId),
      productId: parseInt(productId),
      quantity: parseFloat(quantity),
      servingSize: normalizedServingSize,
      mealType,
      consumedAt: consumedAt ? new Date(consumedAt) : new Date(),
      // Store the original unit for reference if needed
      unit: unit || null
    },
    include: {
      product: true,
    },
  });

  res.status(201).json(consumedProduct);
});

/**
 * Get consumed products for a user with optional date filtering
 */
const getUserConsumedProducts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { startDate, endDate, mealType } = req.query;

  if (!userId) {
    throw new AppError('User ID is required', 400);
  }

  // Build filter object
  const filter = {
    userId: parseInt(userId),
  };

  // Add date range filter if provided
  if (startDate || endDate) {
    filter.consumedAt = {};
    
    if (startDate) {
      filter.consumedAt.gte = new Date(startDate);
    }
    
    if (endDate) {
      filter.consumedAt.lte = new Date(endDate);
    }
  }

  // Add meal type filter if provided
  if (mealType) {
    filter.mealType = mealType;
  }

  const consumedProducts = await prisma.userConsumedProduct.findMany({
    where: filter,
    include: {
      product: true,
    },
    orderBy: {
      consumedAt: 'desc',
    },
  });

  res.status(200).json(consumedProducts);
});

/**
 * Delete a consumed product entry
 */
const deleteConsumedProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError('Consumed product ID is required', 400);
  }

  const consumedProduct = await prisma.userConsumedProduct.findUnique({
    where: { id: parseInt(id) },
  });

  if (!consumedProduct) {
    throw new AppError('Consumed product not found', 404);
  }

  await prisma.userConsumedProduct.delete({
    where: { id: parseInt(id) },
  });

  res.status(204).send();
});

/**
 * Get daily nutrition summary for dashboard
 */
const getDailyNutritionSummary = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { date } = req.query;

  if (!userId) {
    throw new AppError('User ID is required', 400);
  }

  // Set up the date range for the query (specific day)
  const targetDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

  // Get consumed products for the specified day
  const consumedProducts = await prisma.userConsumedProduct.findMany({
    where: {
      userId: parseInt(userId),
      consumedAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      product: true,
    },
  });

  // Calculate nutrition totals
  const summary = calculateNutritionSummary(consumedProducts);
  
  // Add meal-specific breakdowns
  const mealBreakdown = await getMealBreakdown(userId, startOfDay, endOfDay);

  // Get user's recommended daily values
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      recommendedDailyCalories: true,
      recommendedDailySalt: true,
      recommendedDailySugar: true,
      recommendedDailyFat: true,
      recommendedDailyTransFattyAcids: true
    }
  });
  
  res.status(200).json({
    date: startOfDay.toISOString().split('T')[0],
    totalCalories: summary.calories,
    totalFat: summary.fat,
    totalSugar: summary.sugar,
    totalSalt: summary.salt,
    totalProtein: summary.protein,
    totalCarbs: summary.carbs,
    totalTransFattyAcids: summary.transfattyAcids,
    mealBreakdown,
    consumedProducts: consumedProducts.map(formatConsumedProduct),
    recommended: {
      calories: user.recommendedDailyCalories,
      salt: user.recommendedDailySalt,
      sugar: user.recommendedDailySugar,
      fat: user.recommendedDailyFat,
      transfattyAcids: user.recommendedDailyTransFattyAcids
    }
  });
});

/**
 * Get weekly nutrition summary for dashboard
 */
const getWeeklyNutritionSummary = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { endDate } = req.query;

  if (!userId) {
    throw new AppError('User ID is required', 400);
  }

  // Set up the date range for the query (week ending on the specified date)
  const endOfWeek = endDate ? new Date(endDate) : new Date();
  endOfWeek.setHours(23, 59, 59, 999);
  
  const startOfWeek = new Date(endOfWeek);
  startOfWeek.setDate(endOfWeek.getDate() - 6); // 7 days including end date
  startOfWeek.setHours(0, 0, 0, 0);

  // Get daily summaries for the week
  const dailySummaries = await getDailySummariesForRange(userId, startOfWeek, endOfWeek);
  
  // Calculate weekly totals
  const weeklyTotals = dailySummaries.reduce((totals, day) => {
    totals.calories += day.calories || 0;
    totals.fat += day.fat || 0;
    totals.sugar += day.sugar || 0;
    totals.salt += day.salt || 0;
    totals.protein += day.protein || 0;
    totals.carbs += day.carbs || 0;
    return totals;
  }, { calories: 0, fat: 0, sugar: 0, salt: 0, protein: 0, carbs: 0 });

  // Calculate daily averages
  const daysCount = dailySummaries.length;
  const dailyAverages = {
    calories: daysCount ? weeklyTotals.calories / daysCount : 0,
    fat: daysCount ? weeklyTotals.fat / daysCount : 0,
    sugar: daysCount ? weeklyTotals.sugar / daysCount : 0,
    salt: daysCount ? weeklyTotals.salt / daysCount : 0,
    protein: daysCount ? weeklyTotals.protein / daysCount : 0,
    carbs: daysCount ? weeklyTotals.carbs / daysCount : 0,
  };

  res.status(200).json({
    startDate: startOfWeek.toISOString().split('T')[0],
    endDate: endOfWeek.toISOString().split('T')[0],
    weeklyTotals,
    dailyAverages,
    dailySummaries
  });
});

/**
 * Get monthly nutrition summary for dashboard
 */
const getMonthlyNutritionSummary = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { month, year } = req.query;

  if (!userId) {
    throw new AppError('User ID is required', 400);
  }

  // Set up the date range for the query (specific month)
  const currentDate = new Date();
  const targetYear = year ? parseInt(year) : currentDate.getFullYear();
  const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth(); // 0-indexed month
  
  const startOfMonth = new Date(targetYear, targetMonth, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

  // Get weekly summaries for the month
  const weeks = [];
  let startOfWeek = new Date(startOfMonth);
  
  while (startOfWeek <= endOfMonth) {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    
    // Ensure endOfWeek doesn't go beyond the month
    const adjustedEndOfWeek = endOfWeek > endOfMonth ? endOfMonth : endOfWeek;
    
    const weekSummaries = await getDailySummariesForRange(userId, startOfWeek, adjustedEndOfWeek);
    
    // Calculate weekly totals
    const weeklyTotals = weekSummaries.reduce((totals, day) => {
      totals.calories += day.calories || 0;
      totals.fat += day.fat || 0;
      totals.sugar += day.sugar || 0;
      totals.salt += day.salt || 0;
      totals.protein += day.protein || 0;
      totals.carbs += day.carbs || 0;
      return totals;
    }, { calories: 0, fat: 0, sugar: 0, salt: 0, protein: 0, carbs: 0 });
    
    weeks.push({
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: adjustedEndOfWeek.toISOString().split('T')[0],
      ...weeklyTotals
    });
    
    // Move to the next week
    startOfWeek = new Date(endOfWeek);
    startOfWeek.setDate(startOfWeek.getDate() + 1);
  }

  // Calculate monthly totals
  const monthlyTotals = weeks.reduce((totals, week) => {
    totals.calories += week.calories || 0;
    totals.fat += week.fat || 0;
    totals.sugar += week.sugar || 0;
    totals.salt += week.salt || 0;
    totals.protein += week.protein || 0;
    totals.carbs += week.carbs || 0;
    return totals;
  }, { calories: 0, fat: 0, sugar: 0, salt: 0, protein: 0, carbs: 0 });

  // Get daily summaries for top stats
  const dailySummaries = await getDailySummariesForRange(userId, startOfMonth, endOfMonth);

  // Find highest and lowest calorie days
  const daysWithData = dailySummaries.filter(day => day.calories !== undefined && day.calories > 0);
  let highestCalorieDay = null;
  let lowestCalorieDay = null;
  
  if (daysWithData.length > 0) {
    highestCalorieDay = daysWithData.reduce((highest, day) => 
      day.calories > highest.calories ? day : highest, daysWithData[0]);
      
    lowestCalorieDay = daysWithData.reduce((lowest, day) => 
      day.calories < lowest.calories ? day : lowest, daysWithData[0]);
  }

  res.status(200).json({
    year: targetYear,
    month: targetMonth + 1,
    startDate: startOfMonth.toISOString().split('T')[0],
    endDate: endOfMonth.toISOString().split('T')[0],
    monthlyTotals,
    weeklySummaries: weeks,
    highestCalorieDay,
    lowestCalorieDay
  });
});

/**
 * Helper function to calculate nutrition summary from consumed products
 */
const calculateNutritionSummary = (consumedProducts) => {
  const summary = {
    calories: 0,
    fat: 0,
    sugar: 0,
    salt: 0,
    protein: 0,
    carbs: 0,
    transfattyAcids: 0
  };

  consumedProducts.forEach(consumed => {
    const product = consumed.product;
    const multiplier = consumed.quantity * (consumed.servingSize || 1);

    summary.calories += (product.calorie || 0) * multiplier;
    summary.fat += (product.fat || 0) * multiplier;
    summary.sugar += (product.sugar || 0) * multiplier;
    summary.salt += (product.salt || 0) * multiplier;
    summary.protein += (parseFloat(product.protein) || 0) * multiplier;
    summary.carbs += (parseFloat(product.carbohydrate) || 0) * multiplier;
    summary.transfattyAcids += (product.transfattyAcids || 0) * multiplier;
  });

  return summary;
};

/**
 * Get meal breakdown for a specific time range
 */
const getMealBreakdown = async (userId, startDate, endDate) => {
  const consumedProducts = await prisma.userConsumedProduct.findMany({
    where: {
      userId: parseInt(userId),
      consumedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      product: true,
    },
  });

  const mealBreakdown = {
    breakfast: { calories: 0, fat: 0, sugar: 0, salt: 0, protein: 0, carbs: 0, transfattyAcids: 0 },
    lunch: { calories: 0, fat: 0, sugar: 0, salt: 0, protein: 0, carbs: 0, transfattyAcids: 0 },
    dinner: { calories: 0, fat: 0, sugar: 0, salt: 0, protein: 0, carbs: 0, transfattyAcids: 0 },
    snack: { calories: 0, fat: 0, sugar: 0, salt: 0, protein: 0, carbs: 0, transfattyAcids: 0 }
  };

  consumedProducts.forEach(consumed => {
    const product = consumed.product;
    const multiplier = consumed.quantity * (consumed.servingSize || 1);
    const mealType = consumed.mealType.toLowerCase();

    if (mealBreakdown[mealType]) {
      mealBreakdown[mealType].calories += (product.calorie || 0) * multiplier;
      mealBreakdown[mealType].fat += (product.fat || 0) * multiplier;
      mealBreakdown[mealType].sugar += (product.sugar || 0) * multiplier;
      mealBreakdown[mealType].salt += (product.salt || 0) * multiplier;
      mealBreakdown[mealType].protein += (parseFloat(product.protein) || 0) * multiplier;
      mealBreakdown[mealType].carbs += (parseFloat(product.carbohydrate) || 0) * multiplier;
      mealBreakdown[mealType].transfattyAcids += (product.transfattyAcids || 0) * multiplier;
    }
  });

  return mealBreakdown;
};

/**
 * Helper function to get daily summaries for a date range
 */
const getDailySummariesForRange = async (userId, startDate, endDate) => {
  // Clone the dates to avoid modifying the original ones
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const dailySummaries = [];
  const currentDate = new Date(start);
  
  // Loop through each day in the range
  while (currentDate <= end) {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    // Get consumed products for this day
    const consumedProducts = await prisma.userConsumedProduct.findMany({
      where: {
        userId: parseInt(userId),
        consumedAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: {
        product: true,
      },
    });
    
    const summary = calculateNutritionSummary(consumedProducts);
    
    dailySummaries.push({
      date: dayStart.toISOString().split('T')[0],
      ...summary,
      consumedCount: consumedProducts.length
    });
    
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dailySummaries;
};

/**
 * Helper function to format consumed product data
 */
const formatConsumedProduct = (consumedProduct) => {
  const { product, quantity, servingSize, mealType, consumedAt } = consumedProduct;
  const factor = quantity * (servingSize ? (servingSize / product.per) : 1);
  
  return {
    id: consumedProduct.id,
    productId: product.id,
    barcode: product.barcode,
    productName: product.productName,
    brand: product.brand,
    quantity,
    servingSize,
    mealType,
    consumedAt,
    nutritionalValues: {
      calories: (product.calorie || 0) * factor,
      fat: (product.fat || 0) * factor,
      sugar: (product.sugar || 0) * factor,
      salt: (product.salt || 0) * factor,
      protein: product.protein ? parseFloat(product.protein) * factor : 0,
      carbs: product.carbohydrate ? parseFloat(product.carbohydrate) * factor : 0,
    }
  };
};

/**
 * Get user's daily nutrient consumption for home page
 * Shows specific nutrient factors: transfattyAcids, fat, sugar, salt, and calorie
 */
const getUserHomeNutritionStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { date } = req.query;

  if (!userId) {
    throw new AppError('User ID is required', 400);
  }

  // Set up the date range for the query (specific day)
  const targetDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

  // Get consumed products for the specified day
  const consumedProducts = await prisma.userConsumedProduct.findMany({
    where: {
      userId: parseInt(userId),
      consumedAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      product: true,
    },
  });

  // Calculate nutrition totals for the specific nutrients required for home page
  let nutritionTotals = {
    transfattyAcids: 0,
    fat: 0,
    sugar: 0, 
    salt: 0,
    calorie: 0
  };

  // Process each consumed product
  consumedProducts.forEach(item => {
    const { product, quantity, servingSize } = item;
    const multiplier = servingSize && product.servingSize 
      ? (quantity * servingSize) / product.servingSize 
      : quantity;

    nutritionTotals.transfattyAcids += (product.transfattyAcids || 0) * multiplier;
    nutritionTotals.fat += (product.fat || 0) * multiplier;
    nutritionTotals.sugar += (product.sugar || 0) * multiplier;
    nutritionTotals.salt += (product.salt || 0) * multiplier;
    nutritionTotals.calorie += (product.calorie || 0) * multiplier;
  });

  // Get user's recommended daily intake if available
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      recommendedDailyCalories: true,
      recommendedDailyFat: true,
      recommendedDailySugar: true,
      recommendedDailySalt: true
    }
  });

  // Default recommended values if user-specific ones are not set
  const recommendedIntake = {
    transfattyAcids: 2, // Default value in grams
    fat: user?.recommendedDailyFat || 70, // Default value in grams
    sugar: user?.recommendedDailySugar || 30, // Default value in grams
    salt: user?.recommendedDailySalt || 5, // Default value in grams
    calorie: user?.recommendedDailyCalories || 2000 // Default value in kcal
  };

  // Calculate percentage of recommended intake consumed
  const nutritionPercentage = {
    transfattyAcids: (nutritionTotals.transfattyAcids / recommendedIntake.transfattyAcids) * 100,
    fat: (nutritionTotals.fat / recommendedIntake.fat) * 100,
    sugar: (nutritionTotals.sugar / recommendedIntake.sugar) * 100,
    salt: (nutritionTotals.salt / recommendedIntake.salt) * 100,
    calorie: (nutritionTotals.calorie / recommendedIntake.calorie) * 100
  };

  res.status(200).json({
    date: startOfDay.toISOString().split('T')[0],
    nutritionTotals,
    recommendedIntake,
    nutritionPercentage
  });
});

module.exports = {
  addConsumedProduct,
  getUserConsumedProducts,
  deleteConsumedProduct,
  getDailyNutritionSummary,
  getWeeklyNutritionSummary,
  getMonthlyNutritionSummary,
  getUserHomeNutritionStatus
}; 