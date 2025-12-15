$(document).ready(function(){
    //var id;
    $('#getInfo').click(function(){
      const id = $('#eid').val();
      if(!id){
        alert("Enter an Employee Id")
        return;
      }
      console.log(id)
      $.ajax({
      type: "GET",
      url: `/employee/${id}`,
      success: function(data){
            if(data.length == 0){
        
              $('#fname').val('');
              $('#mname').val('');
              $('#lname').val('');        
              $('#salary').val('');
              $('#country').val('');
              $('#birthdate').val('');
              alert('This employee id doesnot exists');
              return;
            }
            const {id,firstname,middlename,lastname,salary,country,birthdate} = data[0];
            let date = new Date(birthdate);
            let formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()}`
            let [year , month , day] = formattedDate.split("-");
            month = month.length == 1?"0"+month : month;
            day = day.length == 1?"0"+day : day;
            formattedDate = `${year}-${month}-${day}`;
            $('#fname').val(firstname);
            $('#mname').val(middlename);
            $('#lname').val(lastname);        
            $('#salary').val(salary);
            $('#country').val(country);
            $('#birthdate').val(formattedDate);
        }
      
    }); 
    });

    $("#submit").click(function() {
      const id = $('#eid').val();
      console.log("here",id)
      const firstname = $('#fname').val();
      const middlename = $('#mname').val();
      const lastname = $('#lname').val();        
      const salary = $('#salary').val();
      const country = $('#country').val();
      const birthdate = $('#birthdate').val();
      if(!firstname  || !middlename || !lastname || !salary || !country || !birthdate){
        alert("missing info");
        return;
      }
      
      const employeeObj = {
        firstname,
        middlename,
        lastname,
        salary,
        country,
        birthdate

      };

      $.ajax({
        type: "PUT",
        url: `/employee/${id}`,
        data: employeeObj,
        success: function(data){
          if(data) {
            console.log(data);
            alert("succesfully updated")
          }
        },
        error : function(data){
            console.log(data.responseText);
            alert(data.responseText);
        }
      });
  }); 


});      