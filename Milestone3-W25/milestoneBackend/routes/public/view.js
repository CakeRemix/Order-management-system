
function handlePublicFrontEndView(app) {
  
    app.get('/', function(req, res) {
        return res.render('login');
      });
    
      app.get('/register', async function(req, res) {
        return res.render('register');
      });
}  
  
module.exports = {handlePublicFrontEndView};
  