const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const {handlePrivateBackendApi} = require('./routes/private/api');
const {handlePublicBackendApi} = require('./routes/public/api');
const {handlePublicFrontEndView} = require('./routes/public/view');
const {handlePrivateFrontEndView} = require('./routes/private/view');


const {authMiddleware} = require('./middleware/auth');

// view engine setup
app.set('views', './views');
app.set('view engine', 'hjs');
app.use(express.static('./public'));

// Handle post requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

handlePublicFrontEndView(app);
handlePublicBackendApi(app);
app.use(authMiddleware);
handlePrivateFrontEndView(app);
handlePrivateBackendApi(app);

app.listen(3000, () => {
    console.log("Server is now listening at port 3000 on http://localhost:3000/");
});







