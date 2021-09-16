const { GoogleSpreadsheet } = require('google-spreadsheet');
require('dotenv').config();

async function run(){
        const doc = new GoogleSpreadsheet("1PCvrz-kK4FN8iBN0T9GkQSxanmo0bWJ2jdi3GtsbY_Q")

//log into google spreadsheets
        await doc.useServiceAccountAuth({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY,
          });

          //attempt to retrive info from spreadsheet
          await doc.loadInfo();
          console.log(doc.title);
        
          //extract the first sheet from GS
        let sheet = doc.sheetsByIndex[0];
        let rows = await sheet.getRows();
           for (let r of rows) {
               console.log(r.ID, r.Label);
            
           }

       
}

run();