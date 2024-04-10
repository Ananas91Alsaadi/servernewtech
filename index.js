const express = require('express');
const cors = require('cors');
const CryptoJS = require('crypto-js');

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore'; // Import collection and getDocs functions


const app = express();

var firebaseConfig = {
  apiKey: "AIzaSyCdAPpbuhroZKSDW7PCVcP6M9F_aI5zmc0",
  authDomain: "ip-encoder.firebaseapp.com",
  projectId: "ip-encoder",
  storageBucket: "ip-encoder.appspot.com",
  messagingSenderId: "30237412135",
  appId: "1:30237412135:web:2131da8e54bb9dfa83b702",
  measurementId: "G-D145FKBXZ3"
};

var firebaseApp = initializeApp(firebaseConfig);
var appDB = getFirestore(firebaseApp);

//firebase.initializeApp(firebaseConfig);

// Configure Express.js to trust proxy
app.set('trust proxy', true);

app.use(cors());

// Define route for root endpoint
app.get('/', (req, res) => {
  res.send('Hello, World! This is the root endpoint.');
});

function findSecretByOrigin(array, originValue) {
  for (let i = 0; i < array.length; i++) {
      var obj = array[i];
          if (obj.origin && obj.origin === originValue) {
              return obj.secret;
          }
  }
  return null; // Return null if no matching object is found
}

function arrayToFunction(arr) {
  const functionString = `async function getData() {\n`;
  
  // Joining array elements with newlines
  const code = arr.join('\n');

  // Appending code to the function string
  const result = functionString + code + `\n}`;

  return result;
}

async function getdatatest(dataX, docName){

  try {
    dataX = dataX.replace(/([{,]\s*)([a-zA-Z0-9_]+?)\s*:/g, '$1"$2":');

    var firebaseConfig2 = JSON.parse(dataX);
    var firebaseApp2 = initializeApp(firebaseConfig2, "project2");;

    var appDB2 = getFirestore(firebaseApp2);

    var querySnapshot = await getDocs(collection(appDB2, docName));

    let allData=[];
    
    querySnapshot.forEach(doc => {
     // Assuming there's only one document returned, otherwise handle multiple documents
   
     allData.push(doc.data())

   });

   return allData;

  } catch (error) {
      
        console.log("Error getting documents: ", error);
        return error;
    };

} 

app.get('/add', async (req, res) => {
  var { key, codeAPI } = req.query;

  let origin = req.headers['origin'];
  origin = origin.replace(/\//g, "-"); // Replace "/" with "-"
  key = key.replace(/ /g, '+');

  try {

    var querySnapshot = await getDocs(collection(appDB, 'users'));
    let allData=[];
    
     querySnapshot.forEach(doc => {
      // Assuming there's only one document returned, otherwise handle multiple documents
    
      allData.push(doc.data())

    });

     var secretValue =  findSecretByOrigin(allData, origin)

    var finalSecret = origin+secretValue;

    var decrypted = CryptoJS.AES.decrypt(key, finalSecret).toString(CryptoJS.enc.Utf8);

    //var getFun = arrayToFunction([decrypted , codeAPI]);

    //let getData = new Function(getFun);

      //await eval(getFun);
      var final = await getdatatest(decrypted, codeAPI);

      
    //var final = await getData();

    const responseData = { message: "Data fetched successfully", data: final, decrypted:decrypted, codeAPI:codeAPI};

    res.json(final);


    
    

    //const decrypted = CryptoJS.AES.decrypt(key, secretKey).toString(CryptoJS.enc.Utf8);
   // res.json(decrypted)

    // Send the decrypted value as JSON response
    //res.json({ decrypted });

  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }



});

// Define your route for the /add endpoint
/*
app.get('/add', (req, res) => {
  const { key, codeAPI } = req.query;
  const sum = parseInt(key) + parseInt(codeAPI);
  var origin = req.headers['origin'];
var decrypted;
  origin = origin.replace(/\//g, "-"); // Replace "/" with "-"
  var secretKey;
  appDB.collection("origins").doc(origin).get.then(querySnapshot => {
    secretKey= querySnapshot.value
  }).then( decrypted = CryptoJS.AES.decrypt(key, secretKey).toString(CryptoJS.enc.Utf8)
  .then(res.json(decrypted))) })
*/
/* 

  // Get IP address of the sender
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const referer = req.headers['referer'] || req.headers['origin'];
  const origin2 = req.headers;

  // Perform DNS lookup to get the corresponding hostname
  const dns = require('dns');
  dns.reverse(ip, (err, hostnames) => {
    if (err) {
      console.error('Error resolving hostname:', err);
      res.status(500).send('Error resolving hostname');
    } else {
      // Assuming hostnames is an array, you may want to handle multiple hostnames
      const hostname = hostnames && hostnames.length > 0 ? hostnames[0] : 'Unknown';

      // Create response data
      const responseData = {
        ip: ip,
        hostname: hostname,
        referer:referer,
        origin:origin,
        origin2:origin2
      };

      // Send response
      //res.json(decrypted);
    }
  });
});
*/
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
