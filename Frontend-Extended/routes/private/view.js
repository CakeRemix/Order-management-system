const db = require('../../connectors/db');
const { getSessionToken , getUser } = require('../../utils/session');


function handlePrivateFrontEndView(app) {

    app.get('/dashboard' , async (req , res) => {
        
        const user = await getUser(req);
        console.log('user info' , user)
        if(user.role == "admin" ){
            return res.render('profile');
        }
        // role of customer
        return res.render('customerHomepage' , {name : user.name});
    });

    app.get('/home' , (req , res) => {    
            return res.render('index' , 
            {title : "Tutorial 9" , 
            desc : "Tutorial is mainly about UI connection with server.",
            });
        });


    app.get('/employee' , async (req , res) => {
        let result;
        try{
            result = await db.select('*').from("backendTutorial.Employee");
        }catch(error){
            console.log("error message",error.message);
            result = error.message;
        }
        console.log("employee" , result);
        return res.render('employee' , {emp : result});
    });

    // create new Employee page
    app.get('/addEmployee' , (req , res) => {    
        return res.render('add');
    });

     // create new Employee page
     app.get('/search' , (req , res) => {    
        return res.render('search');
    });

    // profile page
    app.get('/profile' , (req , res) => {    
        return res.render('profile');
    });


  
}  
  
module.exports = {handlePrivateFrontEndView};
  