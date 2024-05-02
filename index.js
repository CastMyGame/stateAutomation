const path = require('path');
const async = require('async');
const newman = require('newman');
const express = require('express'); 
const { CreateGoogleEvent } = require('./functions/googleEventCreator');
const puppeteer = require('puppeteer');
const { send } = require('process');
const bodyParser = require('body-parser');

require("dotenv").config();




const app = express();
const port = parseInt(process.env.PORT) || 3008;

let SESSION_TOKEN = "wmvnCvxh/e0UhsjQ/5VfYWLk/VMFULVx7g9yE+4UwfDbO9S1FnoxsvDl6pJMSqB/rPPgx5L4FP5bYoTVCMM7yK+ZvTQj3rDJFo/9xedNYhE+zeKB0zI8m4pBeTmNnfhnC/6u+XGy8fTmqdj1IIw2X8uqzBHUNwk5J8OoPs+ptcAK9EzLVVXa5bI65mWeZdNkvZblAJUaXUsJD/XOb4id7JSxZBASoK8V8mXLsl0FFvgd/B/ZzWWS9ZcQy8EiofQIsDAs9ZI+oTfGl/iydznBTsg/ktakkivys8N9u4T/prM1jzO2Zd1XqDuQbRbeVvEHeUkQbC389kAPQfXn4Vb225Rt+20wtU8WUG/I7dx9Eyl0Sd8nzQIB4WBcUE0ZtziVTOaiBUQ6YUMHux/ECJyMXmxq7L+5lUfsKectlsZhY9gj9V//QMy1DPgigJAXvO4o73W2itIELkF6vi8y9lhKyexrwUjHHZhKk40SCsewa868Ay5MdrsAKRJtJEDSDLgyedDqbtY2UIlijIzSKb/YfoY1B8wM7W8o4LSALpvOmM++KWnuaHtPGiPgNwaIZYE/tvCploSSxAt9Rx2yDpsMp8uunyoazdz0G8mD1MH0MW834WUICIRmHK8gHY+BUgVuvQPQMHMEwOInnLWwNOuWhKNzRzfCnt9lrkdrZS7mMos/EKsQVpRCeqyLtI5/MXaHa+FaImj4eWy1TCs9HUMuuGuC862HFvmCqsOqSk+qq9Zfmbo0PJoizWkDFUALX+Apz4SIzw9FM2jqnHWaixpPYbPCHKsjCd9+zw9yi2ZW4kxNqAmsm/nCVyAyJ9JmScAIBTIKjXg6z+wBTdpUyPv4acMgnPprRLL8PxYkdI+BGdUuk160ChszsWL5dxW6XMSHXacLyYie+zzAf49Y0DoKxzKiX1f4H1abbX6w+PXg2OFQTGbSItZ0WRct8K3a3nkg/i3MHrLduragENp7YjVyzg30LSlLr5vF6xZaZQdvAicyA2K6bUPZ9yNXaVsILIYAHIBGblb27T5wcgCOf6OKcMwPJLTMDrpHCQ6u3pak1/R7Vf61UsxwCupDrKxKSfREL/+CVVorfh2G1vcomGNC41avvrulS9/0bvg/L9MtHAUhwjj6WUCdFERRnG4gqDY5QNOlM6liRJ/yIAphHheiITnAEtRGXVKaCJsZ5EoQnk6gpaaIQ0J/Ql2js11sUrTWdJqiYMLBhYh5gHG/8/Lc/5biDc0JztHQ2FACFuYAlSeIpeOQndUrbBrKJWn+Mhnt9z7lMVUFc72rBuDdZFY8eI2kjWnAyGW3"

const MAX_RETRY_ATTEMPTS = 3; // Define the maximum number of retry attempts


let powerhouseCookies;
let Three60ReviewCookies;

const sendIncident = async (req, res, retryCount = 0) => {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
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

        // Navigate to the login page
        await page.goto('https://ccsdschools.powerschool.com/teachers/pw.html');

        // Get the page title before login
        let pageTitleBeforeLogin = await page.title();
        console.log('Page Title (Before Login):', pageTitleBeforeLogin);
        
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

        // Create a new page for the second site
        const newPage = await browser.newPage();

        await newPage.setCookie(...cookies);

        // Navigate to the second site
        await newPage.goto('https://www.psiwaresolution.com/Review360/SSO/SAML2/Initiate?idpmetadata=https%3A%2F%2Fccsdschools.powerschool.com%3A443%2Fpowerschool-saml-sso%2Fmetadata%2FReview360Metadata.action', { waitUntil: 'networkidle2' })





        await newPage.goto('https://www.psiwaresolution.com/Review360', { waitUntil: 'networkidle2' })

      
        await newPage.reload();


        
        // Define a function to check for the SMSESSION cookie
        const checkCookieAndRunCollection = async () => {
            await new Promise(resolve => setTimeout(resolve, 7000)); // Wait for 5 seconds
            
        const client = await newPage.target().createCDPSession();
        const cook = (await client.send('Network.getAllCookies')).cookies;



            const cookies = await newPage.cookies();
            
            console.log(cookies)

            const filteredCookies = cookies.filter(cookie => cookie.name === 'R360Access' || cookie.name === 'user');

            console.log(filteredCookies)


            Three60ReviewCookies = filteredCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
            console.log(Three60ReviewCookies)
            if (Three60ReviewCookies) {
                await browser.close();
                runCollection(req, res);
            } else {
                await browser.close();
                if (retryCount < MAX_RETRY_ATTEMPTS) {
                    console.log(`Retrying (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})...`);
                    sendIncident(req, res, retryCount + 1); // Retry with updated retryCount
                } else {
                    console.error('Max retry attempts reached. Exiting...');
                }
            }
        };

        // Wait for 5 seconds to allow time for cookies to load
        setTimeout(checkCookieAndRunCollection, 10000);
    } catch (error) {
        console.error('Error during browsing:', error);
    }
};




//For Postman

const runCollection = (req, res)=>{

const PARALLEL_RUN_COUNT = 1;

const collections = [   
    'collections/save_incident.postman_collection', 
]



const collectionToRun = [];

//proejct number : 219584338724

for (let index = 0; index < collections.length; index++) {
    collectionToRun[index] = {
        //  collection : path.join("/usr/src/app/", collections[index]), 
        collection: path.join(__dirname, collections[index]), 
        // environment: path.join(__dirname, environment), 
        reporters: ['cli'],
        bail: newman,
        envVar:  [
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
                "value": Three60ReviewCookies,
                "type": "default",
                "enabled": true
            }
        ]
    };
};




console.log("-- request--- " + JSON.stringify(req.body) + "--end request");


parallelCollectionRun = function (done) {
    for (let index=0; index < collectionToRun.length; index++){
        newman.run(collectionToRun[index], 
            function (err) {
                if (err) { throw err; }
                console.log(collections[index]+' collection run complete!');
            }).on('test',(error,data)=>{

                if(error){
                    console.log(error);
                    return;

                }
                var responseData = data.executions[0].result.environment.values.reference.responseData.value
                console.log("RESPONSE", responseData)



            });
    }
    
    done;
};

let commands = [];
for (let index = 0; index < PARALLEL_RUN_COUNT; index++) {
    commands.push(parallelCollectionRun);
};

async.parallel(
    commands,
    (err, results) => {
        err && console.error(err);
        results.forEach(function (result) {
            var failures = result.run.failures;
            console.info(failures.length ? JSON.stringify(failures.failures, null, 2) :
                `${result.collection.name} ran successfully.`);
    });

});

}


app.use(bodyParser.json());

app.post('/sendIncident', async (req, res) => {
    try {
        // Set a longer timeout for this specific request
        req.setTimeout(300000); // 300,000 milliseconds = 5 minutes

        const response = await sendIncident(req); // Wait for the sendIncident function to complete
        res.json(response); // Send the response back to the client
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' }); // Handle any errors that occur during the sendIncident function
    }
});


  app.listen(port, () => console.log(`Example app listening on port ${port}!`));