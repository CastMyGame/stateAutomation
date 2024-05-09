const { GenerateToken, RunCollection } = require('../services/automation.service');
const { setGlobalToken, getGlobalToken,setTokenStatus,getTokenStatus } = require('../global');



const generateTokenController = async (req, res) => {
    try {
        const token = await GenerateToken();
       setGlobalToken(token);
        res.json({ success: true, token });
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ success: false, error: 'Failed to generate token' });
    }
};



const RunCollectionController = async (req, res) => {
    try {
        const collectionName = req.collectionName;
        let token = getGlobalToken();
         const response = await RunCollection(req,token,collectionName); // Wait for the sendIncident function to complete
         
         if(collectionName === "poll_session"){
            const jsonString = response[0];
            const responseData = JSON.parse(jsonString);
            const IsAuthenticated = responseData.IsAuthenticated;
            setTokenStatus(IsAuthenticated);
         }
        res.json({success:true , data: response}); // Send the response back to the client
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const SimpleDashboardController = async (req, res) => {
    try {
        // Get the current values of the global variables
        const currentToken = getGlobalToken();
        const currentStatus = getTokenStatus();

        // Define the HTML content based on the current values
        const statusDot = currentStatus ? '<div style="width: 20px; height: 20px; background-color: green; border-radius: 50%; display: inline-block;"></div>' : '<div style="width: 20px; height: 20px; background-color: red; border-radius: 50%; display: inline-block;"></div>';

        // Send an HTML response with the status dot and token information
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>360 Token Status</title>
            </head>
            <body>
                <h1>Welcome To State Automation</h1>
                <p>Token Status: ${statusDot}</p>
                <p>Global Token: ${currentToken}</p>
            </body>
            </html>
        `);
    } catch (error) {
        // Handle any errors that occur during the request
        res.status(500).send('An error occurred');
    }
}


module.exports = { generateTokenController,RunCollectionController,SimpleDashboardController };

