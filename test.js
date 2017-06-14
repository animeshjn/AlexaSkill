/**
 * Created by Animesh Jain on 6/5/2017.
 */
'use strict';
var accessToken="ya29.GltoBHE_mk7Fc97rcXvtVYGatiBFuOil2wgwFScmIy9ktpnDg48oG-doivUI8buJxM18PGNySg4l-D7XdFqbW1UR1ZPTdKGEKBtLm_j85GSrrErYG3cdpNb7GioI";
var extractorAJ=require('./textprocessor');
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
           // download(result['items'][0]['downloadUrl'],contentLogger);
               readDataFromUrl();

            }
            else {
                console.log("some problem")
            }


        });


    });
}


function readDataFromUrl()
{
    var xml2json= require('simple-xml2json');
    var json;
    var fileData;
    file_Url=`https://www.googleapis.com/drive/v2/files/${fileId}?access_token=${accessToken}&alt=media`;
    //file_Url=`https://drive.google.com/host/0B0j9ugtKqRvzX3l6elR0dUlaTU0&access_token=${accessToken}`
   //file_Url=`https://00e9e64bac484c28d2f7f103cbe7d56c9834d6f1d755e2fe18-apidata.googleusercontent.com/download/drive/v2/files/0B0j9ugtKqRvzX3l6elR0dUlaTU0?qk=AD5uMEs0l3JHPopewXY2__fWwO8KuN3Gbc-x5A5QZ8hN3dHavDEs3rykpHgO4JAxA9Pgznq-s4AP4uV_Z4j0FFHzbDaIbzlBzpTbrcbCMoSOnuusj72iPNE2HzPTI-HDexF6FILaRIZR6B2fhfhwMR26pTnHpJ4EtCjhY0CmTRNaUl9WWL1ZWEMpwCMXrDGILU1lKteksbEGGzU7C79j0q6P0iWdzZrPGPpvVBM1l-AYpBQsp1c0B9QIVLx6AV6BcG04N9af5eaxc2w6v4UEzb4G9YsPNlIyGQYladdLjo7VzgQhy_XkrEIJOHef1rErJSlBuBA3AHGEM4dTkmGOZ8MINVu1rvcz2lDlR7bsGllVh90FnD7PfpA1cfGHS8P4tfZaqyXpmsoFqBfTTnpmzOld26_s5IMu_B7uPIwGZZcP-as-bss8sGHLSuOCLU_aRji5DMuSzPJU63t9TA4mc0PCXKrTyMl28zf9Kz89ZJgAShy7eLWVV1m_09Zjk-zfvQvEkxdTQbdFetbDz5xtVSFwZUpkkKpJ20XSs2H5A2MXgLksdfNsN6dSOoOmbizBYlU8bPGFKPJk1qZ6oS2X81Qzl1-xtuq4ojVVSrVm1R6OtmDHfFXKQA0Ga93EiHO-34v9Jknp9YgZ1eqWhFHbgQsFBSVGhukfnPeJIokne7vRq85L8w2t4hnTLaH3rkSB3cuCepODvZ-tqOrgMZ4p6YvTmuCw-t3CCUWCOoTEgjdAeT5sCLXnsyPvQhEWK7nZnDWK7yUuv1wfNZoKoYBuiJxQOpfsAztkjbgo82DlBhFK6Vsxw16Q_XNMeLRqtSJ2sq4fixXzrVhtnM00xQoALGoMAp5CNHFQF5NBFWIwLLZEUVwtFAqTkxLd1syagKmWxGPbHiSICIty`;
    //console.log(file_Url);
    var https=require('https');
    https.get(file_Url,function(res) {
        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function () {
           json = xml2json.parser(body);
            //console.log("to json -> %s", JSON.stringify(json));
           fileData=json['html']['body']['a']['href'];
            //parse html 2 json
           console.log(fileData);
           readActual(fileData);
         });
    });
}

function readActual(downloadUrl){

    if (downloadUrl) {

        var https=require('https');
        https.get(file_Url,function(res) {
            var body = '';
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {

                console.log((body));
            });
        });
    } else {
        //callback(null);
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
    //url=`https://00e9e64bac484c28d2f7f103cbe7d56c9834d6f1d755e2fe18-apidata.googleusercontent.com/download/drive/v2/files/0B0j9ugtKqRvzX3l6elR0dUlaTU0?qk=AD5uMEs0l3JHPopewXY2__fWwO8KuN3Gbc-x5A5QZ8hN3dHavDEs3rykpHgO4JAxA9Pgznq-s4AP4uV_Z4j0FFHzbDaIbzlBzpTbrcbCMoSOnuusj72iPNE2HzPTI-HDexF6FILaRIZR6B2fhfhwMR26pTnHpJ4EtCjhY0CmTRNaUl9WWL1ZWEMpwCMXrDGILU1lKteksbEGGzU7C79j0q6P0iWdzZrPGPpvVBM1l-AYpBQsp1c0B9QIVLx6AV6BcG04N9af5eaxc2w6v4UEzb4G9YsPNlIyGQYladdLjo7VzgQhy_XkrEIJOHef1rErJSlBuBA3AHGEM4dTkmGOZ8MINVu1rvcz2lDlR7bsGllVh90FnD7PfpA1cfGHS8P4tfZaqyXpmsoFqBfTTnpmzOld26_s5IMu_B7uPIwGZZcP-as-bss8sGHLSuOCLU_aRji5DMuSzPJU63t9TA4mc0PCXKrTyMl28zf9Kz89ZJgAShy7eLWVV1m_09Zjk-zfvQvEkxdTQbdFetbDz5xtVSFwZUpkkKpJ20XSs2H5A2MXgLksdfNsN6dSOoOmbizBYlU8bPGFKPJk1qZ6oS2X81Qzl1-xtuq4ojVVSrVm1R6OtmDHfFXKQA0Ga93EiHO-34v9Jknp9YgZ1eqWhFHbgQsFBSVGhukfnPeJIokne7vRq85L8w2t4hnTLaH3rkSB3cuCepODvZ-tqOrgMZ4p6YvTmuCw-t3CCUWCOoTEgjdAeT5sCLXnsyPvQhEWK7nZnDWK7yUuv1wfNZoKoYBuiJxQOpfsAztkjbgo82DlBhFK6Vsxw16Q_XNMeLRqtSJ2sq4fixXzrVhtnM00xQoALGoMAp5CNHFQF5NBFWIwLLZEUVwtFAqTkxLd1syagKmWxGPbHiSICIty`;
    logger.debug(url);
    console.log("Reade files by name")
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