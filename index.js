const path = require('path');
const async = require('async');
const newman = require('newman');
const express = require('express'); 
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const { setInterval } = require('timers');
const generateTokenRoute = require('./routes/automation.routes');
const { onGlobalChange } = require('./global');
const { SimpleDashboardController } = require('./controllers/automation.controller');

require("dotenv").config();




//Global Variables


const app = express();
const port = parseInt(process.env.PORT) || 3008;

app.use(bodyParser.json());

// app.post('/sendIncident', async (req, res) => {
//     try {
//          const response = await RunCollection(req,Three60ReviewCookies,"save_incident"); // Wait for the sendIncident function to complete
//         res.json({success:true , data: response}); // Send the response back to the client
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });



// const startPolling = () => {
//     const pollingInterval = 1 * 60 * 1000; // 15 minutes in milliseconds

//     setInterval(async () => {
//         console.log("inside intervale")
//         try {
//             const response = await RunCollection(req=[], Three60ReviewCookies, 'poll_session');
//             const jsonString = response[0];
//             const responseData = JSON.parse(jsonString);
//             status = responseData.IsAuthenticated;
//             console.log('Status:', status);
//         } catch (error) {
//             console.error('Error during polling:', error.message);
//         }
//     }, pollingInterval);

//     console.log('Polling started.');
//     console.log('Status at start:', status);
// };

// startPolling();








//This listens for events can be useful
// onGlobalChange((variable,newValue)=>{
//     SimpleDashboardController(null,{send:(html)=>console.log(html)})
// })

app.use('/api', generateTokenRoute)


  app.listen(port, () => console.log(`Example app listening on port ${port}!`));