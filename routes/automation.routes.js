const express = require('express');
const router = express.Router();
const { generateTokenController,RunCollectionController, SimpleDashboardController } = require('../controllers/automation.controller');

// Route for generating a token
router.get('/generate-token', generateTokenController);


//Api To Save Incident From Reps to 360 Review
router.get('/send-incident', (req,res,next)=>{
    req.collectionName = 'send_incident';
    next();

}, RunCollectionController);

// Api To determiend if token is still valid
router.get('/poll-session', (req,res,next)=>{
    req.collectionName = 'poll_session';
    next();

}, RunCollectionController);

// Api to refresh token prior to expiration
router.get('/refresh-session', (req,res,next)=>{
    req.collectionName = 'activate_session';
    next();

}, RunCollectionController);

router.get('/',SimpleDashboardController);


module.exports = router;
