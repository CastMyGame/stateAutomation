const { GenerateToken, RunCollection } = require('../services/automation.service');
const { setGlobalToken, getGlobalToken,setTokenStatus,getTokenStatus, getIncidentSubmittedCurrentSession, setIncidentSubmittedCurrentSession } = require('../global');



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
         if(collectionName === "save_incident"){
            const jsonString = response[0];
            const responseData = JSON.parse(jsonString);
            const title = responseData.title;
            const studentInfo = req.body.IncidentParty_StudentId.text;
            const subbmitedTime =  new Date();

            setIncidentSubmittedCurrentSession({title:title,student:studentInfo,timeStamp:subbmitedTime});

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
        const incidents = getIncidentSubmittedCurrentSession();

        // Define the HTML content based on the current values

        // Send an HTML response with the status dot and token information
        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>State Automation Dashboard</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                }
        
                h1 {
                    color: #333;
                }
        
                .status-dot {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    display: inline-block;
                    margin-right: 10px;
                }
        
                .green {
                    background-color: green;
                }
        
                .red {
                    background-color: red;
                }
        
                table {
                    border-collapse: collapse;
                    width: 100%;
                    margin-top: 20px;
                }
        
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
        
                th {
                    background-color: #f2f2f2;
                }
        
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
            </style>
        </head>
        
        <body>
            <h1>Welcome To State Automation</h1>
            <p>Token Status: <span class="status-dot ${currentStatus ? 'green' : 'red'}"></span>${currentStatus ? 'Active' : 'Inactive'}</p>
            <p>Global Token: ${currentToken}</p>
        
            <h2>Incidents Submitted</h2>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Student</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    ${incidents.map(incident => `
                        <tr>
                            <td>${incident.title}</td>
                            <td>${incident.student}</td>
                            <td>${incident.timeStamp}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        
        </html>
        
        `);
    } catch (error) {
        // Handle any errors that occur during the request
        res.status(500).send('An error occurred');
    }
}


module.exports = { generateTokenController,RunCollectionController,SimpleDashboardController };

