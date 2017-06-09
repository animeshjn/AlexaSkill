'use-strict';

var pdfParse=require('./pdf2textext/pdftotext');

pdfParse.getContentPDF('./Dracula.pdf',callBack);


function callBack(data){
    console.log(data);

}
