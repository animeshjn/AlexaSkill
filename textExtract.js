/** Created by animesh jain as the part of Read it skill June 2017 */
'use-strict';
let fs=require('fs');
let contentStart="Contents For Alexa";
let contentEnd="End Contents";
let contentsEndIndex=0;
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
        //let contentsIndex=contentData.substring(contentData.indexOf(contentStart)+contentStart.length,contentData.lastIndexOf(contentEnd));
        let contentsIndex=getContentsInBetween(contentData,contentStart,contentEnd);
        let canonicalList=contentsIndex.replace(/(\r\n|\r|\n)/g, '\n');
        let array=canonicalList.split('\n');
      callback(array[chapterNumber].replace(/\d+/g, ''));

    }

}


exports.contentArray= contents =>{
    let canonicalContent=contents.replace(/(\r\n|\r|\n)/g, '\n');
    let wholeContentArray=canonicalContent.split('\n');
    //console.log(wholeContentArray[72]);
    return wholeContentArray;
}

function getContentsInBetween(originalContent,startStringExclusive,endStringExclusive)
{
    return originalContent.substring(originalContent.indexOf(startStringExclusive)+startStringExclusive.length,
            originalContent.lastIndexOf(endStringExclusive));
}

function getChapterData(chaptersArray,chapterPhrase,callback){

    var contentsEndIndex=getContentsEndIndex(chaptersArray,contentEnd);

    for(var i=contentsEndIndex;i<chaptersArray.length;i++){

        var phrase=chapterPhrase;
        var dotProcessed=phrase.replace(".","[.]");
        var regexString="^"+dotProcessed+"*";
        var re = new RegExp(regexString, "gi");
          if(chaptersArray[i].search(re)>-1){
            {console.log(chaptersArray[i]+" || found index: "+i);
                callback(i);
                break;
            }
              }
    }
}

function getContentsEndIndex(chaptersArray,chapterPhrase){
    var counter=0;
    if(contentsEndIndex>0)
        return contentsEndIndex;
    for(var i=0;i<chaptersArray.length;i++){
        // console.log(chaptersArray[i]);
        if(chaptersArray[i].toString().trim().indexOf(chapterPhrase.toString().trim())>-1){
                console.log("found index: "+i);
                contentsEndIndex=i;
                return i;

        }
    }
}



function unitTest()
{
    var chapterPhrase="";
    function logger(data){
       chapterPhrase=data;
    }

   module.exports.getChapterName('./Dracula.txt',1,logger);
    module.exports.getAllContent('./Dracula.txt',chapterData);
    function chapterData(content){
        var array=module.exports.contentArray(content);
        function callback(array){
           getChapterData(array,chapterPhrase,printData);
           function printData(index){
               console.log("chapter data begin");
               for(var j=index;j<array.length;j++)
               {
                  console.log(array[j]);
               }


           }

        }

    }



}
unitTest();