$(document).ready(function(){
    var empArray = [];
    $("#search").click(function() {
        console.log("entered here");
        const countryName = $('#countryName').val();
        const serverApiPoint = countryName == ""?"/employee/view":`/employee/search/${countryName}`;
        console.log(countryName);
        $('#tbody').empty();
        $('#thead').empty();
        empArray = [];
        $.ajax({
        type: "GET",
        url: serverApiPoint,
        success: function(data){
                $('#thead').append(`
                    <tr>
                        <th class="text-center">ID</th>
                        <th class="text-center">FirstName</th>
                        <th class="text-center">MiddleName</th>
                        <th class="text-center">LastName</th>
                        <th class="text-center">Country</th>
                        <th class="text-center">Salary</th>
                    </tr>
                `);
                for( let i = 0; i<data.length;i++ ){
                  let row = data[i]  
                  $('#tbody').append(
                        `<tr>
                              <td class="text-center">${row.id}</td>
                              <td class="text-center">${row.firstname}</td>
                              <td class="text-center">${row.middlename}</td>
                              <td class="text-center">${row.lastname}</td>
                              <td class="text-center">${row.country}</td>
                              <td class="text-center">
                                <div class="col-sm-10">
                                    <input type="text"  id="${i}" name="salary" placeholder="Enter salary" value=${row.salary} required >
                                </div>
                              </td>
                        </tr>`);
                    empArray.push({id : row.id, salary : row.salary});
                  }
                $('#div-btn').css("display","block");
        },
        error : function(data){
          console.log("error message",data.responseText);
        }
        });
    });
    
    
    $('#update').click(function(){
        if($('#div-btn').css("display") == 'none'){
            return;
        }
        
        const updateEmpArray = [];
        for(let i = 0;i<empArray.length;i++){
           let updatedSalary = parseFloat($(`#${i}`).val());
           if(empArray[i].salary != updatedSalary){
                empArray[i].salary = updatedSalary;
                updateEmpArray.push(empArray[i]);
           } 
        }
        console.log("here",updateEmpArray)
        const obj = {row : updateEmpArray};
        if(updateEmpArray.length == 0){
          alert("you didnot update any employee salary");
          return;
        }
        $.ajax({
              type: "PUT",
              url: '/employee/update',
              data: obj,
              success: function(data){
                if(data) {
                  console.log(data);
                  $('#tbody').empty();
                  $('#thead').empty();
                  $('#div-btn').css("display","none");
                  alert(data);
                }
              }
            });

    });



});