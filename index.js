//#### importing in the express library--------------------------
const express = require('express')
const { GoogleSpreadsheet } = require('google-spreadsheet');
require('dotenv').config();

const hbs = require('hbs')

//#### create the express application----------------------------------
const app = express();
//#### tell express to use hbs as the view engine-----------------------------------
app.set('view engine', 'hbs')
// static files
// the firstt argument is the folder where we put all our static files
// - images
// - javascripts
app.use(express.static('public'))

//#### enable express to process form------------------------------------
app.use(express.urlencoded({
    'extended': false
}))

async function run() {

    const doc = new GoogleSpreadsheet("1PCvrz-kK4FN8iBN0T9GkQSxanmo0bWJ2jdi3GtsbY_Q")

//#### log into google spreadsheets-------------------------------------------
    console.log(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL)
    console.log(process.env.GOOGLE_PRIVATE_KEY)
    await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, "\n"),
    });

//#### attempt to retrive info from spreadsheet-----------------------------------------
    await doc.loadInfo();
//#### each app.get is a ROUTE--------------------------------
    app.get('/', function (req, res) {
        res.render("index")
    })

    app.get('/about-us', function (req, res) {
        res.render("about")
    })

    app.get('/raw-data', function (req, res) {
        res.render("rawData")
    })



    app.get('/data', async function (req, res) {
        let sheet = doc.sheetsByIndex[4];
        let rows = await sheet.getRows();
        let output = [];


//#### go through each row and extract out the first and last---------------------------
//#### store in an obket as an array----------------------------------
        for (let r of rows) {
            output.push({
                'Artform': r.Artform,
                'Parent_Artforms': r.Parent_Artforms,
                'Primary_Sense': r.Primary_Sense,
                'Related_Artforms': r.Related_Artforms

            })

        }
        res.send(output);
    })

    
    app.get('/survey', function (req, res) {
        res.render('show_survey');

    })
    app.post('/survey', async function (req, res) {
        console.log(res);


        let favouriteFood = [];
        //check if the favourites key exist in req.body
        if (!req.body.favourites) {

            favouriteFood = [];

        } else if (!Array.isArray(req.body.favourites)) {

            favouriteFood = [req.body.favourites]
        } else {
            favouriteFood = req.body.favourites;
        }





        let sheet = doc.sheetsByIndex[1];

        //add a row in spreadsheet
        //(important:async)

        await sheet.addRow({
            "Artform": req.body.new_artform,
            "Related Artforms": req.body.related_artform, //this is an array, so need to convert to string
            "Senses": req.body.senses,
            "Name": req.body.user_name,
            "Date added": date,
            
        })

        await sheet.saveUpdatedCells();
        res.send("Thank You! Artform Submitted and will be manually approved.")

    })


    app.get('/graph', function (req, res) {
        res.render('graph');
    })





}


//#### start server ----------------------------------------------
run();

//app.listen(8000, function () {
app.listen(process.env.PORT, function () {
    console.log("Server has started")
})
var today = new Date();
var date = today.getFullYear()+'/'+(today.getMonth()+1)+'/'+today.getDate();
// req -> request
// res-> response
// a route -> associating a URL to a JavaScript function
