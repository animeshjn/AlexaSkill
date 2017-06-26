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
    canonicalContent = canonicalContent.replace(/(\r)/g, '\n');
    canonicalContent = canonicalContent.replace(/&/g, 'and');
    canonicalContent = canonicalContent.replace(/\uFFFD/g, '');
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
                break;
            }
        }
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
    module.exports.getAllContent('./Dracula.txt', chapterData);
    function chapterData(content) {
        module.exports.getChapterName(content, 6, logger);
        function logger(data) {
            var array = module.exports.contentArray(content);
            chapterPhrase = data;
            console.log(data);
            module.exports.getChapterDataStartIndex(array, chapterPhrase, call);
        }

    }
    function call(array,index) {
        console.log(index);
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