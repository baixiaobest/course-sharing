$(document).ready(function(){
    $.ajax({url:'/private/ajax/username',
        success: function(result){
            $('#greeting').text('Hello, '+result.username);
        }
    });
});