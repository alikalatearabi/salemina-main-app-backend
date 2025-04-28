const prisma = require('../config/db');
const { asyncHandler, AppError } = require('../utils/helpers');

/**
 * Add a consumed product for a user
 */
const addConsumedProduct = asyncHandler(async (req, res) => {
  const { userId, productId, quantity, servingSize, mealType, consumedAt } = req.body;

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

  const consumedProduct = await prisma.userConsumedProduct.create({
    data: {
      userId: parseInt(userId),
      productId: parseInt(productId),
      quantity: parseFloat(quantity),
      servingSize: servingSize ? parseFloat(servingSize) : null,
      mealType,
      consumedAt: consumedAt ? new Date(consumedAt) : new Date(),
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
  
  res.status(200).json({
    date: startOfDay.toISOString().split('T')[0],
    totalCalories: summary.calories,
    totalFat: summary.fat,
    totalSugar: summary.sugar,
    totalSalt: summary.salt,
    totalProtein: summary.protein,
    totalCarbs: summary.carbs,
    mealBreakdown,
    consumedProducts: consumedProducts.map(formatConsumedProduct)
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
  return consumedProducts.reduce((summary, entry) => {
    const { product, quantity, servingSize } = entry;
    const factor = quantity * (servingSize ? (servingSize / product.per) : 1);
    
    // Add nutrient values with safety checks
    summary.calories += (product.calorie || 0) * factor;
    summary.fat += (product.fat || 0) * factor;
    summary.sugar += (product.sugar || 0) * factor;
    summary.salt += (product.salt || 0) * factor;
    
    // Handle string values that need conversion
    if (product.protein) {
      const proteinValue = parseFloat(product.protein) || 0;
      summary.protein += proteinValue * factor;
    }
    
    if (product.carbohydrate) {
      const carbValue = parseFloat(product.carbohydrate) || 0;
      summary.carbs += carbValue * factor;
    }
    
    return summary;
  }, { calories: 0, fat: 0, sugar: 0, salt: 0, protein: 0, carbs: 0 });
};

/**
 * Helper function to get meal breakdown for a specific date range
 */
const getMealBreakdown = async (userId, startDate, endDate) => {
  const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
  const breakdown = {};
  
  for (const mealType of mealTypes) {
    const consumedProducts = await prisma.userConsumedProduct.findMany({
      where: {
        userId: parseInt(userId),
        mealType,
        consumedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        product: true,
      },
    });
    
    breakdown[mealType.toLowerCase()] = calculateNutritionSummary(consumedProducts);
  }
  
  return breakdown;
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

module.exports = {
  addConsumedProduct,
  getUserConsumedProducts,
  deleteConsumedProduct,
  getDailyNutritionSummary,
  getWeeklyNutritionSummary,
  getMonthlyNutritionSummary,
}; 