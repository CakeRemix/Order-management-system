const db = require('../../connectors/db');
const { getSessionToken , getUser } = require('../../utils/session');
const axios = require('axios');
require('dotenv').config();
const PORT = process.env.PORT || 3001;

function handlePrivateFrontEndView(app) {

    app.get('/dashboard' , async (req , res) => {
        
        const user = await getUser(req);
        if(user.role == "truckOwner"){
            return res.render('truckOwnerHomePage' , {name : user.name});
        }
        // role of customer
        return res.render('customerHomepage' , {name : user.name});
    });

    app.get('/testingAxios' , async (req , res) => {

        try {
            const result = await axios.get(`http://localhost:${PORT}/test`);
            return res.status(200).send(result.data);
        } catch (error) {
            console.log("error message",error.message);
            return res.status(400).send(error.message);
        }
      
    });  
}  
  
module.exports = {handlePrivateFrontEndView};
  