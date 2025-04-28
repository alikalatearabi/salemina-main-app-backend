const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Initial signup with phone number
router.post('/signup/phone', authController.checkPhone);

// Signup steps
router.post('/signup/basic-info', authController.saveBasicInfo);
router.post('/signup/physical-attributes', authController.savePhysicalAttributes);
router.post('/signup/health-info', authController.saveHealthInfo);
router.post('/signup/dietary-preferences', authController.saveDietaryPreferences);
router.post('/signup/allergies', authController.saveAllergies);
router.post('/signup/water-intake', authController.saveWaterIntake);
router.post('/signup/complete', authController.completeSignup);

// Get signup progress 
router.get('/signup/progress/:userId', authController.getSignupProgress);

// Get reference data for signup forms
router.get('/illnesses', authController.getIllnesses);
router.get('/allergies', authController.getAllergies);
router.get('/food-preferences', authController.getFoodPreferences);

module.exports = router; 