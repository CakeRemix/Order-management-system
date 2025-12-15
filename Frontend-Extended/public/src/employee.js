$(document).ready(function(){
      // #tbody means id = "tbody"
      // .remove means class = "remove"
      $('#tbody').on('click', '.remove', function () {
        console.log("removed");
        var id = $(this).attr("id");
        $(this).parent().parent().remove();
        $.ajax({
        type: "DELETE",
        data : { message : "deleted"},
        url: '/employee/'+`${id}`,
        success: function(data){
            console.log(data);
        },
        error: function(data){
            console.log("error message" , data.responseText)
            alert(data.responseText);
        }
      });
      });


      
});      