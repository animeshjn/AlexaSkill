/** Created by animesh jain as the part of Read it skill June 2017 */
'use-strict';
let fs=require('fs');
let contentStart="Contents For Alexa";
let contentEnd="End Contents";
/**
 * Function toi get all text from a given text document
 * @param filePath path of the file whose contents to be read
 * @param callback function called on complete content read
 */
exports.getAllContent=function getAllContent(filePath, callback){

    fs.readFile(filePath, 'utf8', function(err, contents) {
      callback(contents);
    });
}

/**
 * Function returns the name of the chapter name from the chapter number
 * @param chapterNumber
 * @param callback
 */
exports.getChapterName=function getChapterName(filePath,chapterNumber,callback){
    //search contents for alexa
    //search
    // string1(.*)endString
    let allContent=module.exports.getAllContent(filePath,manipulate)
    function manipulate(contentData){
        let contentsIndex=contentData.substring(contentData.indexOf(contentStart)+contentStart.length,contentData.lastIndexOf(contentEnd));
        let canonicalList=contentsIndex.replace(/(\r\n|\r|\n)/g, '\n');
        let array=canonicalList.split('\n');
      callback(array[chapterNumber].replace(/\d+/g, ''));

    }



}

function getContentsInBetween(originalContent,startStringExclusive,endStringExclusive)
{
    return originalContent.substring(originalContent.indexOf(startStringExclusive)+startStringExclusive.length,
            originalContent.lastIndexOf(endStringExclusive));
}

function getChapterData(){

}

//
// {var i = 0;
//     while (i < output.length)
//     {
//         var j = output.indexOf("\\n", i);
//         if (j == -1) j = output.length;
//
//         i = j+1;
//     }}


function unitTest()
{

    function logger(data){
        console.log(data);
    }

   module.exports.getChapterName('./Dracula.txt',1,logger);

}
unitTest();