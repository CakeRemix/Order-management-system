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

  // const user = await db.select('*')
  //   .from('backendTutorial.Session')
  //   .where('token', sessionToken)
  //   .innerJoin('backendTutorial.User', 'backendTutorial.Session.userId', 'backendTutorial.User.id')
  //   .first();

  const user = await db.select('*')
    .from({ s: 'backendTutorial.Session' })
    .where('token', sessionToken)
    .innerJoin('backendTutorial.User as u', 's.userId', 'u.id')
    .first(); 

  
  console.log('user =>', user)
  return user;  
}



module.exports = {getSessionToken , getUser};