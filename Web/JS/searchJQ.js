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

var downloadFile = function(filename){
    var data = {filename: filename};
    $.ajax({
        url: '/private/ajax/downloadAuthorization',
        type: 'GET',
        data: data,
        success: function(result){
            if(!result.success)
                return alertDanger(result.message);
            window.open(result.signedRequest);
        }
    })
}

var displaySearchResults = function(data){
    $('#resultList').html('');
    var entryNum = 0;
    data.forEach(function(ele){
        var entryId = 'entry-'+entryNum++;
        $('#resultList')
        .append("<a id=\""+entryId+"\" class=\"listEntry list-group-item\">\
                    <h4 class=\"list-group-item-heading\">"+ele+"</h4>\
                </a>");
        $('#'+entryId).click(function(){
            var filename = $("#"+entryId+" h4").text();
            downloadFile(filename);
        });
    });
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
            type: 'GET',
            data: data,
            success: function(result){
                if(!result.success)
                    alertDanger(result.message);
                displaySearchResults(result.data);
            }
        });

    });
});