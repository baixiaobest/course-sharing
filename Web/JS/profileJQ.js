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

var alert

$(document).ready(function(){
    $.ajax({url:'/private/ajax/username',
        success: function(result){
            $('#greeting').text('Hello, '+result.username);
        }
    });

    $.ajax({url: '/private/ajax/userProfile',
        success: function(result){
            if(result){
                $('#name').val(result.name);
                $('#username').val(result.username);
                $('#email').val(result.email);
                $('#school').text(result.school);
            }
        }
    });

    $('.selectSchool').click(function(){
        $('#school').text($(this).text());
    });

    $('#updateProfile').click(function(err){
        cleanMessages();
        var data = {
            name: $('#name').val(),
            username: $('#username').val(),
            email: $('#email').val(),
            school: $('#school').text()
        };
        $.ajax({type:'POST', url: '/private/ajax/updateProfile', data: data,
        success: function(result){
            if(result.success){
                alertSuccess('Profile Update Succeeded');
            }else{
                alertDanger(result.message);
            }
            $('#greeting').text('Hello, '+data.username);
        }});
    });

    $('#updatePassword').click(function(){
        cleanMessages();
        var oldPassword = $('#oldPassword').val();
        var newPassword = $('#newPassword').val();
        var retypePassword = $('#retypePassword').val();
        var data = {oldPassword: oldPassword, newPassword: newPassword};
        if(newPassword !== retypePassword){
            alertDanger('retype password does not match password');
            $('#retypePassword').val("");
            return;
        }
        if(newPassword.length < 6){
            alertDanger('password needs to be at least 6 characters');
            $('#retypePassword').val("");
            return;
        }
        $.ajax({type: 'POST', url: '/private/ajax/updatePassword', data:data,
        success: function(result){
            if(result.success){
                alertSuccess('Password update Succeeded');
                $('#oldPassword').val("");
                $('#newPassword').val("");
                $('#retypePassword').val("");
            }else{
                alertDanger(result.message);
                $('#retypePassword').val("");
            }
        }});
    });
});