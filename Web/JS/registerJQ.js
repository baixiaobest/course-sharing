$(document).ready(function(){
        $('#login-submit').click(function(e){
            var username = $('#login-form #username').val();
            var password = $('#login-form #password').val();
            $.ajax({type:'POST', url:'/login', data: {username: username, password: password}, 
                success:function(res){
                if(res.success){
                    window.location.replace(res.url);
                }else{
                    $('.alert').css('display', 'block');
                    $('.alert').text(res.message);
                }
            }});
        });

        $('#register-submit').click(function(e){
            var username = $('#register-form #username').val();
            var email = $('#register-form #email').val();
            var password = $('#register-form #password').val();
            var confirmPassword = $('#register-form #confirm-password').val();
            var data = {username: username, email: email, password:password, confirmPassword:confirmPassword};
            $.ajax({type: 'POST', url:'/register', data: data,
                success: function(res){
                    if(res.success){
                        window.location.replace(res.url);
                    }else{
                        $('.alert').css('display', 'block');
                        $('.alert').text(res.message);
                    }
                }
                });
        });

        $('#login-form-link').click(function(e) {
            $("#login-form").delay(100).fadeIn(100);
            $("#register-form").fadeOut(100);
            $('#register-form-link').removeClass('active');
            $(this).addClass('active');
            e.preventDefault();
        });
        $('#register-form-link').click(function(e) {
            $("#register-form").delay(100).fadeIn(100);
            $("#login-form").fadeOut(100);
            $('#login-form-link').removeClass('active');
            $(this).addClass('active');
            e.preventDefault();
        });
});