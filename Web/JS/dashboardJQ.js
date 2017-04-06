$(document).ready(function(){
    $.ajax({url:'/private/ajax/userinfo',
        success: function(result){
            $('#greeting').text('Hello, '+result.username);
        }
    });
});