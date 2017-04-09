var fileObj = {};
var uploadFileNum = 0;
var displayFileName = function(filename){
    $('#upload-icon').css('display','none');
    $('#upload-names')
    .append("<button id=\"upload-file-"+ uploadFileNum +"\" type=\"button\" class=\"btn btn-default\" aria-label=\"Left Align\"><span class=\"glyphicon glyphicon-file\" aria-hidden=\"true\"></span>"+filename+"</button>");
    $('#upload-file-'+uploadFileNum).one('click', function(){
        delete fileObj[filename];
        $(this).remove();
        uploadFileNum--;
        if(uploadFileNum == 0)
            $('#upload-icon').css('display','inline');
    });
    uploadFileNum++;
}

var removeFileNames = function(){
    for(var i=0; i<=uploadFileNum; i++)
        $('#upload-file-'+i).remove();
    uploadFileNum = 0;
}

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

    $('#attachFiles').click(function(){
        $('#upload-input').click();
    });

    $('#upload-input').on('change', function(){
        var files = $(this).get(0).files;
        for(var i=0; i<files.length; i++){
            var file = files[i];
            fileObj[file.name] = file;
            displayFileName(file.name);
        }
    });

    $('#upload-btn').click(function(){
        cleanMessages();
        var formData = new FormData();
        var size=0;
        for(var filename in fileObj){
            if(fileObj.hasOwnProperty(filename)){
                formData.append('uploads[]', fileObj[filename], filename);
                size++;
            }
        }
        if(size==0)
            return alertDanger('No file is attached');
        if($('#school').text() == 'None' || !$('#className').val()){
            return alertDanger('Please fill up school and class name');
        }
        removeFileNames();

        $.ajax({
            url: '/private/ajax/uploadFiles',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(data){
                if(data.success){
                    alertSuccess('Upload Success');
                }else{
                    alertDanger(data.message);
                }
            },
            xhr: function(){
                var xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', function(evt){
                    if(evt.lengthComputable){
                        var percentage = parseInt(evt.loaded/evt.total * 100);
                        $('.progress-bar').text(percentage + '%');
                        $('.progress-bar').width(percentage + '%');
                        $('.progress').css('display', 'block');
                        if(percentage == 100){
                            $('#upload-icon').css('display','inline');
                            $('.progress').css('display','none');
                        }
                    }
                }, false);

                return xhr;
            }
        });
    });

});