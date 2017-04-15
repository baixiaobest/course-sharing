var fileObj = {};
var uploadFileNum = 0;
var uploadedSize = 0;

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

var resetIconAndProgress = function(){
    $('#upload-icon').css('display','inline');
    $('.progress').css('display','none');
}

var uploadFile = function(file, signedRequest, contentType, totalFileSize, callback){
    var formData = new FormData();
    formData.append('file', file, file.name);
    $('#upload-icon').css('display','none');
    $.ajax({
        url: signedRequest,
        type: 'PUT',
        contentType: contentType,
        processData: false,
        data: formData,
        success: function(){
            callback();
        },
        error: function(err){
            callback(err);
        },
        // monitor the progress, update progress bar
        xhr: function(){
                var xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', function(evt){
                    if(evt.lengthComputable){
                        var percentage = parseInt((uploadedSize + evt.loaded)/totalFileSize * 100);
                        $('.progress-bar').text(percentage + '%');
                        $('.progress-bar').width(percentage + '%');
                        $('.progress').css('display', 'block');
                        if(percentage == 100){
                            resetIconAndProgress();
                        }
                    }
                }, false);
            return xhr;
        }
    });
}

var registerFileToDatabase = function(filename, fileType, className, school, callback){
    $.ajax({
        url: '/private/ajax/registerUploadedFile',
        type: 'POST',
        data: {filename: filename, fileType: fileType, className: className, school: school}
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
        $(this).val('');
    });

    $('#upload-btn').click(function(){
        cleanMessages();
        uploadedSize = 0;
        var school = $('#school').text();
        var className = $('#className').val();

        if(jQuery.isEmptyObject(fileObj))
            return alertDanger('No file is attached');
        if(school == 'None' || !className){
            return alertDanger('Please fill up school and class name');
        }

        var totalFileSize=0;
        var fileArr = [];
        for(var filename in fileObj){
            totalFileSize += fileObj[filename].size;
            fileArr.push(fileObj[filename]);
        }

        // get authorization for each file and upload them
        var next = function(){
            if(fileArr.length == 0)
                return alertSuccess('Upload Success');
            var file = fileArr.shift();
            var fileType = file.type;
            var filename = file.name;
            data = {
                filename: filename,
                fileType: fileType
            };
            // get authorization for upload
            $.ajax({
               url: '/private/ajax/uploadAuthorization',
               type: 'GET',
               data: data,
               success: function(result){
                   // Upload granted
                   if(result.success){
                       uploadFile(file, result.signedRequest, fileType, totalFileSize, function(err){
                            if(err){
                                alertDanger('Upload for '+filename+' failed');
                                return resetIconAndProgress();
                            }
                            uploadedSize += file.size;
                            alertSuccess('Uploaded: '+filename);
                            registerFileToDatabase(filename, fileType, school, className);
                            next();
                       });
                   }else{ // Upload not granted
                        alertDanger(result.message);
                        return resetIconAndProgress();
                   }
               }
           });
        }
        removeFileNames();
        fileObj = {};
        next();
    });

});