const db = require('../connectors/db');

function getSessionToken(req) {
  
  //console.log("cookie",req.headers.cookie);
  if(!req.headers.cookie){
    return null
  }
  const cookies = req.headers.cookie.split(';')
    .map(function (cookie) { return cookie.trim() })
    .filter(function (cookie) { return cookie.includes('session_token') })
    .join('');

  const sessionToken = cookies.slice('session_token='.length);
  if (!sessionToken) {
    return null;
  }
  return sessionToken;
}

async function getUser(req) {

  const sessionToken = getSessionToken(req);
  if (!sessionToken) {
    console.log("no session token is found")
    return res.status(301).redirect('/');
  }


  const user = await db.select('*')
    .from({ s: 'FoodTruck.Sessions' })
    .where('token', sessionToken)
    .innerJoin('FoodTruck.Users as u', 's.userId', 'u.userId')
    .first(); 

  if(user.role == "truckOwner"){
    const TruckRecord = await db.select('*')
    .from({ u: 'FoodTruck.Trucks' })
    .where('ownerId', user.userId)
    // has no FoodTrucks
    if(TruckRecord.length == 0){
      console.log(`This ${user.name} has no owned trucks despite his role`);
      console.log('user =>', user)
      return user; 
    }else{
      const firstRecord = TruckRecord[0];
      const truckOwnerUser =  {...user, ...firstRecord}
      console.log('truck Owner user =>', truckOwnerUser)
      return truckOwnerUser;
    }
  }

  // role of customer
  console.log('user =>', user)
  return user;  
}



module.exports = {getSessionToken , getUser};