const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutritionController');

// Track consumed products
router.post('/consumed', nutritionController.addConsumedProduct);
router.get('/consumed/user/:userId', nutritionController.getUserConsumedProducts);
router.delete('/consumed/:id', nutritionController.deleteConsumedProduct);

// Dashboard analytics
router.get('/dashboard/daily/:userId', nutritionController.getDailyNutritionSummary);
router.get('/dashboard/weekly/:userId', nutritionController.getWeeklyNutritionSummary);
router.get('/dashboard/monthly/:userId', nutritionController.getMonthlyNutritionSummary);

module.exports = router; 