/**
 * Created by ajain13 on 6/12/2017.
 */
/**
 * Includes content from developer.google.com
 * Refer google code content license.
 * @type {()=>resources}
 */
var googleDrive = require('google-drive')
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();
/**
 * fetch Meta-data of file
 * @param token
 * @param fileId
 * @param callback
 */
exports.getFile=function getFile(token, fileId, callback) {
    googleDrive(token).files(fileId).get(callback)
}
/**
 * List all files in this drive
 * @param token
 * @param callback
 */
exports.listFiles=function listFiles(token, callback) {
    googleDrive(token).files().get(callback)
}
/**
 * Function to get the contents from the file
 * @param downloadUrl Url from where the file contents are to be fetched
 * @param accessToken
 * @param callback
 */
exports.downloadFileContents=function downloadFileContents(downloadUrl,accessToken, callback) {
    if (downloadUrl) {
        //var accessToken = gapi.auth.getToken().access_token;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', downloadUrl);
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        xhr.onload = function() {
            callback(xhr.responseText);
        };
        xhr.onerror = function() {
            callback(null);
        };
        xhr.send();
    } else {
        callback(null);
    }
}
    /*Sample download URL*/
   // let downloadUrl=`https://doc-0o-bs-docs.googleusercontent.com/docs/securesc/kp6mje15q95dehajb6l02gl5a2gk5473/r0bttdoeo9fulrcrmdlvodqr5afn6o85/1497283200000/08480253294976549009/08480253294976549009/0B0j9ugtKqRvzX3l6elR0dUlaTU0?e=download&gd=true`;
    //downloadFile(downloadUrl,token,callback);
