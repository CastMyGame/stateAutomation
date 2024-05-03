const path = require('path');
const async = require('async');
const newman = require('newman');
const express = require('express'); 
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

require("dotenv").config();




//Global Variables


const app = express();
const port = parseInt(process.env.PORT) || 3008;


let powerhouseCookies;
let Three60ReviewCookies;

const GenerateToken = async ( retryCount = 0) => {
    const MAX_RETRY_ATTEMPTS = 3; // Define the maximum number of retry attempts
    console.log("Starting Browser")
    try {
        const browser = await puppeteer.launch({
            headless: "new", // "new" instead of true
       
            // defaultViewport: null,
            args: [
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--single-process",
                "--no-zygote",
            ],
            executablePath:
                process.env.NODE_ENV === "production"
                    ? process.env.PUPPETEER_EXECUTABLE_PATH
                    : puppeteer.executablePath(),
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4500.0 Safari/537.36');


        // Navigate to the login page
        await page.goto('https://ccsdschools.powerschool.com/teachers/pw.html');
        
        // Fill in the login credentials and submit the form
        await page.type('input[name="username"]', 'justin_iverson.c');
        await page.type('input[name="password"]', 'SmackDown+4');
        
        await Promise.all([
            page.click('#btnEnter'), // Click the login button
            page.waitForNavigation({ timeout: 60000 }), // Wait for navigation to complete (increased timeout)
        ]);

        // Get the cookies from the logged-in page
        const cookies = await page.cookies();

        // Close the initial page since we don't need it anymore
        await page.close(); 

        // Create a new page for Review 360 
        const newPage = await browser.newPage();
        await newPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4500.0 Safari/537.36');

// We are setting cookies we got from power school page
        await newPage.setCookie(...cookies);

        // Navigate to the second site
        await newPage.goto('https://www.psiwaresolution.com/Review360/SSO/SAML2/Initiate?idpmetadata=https%3A%2F%2Fccsdschools.powerschool.com%3A443%2Fpowerschool-saml-sso%2Fmetadata%2FReview360Metadata.action', { waitUntil: 'networkidle2' })


        await newPage.goto('https://www.psiwaresolution.com/Review360')
        
        //Grab New Cookies and Return them

        //We are using this to pull all the cookies
        const client = await newPage.target().createCDPSession();
        (await client.send('Network.getAllCookies')).cookies;

            const newCookies = await newPage.cookies();
            
            //Sort Out only needed Cookies
            const filteredCookies = newCookies.filter(cookie => cookie.name === 'R360Access' || cookie.name === 'user');

            //Format Cookies as needed in postman
            Three60ReviewCookies = filteredCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

            if (Three60ReviewCookies) {
                await browser.close();
                console.log("Tokens Generated")
                return Three60ReviewCookies;
            } else {
                await browser.close();
                if (retryCount < MAX_RETRY_ATTEMPTS) {
                    console.log(`Retrying (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})...`);
                    sendIncident(req, res, retryCount + 1); // Retry with updated retryCount
                } else {
                    console.error('Max retry attempts reached. Exiting...');
                }
            }

    } catch (error) {
        console.error('Error during browsing:', error);
    }
};




//For Postman
const RunCollection = (req, token) => {
    return new Promise((resolve, reject) => {
        const collections =  'collections/Power School Test.postman_collection' // Add .json extension
        

        const collectionToRun = {
            collection: path.join(__dirname, collections), // Use collections[0] instead of undefined index
            reporters: ['cli'],
            bail: true, // Set bail option to true
            envVar: [
                {
                    "key": "variable_key",
                    "value": "",
                    "type": "any",
                    "enabled": true
                },
                {
                    "key": "payload",
                    "value": JSON.stringify(req.body),
                    "type": "any",
                    "enabled": true
                },
                {
                    "key": "responseData",
                    "value": "",
                    "type": "any",
                    "enabled": true
                },
                {
                    "key": "session_cookie",
                    "value": token,
                    "type": "default",
                    "enabled": true
                }
            ]
        };

        console.log("-- request--- " + JSON.stringify(req.body) + "--end request");

        let responseDataList = []; // Store responseData for each collection

        newman.run(collectionToRun, function (err, summary) {
            if (err) {
                reject(err);
            } else {
                console.log(collectionToRun.collection + ' collection run complete!');
                const responseData = summary.environment.values.reference.responseData.value;
                responseDataList.push(responseData);
                resolve(responseDataList); // Resolve with responseDataList after collection run completes
            }
        });
    });
};
        
    


app.use(bodyParser.json());

app.post('/sendIncident', async (req, res) => {
    try {
         const response = await RunCollection(req,Three60ReviewCookies); // Wait for the sendIncident function to complete
        res.json({success:true , data: response}); // Send the response back to the client
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.get('/generate-token', async (req,res) => {
    try {
        const response = await GenerateToken();
        res.json({success:true, data:response})

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});




app.get('/', async (req, res) => {
    try {

        res.json(`Welcome To Automation:
`); // Send the response back to the client
     

    } catch (error) {
        res.status(500).json({ error: 'An error occurred' }); // Handle any errors that occur during the sendIncident function
    }
});


  app.listen(port, () => console.log(`Example app listening on port ${port}!`));