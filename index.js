const path = require('path');
const async = require('async');
const newman = require('newman');
const express = require('express'); 
const { CreateGoogleEvent } = require('./functions/googleEventCreator');
const puppeteer = require('puppeteer');
require("dotenv").config();




const app = express();
const port = parseInt(process.env.PORT) || 3008;

let SESSION_TOKEN = "wmvnCvxh/e0UhsjQ/5VfYWLk/VMFULVx7g9yE+4UwfDbO9S1FnoxsvDl6pJMSqB/rPPgx5L4FP5bYoTVCMM7yK+ZvTQj3rDJFo/9xedNYhE+zeKB0zI8m4pBeTmNnfhnC/6u+XGy8fTmqdj1IIw2X8uqzBHUNwk5J8OoPs+ptcAK9EzLVVXa5bI65mWeZdNkvZblAJUaXUsJD/XOb4id7JSxZBASoK8V8mXLsl0FFvgd/B/ZzWWS9ZcQy8EiofQIsDAs9ZI+oTfGl/iydznBTsg/ktakkivys8N9u4T/prM1jzO2Zd1XqDuQbRbeVvEHeUkQbC389kAPQfXn4Vb225Rt+20wtU8WUG/I7dx9Eyl0Sd8nzQIB4WBcUE0ZtziVTOaiBUQ6YUMHux/ECJyMXmxq7L+5lUfsKectlsZhY9gj9V//QMy1DPgigJAXvO4o73W2itIELkF6vi8y9lhKyexrwUjHHZhKk40SCsewa868Ay5MdrsAKRJtJEDSDLgyedDqbtY2UIlijIzSKb/YfoY1B8wM7W8o4LSALpvOmM++KWnuaHtPGiPgNwaIZYE/tvCploSSxAt9Rx2yDpsMp8uunyoazdz0G8mD1MH0MW834WUICIRmHK8gHY+BUgVuvQPQMHMEwOInnLWwNOuWhKNzRzfCnt9lrkdrZS7mMos/EKsQVpRCeqyLtI5/MXaHa+FaImj4eWy1TCs9HUMuuGuC862HFvmCqsOqSk+qq9Zfmbo0PJoizWkDFUALX+Apz4SIzw9FM2jqnHWaixpPYbPCHKsjCd9+zw9yi2ZW4kxNqAmsm/nCVyAyJ9JmScAIBTIKjXg6z+wBTdpUyPv4acMgnPprRLL8PxYkdI+BGdUuk160ChszsWL5dxW6XMSHXacLyYie+zzAf49Y0DoKxzKiX1f4H1abbX6w+PXg2OFQTGbSItZ0WRct8K3a3nkg/i3MHrLduragENp7YjVyzg30LSlLr5vF6xZaZQdvAicyA2K6bUPZ9yNXaVsILIYAHIBGblb27T5wcgCOf6OKcMwPJLTMDrpHCQ6u3pak1/R7Vf61UsxwCupDrKxKSfREL/+CVVorfh2G1vcomGNC41avvrulS9/0bvg/L9MtHAUhwjj6WUCdFERRnG4gqDY5QNOlM6liRJ/yIAphHheiITnAEtRGXVKaCJsZ5EoQnk6gpaaIQ0J/Ql2js11sUrTWdJqiYMLBhYh5gHG/8/Lc/5biDc0JztHQ2FACFuYAlSeIpeOQndUrbBrKJWn+Mhnt9z7lMVUFc72rBuDdZFY8eI2kjWnAyGW3"

const MAX_RETRY_ATTEMPTS = 3; // Define the maximum number of retry attempts


let powerhouseCookies;
let Three60ReviewCookies;

const browse = async (res, retryCount = 0) => {
    try {
        const browser = await puppeteer.launch({
            // headless: false,
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
        await newPage.goto('https://www.psiwaresolution.com/Review360/SSO/SAML2/Initiate?idpmetadata=https%3A%2F%2Fccsdschools.powerschool.com%3A443%2Fpowerschool-saml-sso%2Fmetadata%2FReview360Metadata.action');

     
    
        // Continue with any other actions on the new page as needed



    
  
        // Define a function to check for the SMSESSION cookie
        const checkCookieAndRunCollection = async () => {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
            const cookies = await newPage.cookies();
            console.log(cookies);
            const Three60ReviewCookies = cookies;

            if (Three60ReviewCookies) {
                console.log('Cookies:', cookies);
                await browser.close();
                runCollection(res);
            } else {
                console.error('SMSESSION Cookie not found.');
                await browser.close();
                if (retryCount < MAX_RETRY_ATTEMPTS) {
                    console.log(`Retrying (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})...`);
                    await browse(res, retryCount + 1);
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

const runCollection = (res)=>{

const PARALLEL_RUN_COUNT = 1;

const collections = [   
    'collections/save_incident.postman_collection', 
]



const environment = environments[0];
const collectionToRun = [];

const sessionTokenValue = `SMSESSION=${SESSION_TOKEN}`;
const date = '2024-04-08'


const jsonData = {
    "Parties":[],
    "Incident_IncidentTypeId":{"value":40,"text":"Positive Behavior Achievement"},
    "Incident_IncidentConfigurationGroupId":207,
    "Incident_VersionDate":{"date":"4/26/2024","time":null},
    "Incident_IncidentDate":{"date":"03/06/2024","time":"11:00 AM"},
    "Incident_ReportedById":{"value":2509677,"text":"Iverson, Justin"},
    "IncidentParty_IncidentPartyId":-1,
    "CurrentUser":{"value":2509677,"text":"Iverson, Justin"},
    "IncidentParty_IncidentPartyTypeId":{"value":1,"text":""},
    "IncidentParty_StudentId":{"value":4065723,"text":"Mack, Juel (41904)"},
    "Incident_OccurredAtOrganizationId":{"value":5672,"text":"Burke High School"},
    "Incident_LocationId":{"value":52,"text":"Classroom"},
    "IncidentBehavior_LayoutFieldOptionId":[{"value":166470,"text":" Other Positive Behavior:","note":"","isPrimary":null,"isRemoved":false}],
    "IncidentParty_Description":"I just wanted to send my appreciation for the effort and persistence Juel displayed in class today. There were several points during class that he seemed incredibly frustrated with the material but he continued to work without giving up. We definitely made some progress today and I am excited to see how much more progress we can make tomorrow",
    "IncidentStaffResponse_LayoutFieldOptionId":[{"value":166484,"text":" Recognition"},{"value":166485,"text":" Reward"},{"value":166486,"text":" Other positive staff response:","note":""},{"value":166487,"text":" Parent Contact - Email","note":""}],
    "IncidentTypeRole_IncidentRoleId":1,
    "IsReadyToAssignActions":false,
    "BehaviorRequiredForActions":true,
    "IncidentParty_StudentNumber":"41904",
    "IncidentParty_StudentGradeId":{"text":"9th Grade","value":9},
    "IncidentParty_StudentOrganizationId":{"text":"Burke High School","value":5672},
    "IncidentParty_StudentIsSpecialEducation":{"text":"No","value":false},"IncidentParty_StudentIs504":{"text":"No","value":false},"IncidentParty_StudentHomelessTypeId":{"text":"Not Homeless","value":1},"RuleInstanceToken":null}


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
                "value": jsonData,
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


  

app.get('/sendIncident', async (req, res) => {
    await browse();
  });



  




 
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));