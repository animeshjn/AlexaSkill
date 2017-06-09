'use strict';
listFiles();
function listFiles(){
    var url;
    var accessToken="ya29.GlthBDbPeNe5DkQawo8moMM2bvnRxmFtHBtRmjGAUowHsDzYVO1TI_5KqxoCnJxO-R0enNnKjCxY2PHyTv262URTSV1RniTZ0b5u85RJsVlrg1Y4OvOJ8yDmKA9a";
    url=`https://www.googleapis.com/drive/v2/files?access_token=${accessToken}&q=mimeType+%3d+%27application%2Fpdf%27`;
    console.log(url);
    console.log("called");
    var https=require('https');
    https.get(url,function(res){
        var body='';
        res.on('data',function(chunk){
            body+=chunk;
        });
        res.on('end',function(){
            var result= JSON.parse(body);
            var files;
            // response.speechText=`Result not available`;
            // response.shouldEndSession=true;
            // response.done();
            if(result){
                var res=`There are documents.`;
                var files=[];
                console.log(res);
                var item;
                if(result['items']){
                    item=result['items'];}
                //response.speechText+=`There are ${item.length} documents.`;
                console.log(`There are ${item.length} documents.`)
                var count=0;
                item.forEach(function(valuef){
                    //if(valuef.mimeType=='application/pdf')
                    //{
                    files[count]=valuef.title;
                    count++;
                    //}
                });
                console.log(`There are ${count} documents, which one you want to open?.`)
                files.forEach(function (name) {
                    console.log(name);
                });
                //  response.shouldEndSession=false;
                //  response.done();
            }
            else
            {console.log("some problem") }


        });

    }).on('error',function(e){
        //response.fail(e);
        console.error(e);
    });




}