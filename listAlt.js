var https= require('https');
var Promise=require('bluebird');
var MAX_READ_FILES=5;
var MAX_FILES=20;

function listFiles(response, session){
    var url;
    url=`https://www.googleapis.com/drive/v2/files?access_token=${session.user.accessToken}&q="mimeType:application/pdf"`;
    logger.debug(url);
    https.get(url,function(res){
        var body='';
        res.on('data',function(chunk){
            body+=chunk;
        });
        res.on('end',function(){
            var result= JSON.parse(body);
            var files;
            if(result.resultSizeEstimate)
            {
                response.SpeechText=`There are ${result.resultSizeEstimate} documents.`;
                response.SpeechText+=`Here are few documents`;
            }
            files=result.items;
            if(files.length>MAX_READ_FILES){
                session.attributes.files=files.slice(0,MAX_FILES);
                files=result.files.slice(0,MAX_READ_FILES);
                session.attributes.offset=MAX_READ_FILES;
                readFilesFromIds(files,response,session);
            }
            else {
                response.fail(body);
            }

        });

    }).on('error',function(e){
        response.fail(e);
    });

}

function readFilesFromIds(files,response,session) {
    logger.debug(files);
    var promises= files.map(function(filef){
        return new Promise(function(resolve,reject){

            getFileFromId(filef.id,session.user.accessToken,function(res,err){
                var title = res.title.value;
                filef.result={
                    title:res.title,
                    url:res.downloadUrl
                };
               resolve();


            });

        });


    });

    promises.all(promises).then(function(){
        files.forEach(function(filef,idx){
            response.speechText+=`<say-as interpret-as="ordinal">${idx+1}</say-as> Files found with name ${filef.result.title}`
        });
        response.shouldEndSession=true;
        if(session.attributes.offset&&session.attributes.offset>0){
            response.speechText+="Do you want to continue? ";
            response.repromptText=" You can say yes or stop. ";
            response.shouldEndSession=false;
        }
        response.done();
    }).catch(function(err){
        response.fail(err);
    });
}
function getFileFromID(fileId,token,callback){
var url=`https://www.googleapis.com/drive/v2/files/${fileId}?access_token=${token}`;
https.get(url,function(res){
    var body='';
    res.on('data',function(chunk){
        body+=chunk;
    });

    res.on('end',function(){
        logger.debug(body);
        var result=JSON.parse(body);
        callback(result);
    });

}).on('error',function(e){
    logger.error("Error Caught: "+e);
    callback('',err);
    });


}

