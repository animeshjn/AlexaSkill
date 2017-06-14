/**
 * Created by Animesh Jain on 6/12/2017.
 */
/**
 * Read contents of a specific book here
 *
 * */
'use-strict';
let textProcessor= require("bookReadAnimesh/textprocessor");
let totalLines=0;
let linesPerPage=10;
let currentBookId="";
let booksFound=0;
let currentLine=0;
let downloadUrl="";
function getBookUrlByName(accessToken,name,request,response,extension,callback)
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
                booksFound=result['items'].length;
              // if(booksFound==0){
              //     return "";
              // }
                if (result['items'][0]['id']) {
                   currentBookId= result['items'][0]['id'];
                    console.log(currentBookId);
                }
               callback(result['items'][0]['downloadUrl']);
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
function getRawContentFromUrl(url,accessToken,callback){
    let driveinterface= require('bookReadAnimesh/drive-intertface');
    driveinterface.downloadFileContents(url,accessToken,callback);

}

function getBookDataByName(accessToken,name,request,response,session,extension,callbackForArray)
{
getBookUrlByName(accessToken,name,request,response,extension,callWithUrl);
function callWithUrl(downloadUrl){
    console.log(downloadUrl);
    getRawContentFromUrl(downloadUrl,accessToken,manipulateContent);
    function manipulateContent(bookText){
       let contentArray=textProcessor.contentArray(bookText);
        callbackForArray(contentArray);
    }

}


//console.log(rawContent);
// let contentArray;
// if(!session.attributes.contentArray){
// contentArray=textProcessor.contentArray(rawContent);
// session.attributes.contentArray=contentArray;
// }
// else {
// contentArray= session.attributes.contentArray;
// }
// totalLines=contentArray.length;
// console.log("Lines in this book: "+totalLines);
// return contentArray;
}

//Read Whole book
module.exports.readWholeBook=function readWholeBook(accessToken,name,request,response,session,extension,sendBack){

    // getBookDataByName(accessToken,name,request,response,session,extension,callbackForArray);
    // function callbackForArray(arrayText){
    //     for(let i=0;i<arrayText.length;i++){
    //            response.speechText+=" "+arrayText[i];
    //            //currentLine++;
    //            //session.attributes.currentLine=currentLine;
    //     }
    //     response.speechText+="I have finished reading the book, What you want me to do next ?";
    //     response.shouldEndSession=false;
    //     response.done();
    // }
    response.speechText+="I have finished reading the book, What you want me to do next ?";
    response.shouldEndSession=false;
    sendBack(response);
    // response.done();
    //   for(let i=0;i<wholeContent.length;i++){
  //        response.speechText+=" "+wholeContent[i];
  //       currentLine++;
  //       session.attributes.currentLine=currentLine;
  //   }

}
// resume reading from current line

function setUrl(url){
    downloadUrl=url;
}