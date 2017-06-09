/**
 * Created by ajain13 on 6/5/2017.
 */
'use strict';

var accessToken="ya29.GlxkBPruZ8GE-S2IxhRpnKu1mliivyeu9P7_tFahpv0NDq-ILXu9QV6cRVAFHklO4pG1yfrciBEFYYxfdn4tNaYSvVd3JPsgkMhRtDUE0VYKw9587PXkx8S0ZMKs4g";
var extractorAJ=require('./textExtract');
var fileId;
var file_Url;
//listFiles();
readBookByName("Dracula");
var xhr=require('xhr');
function caller(){
    var fs = require('fs');
    var content = fs.readFileSync("sampleDriveResponse.JSON");
  //  console.log("Output Content : \n"+ content);
   // var v=require('../AlexaSkill/sample');
    //var foo=require('../AlexaSkill/sampleDriveResponse.JSON');
   var  parsed= JSON.parse(content);
    console.log("called");
    if(parsed)
    {
        console.log("JSON is parsed");
        console.log("Get items form drive response");
        var item=parsed['items'];
        console.log(item.length);



    }


}

function readBookByName(name)
{
    var url;
    // var accessToken="ya29.GltgBGDBl5HG_DaIjCJnZC-BjdizyF-8WnGrbtGxZ7uKMDinBFy4la0ysulJPN67-orm0pL56Y7Ucu5ful7XVSCoWWg9ztseaYqrVNSJ9gUS1MyCEdIQhVJt9NzT";
    url=`https://www.googleapis.com/drive/v2/files?access_token=${accessToken}&q=title+%3d+%27${name+".txt"}%27`;

    console.log(url);

    var https=require('https');
    https.get(url,function(res) {
        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function () {
            var result = JSON.parse(body);
            var files;

            if (result) {
                var files = [];

                if (result['items'][0]['id']) {
                    fileId = result['items'][0]['id'];
                }
                file_Url = result['items'][0]['webContent_Link'];
            console.log(fileId);
            download(result['items'][0]['downloadUrl'],contentLogger);
             //   readDataFromUrl();

            }
            else {
                console.log("some problem")
            }


        });


    });
}


function readDataFromUrl()
{
    file_Url=`https://www.googleapis.com/drive/v2/files/${fileId}?access_token=${accessToken}&alt=media`;
    file_Url=`https://drive.google.com/host/0B0j9ugtKqRvzX3l6elR0dUlaTU0&access_token=${accessToken}`
    //console.log(file_Url);
    var https=require('https');
    https.get(file_Url,function(res) {
        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function () {


                console.log(body);

         });


    });


}

function download(downloadUrl, callback){

    if (downloadUrl) {

        var xhrw = new xhr();
        xhrw.open('GET', downloadUrl);
        xhrw.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        xhrw.onload = function() {
            callback(xhr.responseText);
        };
        xhrw.onerror = function() {
            callback(null);
        };
        xhrw.send();
    } else {
        callback(null);
    }

}


function contentLogger(content)
{
    console.log(content);
}

function listFiles(){
    var url;
   // var accessToken="ya29.GltgBGDBl5HG_DaIjCJnZC-BjdizyF-8WnGrbtGxZ7uKMDinBFy4la0ysulJPN67-orm0pL56Y7Ucu5ful7XVSCoWWg9ztseaYqrVNSJ9gUS1MyCEdIQhVJt9NzT";
    url=`https://www.googleapis.com/drive/v2/files?access_token=${accessToken}&q=mimeType+%3d+%27text%2Fplain%27`;
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
               // console.log(`There are ${item.length} documents.`)
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
function readFilesByName(request,response,session,title){

    var url;
    url = `https://www.googleapis.com/drive/v2/files?access_token=${accessToken}&q=title+%3d+%27${title}%27`;
    logger.debug(url);

    https.get(url, function (res) {
        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var result= JSON.parse(body);
        });
    });
}