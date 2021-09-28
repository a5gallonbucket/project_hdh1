const express = require('express');
const path = require('path');
const msal = require('@azure/msal-node');


const port = process.env.PORT || '8000';
const REDIRECT_URI = "http://localhost:8000/redirect";

require("dotenv").config();

const msal_config = {
  auth: {
    clientId: process.env.CLIENT_ID,
    authority: 'https://login.microsoftonline.com/f8b6a2d7-0364-40ce-943e-eb02d6c35deb',
    clientSecret: process.env.CLIENT_SECRET,
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Verbose,
    }
  }
};


// Create msal application object
const pca = new msal.ConfidentialClientApplication(msal_config);
// Create Express App and Routes
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

app.get("/user", (req, res) => {
  res.render("user", { title: "Profile", userProfile: { nickname: "Auth0" } });
})

app.get('/', (req, res) => {
  const authCodeUrlParameters = {
    scopes: ["user.read"],
    redirectUri: REDIRECT_URI,
  };

  // get url to sign user in and consent to scopes needed for application
  pca.getAuthCodeUrl(authCodeUrlParameters).then((response) => {
    res.redirect(response);
  }).catch((error) => console.log(JSON.stringify(error)));
});

app.get('/redirect', (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    scopes: ["user.read"],
    redirectUri: REDIRECT_URI,
  }
  pca.acquireTokenByCode(tokenRequest).then((response) => {
    console.log("\nResponse: \n", response);
    // res.sendStatus(200);
    res.render("index", { title: "Home" });
  }).catch(err => {
    console.log(err);
    res.status(500).send(err)
  })
})



app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
})


