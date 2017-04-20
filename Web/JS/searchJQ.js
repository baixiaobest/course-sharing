var cleanMessages = function(){
    $('.alert-success').css('display', 'none');
    $('.alert-danger').css('display', 'none');
}

var alertDanger = function(message){
    $('.alert-danger').css('display', 'block');
    $('.alert-danger').text(message);
}

var alertSuccess = function(message){
    $('.alert-success').css('display', 'block');
    $('.alert-success').text(message);
}

$(document).ready(function(){
    $.ajax({url:'/private/ajax/username',
        success: function(result){
            $('#greeting').text('Hello, '+result.username);
        }
    });

    $('.selectSchool').click(function(){
        $('#school').text($(this).text());
    });


    $('#searchButton').click(function(){
        cleanMessages();
        var school = $('#school').text();
        var className = $('#className').val();
        var keyword = $('#keyword').val();

        if(school == 'None' || !className){
            return alertDanger('Please fill up school and class name');
        }
        var data = {
            school: school,
            className: className,
            keyword: keyword
        }

        $.ajax({
            url: '/private/ajax/searchFiles',
            type: 'get',
            data: data,
            success: function(result){
                
            }
        });

    });
});