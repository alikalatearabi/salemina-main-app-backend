const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming you have user authentication middleware

        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all consumed products for today
        const consumedProducts = await prisma.userConsumedProduct.findMany({
            where: {
                userId: userId,
                consumedAt: {
                    gte: today
                }
            },
            include: {
                product: true
            }
        });

        // Calculate total nutritional values
        let totalCalories = 0;
        let totalSalt = 0;
        let totalSugar = 0;
        let totalFat = 0;
        let totalTransFattyAcids = 0;

        consumedProducts.forEach(consumed => {
            const product = consumed.product;
            const multiplier = consumed.quantity * (consumed.servingSize || 1);

            totalCalories += (product.calorie || 0) * multiplier;
            totalSalt += (product.salt || 0) * multiplier;
            totalSugar += (product.sugar || 0) * multiplier;
            totalFat += (product.fat || 0) * multiplier;
            totalTransFattyAcids += (product.transfattyAcids || 0) * multiplier;
        });

        // Get user's recommended daily values
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                recommendedDailyCalories: true,
                recommendedDailySalt: true,
                recommendedDailySugar: true,
                recommendedDailyFat: true,
                recommendedDailyTransFattyAcids: true
            }
        });

        res.json({
            consumed: {
                calories: totalCalories,
                salt: totalSalt,
                sugar: totalSugar,
                fat: totalFat,
                transfattyAcids: totalTransFattyAcids
            },
            recommended: {
                calories: user.recommendedDailyCalories,
                salt: user.recommendedDailySalt,
                sugar: user.recommendedDailySugar,
                fat: user.recommendedDailyFat,
                transfattyAcids: user.recommendedDailyTransFattyAcids
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getDashboardData
}; 