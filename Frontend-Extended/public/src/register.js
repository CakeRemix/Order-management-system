$(document).ready(function(){

    // Handle Registration Button Click
    $("#register").click(function() {
      const name = $('#name').val();
      const email = $('#email').val();
      const password = $('#password').val();

      const data = {
        name,
        email,
        password,
      };

      $.ajax({
        type: "POST",
        url: '/api/v1/user',
        data : data,
        success: function(serverResponse) {
          if(serverResponse) {
            console.log(serverResponse);
            alert("successfully registered user")
            location.href = '/';
          }
        },
        error: function(errorResponse) {
          if(errorResponse) {
            alert(`Error Register User: ${errorResponse.responseText}`);
          }            
        }
      });
    });      
  });