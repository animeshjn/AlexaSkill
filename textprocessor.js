/** Created by animesh jain as the part of Read it skill June 2017 */
'use-strict';
var fs = require('fs');
var contentStart = "Contents For Alexa";
var contentEnd = "End Contents";
var contentsEndIndex = 0;
/**
 * Function toi get all text from a given text document
 * @param filePath path of the file whose contents to be read
 * @param callback function called on complete content read
 */
//exports.getAllContent=
exports.getAllContent = function getAllContent(filePath, callback) {
    fs.readFile(filePath, 'utf8', function (err, contents) {
        callback(contents);
    });
}

/**
 * Function returns the name of the chapter name from the chapter number
 * @param chapterNumber
 * @param callback
 */

exports.getChapterName = function getChapterName(contentData, chapterNumber, callback) {
    //search contents for alexa
    //search
    // string1(.*)endString
    var contentsIndex = contentData.substring(contentData.indexOf(contentStart) + contentStart.length, contentData.lastIndexOf(contentEnd));
    var contentsIndex = getContentsInBetween(contentData, contentStart, contentEnd);
    //var canonicalList=contentsIndex.replace(/(\r)/g, '\n');
    var array = contentsIndex.split('\n');
    callback(array[chapterNumber].trim());
}

exports.contentArray = contents => {
    var canonicalContent = contents;
    //canonicalContent=canonicalContent.replace(/("|')/g, '\"');
    //canonicalContent = canonicalContent.replace(/(\r)/g, '');
    canonicalContent = canonicalContent.replace(/&/g, 'and');
    canonicalContent = canonicalContent.replace(/[^a-zA-Z 0-9 \n '' ' . " , ; : ? !]+/g, '');
    var wholeContentArray = canonicalContent.split('\n');
    //console.log(wholeContentArray[72]);
    return wholeContentArray;
}

function getContentsInBetween(originalContent, startStringExclusive, endStringExclusive) {
    return originalContent.substring(originalContent.indexOf(startStringExclusive) + startStringExclusive.length,
        originalContent.lastIndexOf(endStringExclusive));
}

function getStartIndex(originalContent, startStringExclusive) {
    console.log(originalContent.indexOf(startStringExclusive) + startStringExclusive.length);
    return originalContent.indexOf(startStringExclusive) + startStringExclusive.length;
}

function getChapterData(chaptersArray, chapterPhrase, callback) {
    var contentsEndIndex = getContentsEndIndex(chaptersArray, contentEnd);
    for (var i = contentsEndIndex; i < chaptersArray.length; i++) {
        var phrase = chapterPhrase;
        var dotProcessed = phrase.replace(".", "[.]");
        var regexString = "^" + dotProcessed + "*";
        var re = new RegExp(regexString, "gi");
        if (chaptersArray[i].search(re) > -1) {
            {
                console.log(chaptersArray[i] + " || found index: " + i);
                callback(i);
                break;
            }
        }
    }
}

exports.getChapterDataStartIndex=function getChapterDataStartIndex(chaptersArray, chapterPhrase, callback) {
    var contentsEndIndex = getContentsEndIndex(chaptersArray, contentEnd);
    var flag= false;
    for (var i = contentsEndIndex; i < chaptersArray.length; i++) {
        var phrase = chapterPhrase;
        var dotProcessed = phrase.replace(".", "[.]");
        var regexString = "^" + dotProcessed + "*";
        var re = new RegExp(regexString, "gi");
        if (chaptersArray[i].search(re) > -1) {
            {//console.log(chaptersArray[i]+" || found index: "+i);
                console.log("Chapter detected");
                console.log("chapter start index:"+i);
                callback(chaptersArray,i);
                flag=true;
                break;
            }
        }
    }
    if(!flag){
        callback();
    }

}
function getContentsEndIndex(chaptersArray, chapterPhrase) {
    var counter = 0;
    if (contentsEndIndex > 0)
        return contentsEndIndex;
    for (var i = 0; i < chaptersArray.length; i++) {
        // console.log(chaptersArray[i]);
        if (chaptersArray[i].toString().trim().indexOf(chapterPhrase.toString().trim()) > -1) {
            contentsEndIndex = i;
            return i;
        }
    }
}


function unitTest() {
    var chapterPhrase = "";
    var maxChapters=12;
    var chapterNumber;
    function logger(data) {
        chapterPhrase = data;
        console.log(data);

    }
    module.exports.getAllContent('./Dracula.txt', chapterData);
    function chapterData(content) {
        module.exports.getChapterName(content, 1, logger);
        var array = module.exports.contentArray(content);
        for(var i=0;i<array.length;i++)
        {
            console.log(array[i]);
        }

        exports.getChapterDataStartIndex(array, chapterPhrase, call);
    }
    function call(array,index) {
     //   console.log(JSON.stringify(array));
    }

    //      console.log(content);
    //      // function callback(array){
    //      //    getChapterData(array,chapterPhrase,printData);
    //      //    function printData(index){
    //      //        console.log("chapter data begin");
    //      //        for(var j=index;j<array.length;j++)
    //      //        {
    //      //           console.log(array[j]);
    //      //        }
    //      //
    //      //
    //      //    }
    //      //
    //      // }
    //
    //  }


}
unitTest();