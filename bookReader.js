/**
 * Created by Animesh Jain on 6/12/2017.
 */
/**
 * Read contents of a specific book here
 *
 * */
function getBookUrlByName(accessToken,name,request,response,extension)
{
    var url;
    url=`https://www.googleapis.com/drive/v2/files?access_token=${accessToken}&q=title+%3d+%27${name+""+extension}%27`;
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
                return result['items'][0]['downloadUrl'];
                //console.log(fileId);
                // download(result['items'][0]['downloadUrl'],contentLogger);
            }
            else {
                console.log("Problem getting download URL")
            }
        });
    });
}
/**
 * Returns textual data from the google drive url
 * @param url downloadUrl
 * @param accessToken of the authorized app
 * @returns {string} raw content extracted from file
 */
function getRawContentFromUrl(url,accessToken){
    let driveinterface= require('./drive-intertface');
    driveinterface.downloadFileContents(url,accessToken,callback);
    let rawContent="";
    function callback(content){
        rawContent=content;
    }

    return rawContent;
}

function getBookDataByName(accessToken,name,request,response,session,extension)
{
    let textProcessor= require("./textprocessor");
let downloadUrl= getBookUrlByName(accessToken,name,request,response,extension);
let rawContent = getRawContentFromUrl(downloadUrl,accessToken);
console.log(rawContent);


let contentArray;

if(!session.attributes.contentArray){
contentArray=textProcessor.contentArray(rawContent);
session.attributes.contentArray=contentArray;
}
else {
    session.attributes.contentArray
}



}
