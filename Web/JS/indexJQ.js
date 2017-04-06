$(document).ready(function(){
        $('#sign-in').click(function(e){
            var username = $('#username').val();
            var password = $('#password').val();
            $.ajax({type:'POST', url:'/login', data: {username: username, password: password}, 
                success:function(res){
                if(res.success){
                    window.location.replace(res.url);
                }else{
                    window.location.replace('/login');
                }
            }});
        });
});