'use strict';
var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({prettyPrint: true, timestamp: true, json: false, stderrLevels: ['error']})
    ]
});

var intentHandlers = {};
var speeds = {1: "\'x-slow\'", 2: "\'slow\'", 3: "\'medium\'", 4: "\'fast\'", 5: "\'x-fast\'"};
var s = 3;

if (process.env.NODE_DEBUG_EN) {
    logger.level = 'debug';
}


exports.handler = function (event, context) {
    try {
        logger.info('event.session.application.applicationId=' + event.session.application.applicationId);
        if (APP_ID !== '' && event.session.application.applicationId !== APP_ID) {
            context.fail('Invalid Application ID');
        }
        if (!event.session.attributes) {
            event.session.attributes = {};
        }
        logger.debug('Incoming request:\n', JSON.stringify(event, null, 2));
        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }
        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request, event.session, new Response(context, event.session));
        } else if (event.request.type === 'IntentRequest') {
            var response = new Response(context, event.session);
            if (event.request.intent.name in intentHandlers) {
                intentHandlers[event.request.intent.name](event.request, event.session, response, getSlots(event.request));
            } else {
                response.speechText = 'I am sorry, I did not get it.';
                response.shouldEndSession = false;
                response.done();
            }
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail('Exception: ' + getError(e));
    }
};

function getSlots(req) {
    var slots = {}
    for (var key in req.intent.slots) {
        slots[key] = req.intent.slots[key].value;
    }
    return slots;
}

var Response = function (context, session) {
    this.speechText = '';
    this.shouldEndSession = true;
    this.ssmlEn = true;
    this._context = context;
    this._session = session;

    this.done = function (options) {

        if (options && options.speechText) {
            this.speechText = options.speechText;
        }

        if (options && options.repromptText) {
            this.repromptText = options.repromptText;
        }

        if (options && options.ssmlEn) {
            this.ssmlEn = options.ssmlEn;
        }

        if (options && options.shouldEndSession) {
            this.shouldEndSession = options.shouldEndSession;
        }

        this._context.succeed(buildAlexaResponse(this));
    }

    this.fail = function (msg) {
        logger.error(msg);
        this._context.fail(msg);
    }

};

function createSpeechObject(text, ssmlEn) {
    if (ssmlEn) {
        return {
            type: 'SSML',
            ssml: '<speak>' + text + '</speak>'
        }
    } else {
        return {
            type: 'PlainText',
            text: text
        }
    }
}

function buildAlexaResponse(response) {
    var alexaResponse = {
        version: '1.0',
        response: {
            outputSpeech: createSpeechObject(response.speechText, response.ssmlEn),
            shouldEndSession: response.shouldEndSession
        }
    };

    if (response.repromptText) {
        alexaResponse.response.reprompt = {
            outputSpeech: createSpeechObject(response.repromptText, response.ssmlEn)
        };
    }

    if (response.cardTitle) {
        alexaResponse.response.card = {
            type: 'Simple',
            title: response.cardTitle
        };

        if (response.imageUrl) {
            alexaResponse.response.card.type = 'Standard';
            alexaResponse.response.card.text = response.cardContent;
            alexaResponse.response.card.image = {
                smallImageUrl: response.imageUrl,
                largeImageUrl: response.imageUrl
            };
        } else {
            alexaResponse.response.card.content = response.cardContent;
        }
    }

    if (!response.shouldEndSession && response._session && response._session.attributes) {
        alexaResponse.sessionAttributes = response._session.attributes;
    }
    logger.debug('Final response:\n', JSON.stringify(alexaResponse, null, 2), '\n\n');
    return alexaResponse;
}

function getError(err) {
    var msg = '';
    if (typeof err === 'object') {
        if (err.message) {
            msg = ': Message : ' + err.message;
        }
        if (err.stack) {
            msg += '\nStacktrace:';
            msg += '\n====================\n';
            msg += err.stack;
        }
    } else {
        msg = err;
        msg += ' - This error is not object';
    }
    return msg;
}


//--------------------------------------------- Skill specific logic starts here -----------------------------------------

//Add your skill application ID from amazon devloper portal
var APP_ID = 'amzn1.ask.skill.54e41ede-5be5-4ad1-aefe-45aafb687c56';
var https = require('https');
var Promise = require('bluebird');
//var l=require('./list-files-response-function.js')
var MAX_READ_FILES = 5;
var MAX_FILES = 20;
var LINES = 8;
function onSessionStarted(sessionStartedRequest, session) {
    logger.debug('onSessionStarted requestId=' + sessionStartedRequest.requestId + ', sessionId=' + session.sessionId);
}

function onSessionEnded(sessionEndedRequest, session) {
    logger.debug('onSessionEnded requestId=' + sessionEndedRequest.requestId + ', sessionId=' + session.sessionId);
    // if(!(session.attributes.end)){
    //    saveSessionToDb
    // }
}

function onLaunch(launchRequest, session, response) {
    logger.debug('onLaunch requestId=' + launchRequest.requestId + ', sessionId=' + session.sessionId);
    //response.speechText = 'Welcome msg'
    response.speechText = "Welcome to book reading. You can ask to search your google drive and read books. You can say, list files or read book. Say, Help, for more. ";
    response.repromptText = "What do you want me to do? You can say read book followed by book name";
    response.shouldEndSession = false;
    response.done();
}


intentHandlers['TestIntent'] = function (request, session, response, slots) {
    response.speechText += "";
    response.done();
}
intentHandlers['AMAZON.StopIntent'] = function (request, session, response, slots) {
    //saveSession(session);
    response.speechText += "Ok."
    response.done();
}
intentHandlers['ContinueIntent'] = function (request, session, response, slots) {
    if (session.attributes.currentTitle) {
        var bookTitle = session.attributes.currentTitle;
        if (session.attributes.speed) {
            s = session.attributes.speed;
        }
        else {
            session.attributes.speed = s;
        }
        session.attributes.speed = s;
        var speedValue = speeds[s];
        readBookByName(request, response, session, bookTitle,speedValue);

    }
    else {
        response.speechText += "Which book you want me to open? Say: Open, followed by the book name";
        response.shouldEndSession = false;
        response.done();
    }
}
intentHandlers['AMAZON.HelpIntent'] = function (request, session, response, slots) {
    response.speechText += "To list all files, say: list files. ";
    response.speechText += "To Read a book say; Read, followed by the book name, for example: Open Dracula or Read Harry potter. ";
    response.speechText += "To go to next page, you can interrupt and say next page. ";
    response.speechText += "To go to a certain page, say, go to, or jump to, followed by the page number. ";
    response.speechText += "To go to a certain chapter, say, go to, or jump to, followed by the chapter number. ";
    response.speechText += "If you want me to read slower, say, read slower. ";
    response.speechText += "If you want me to read faster, say, read faster. ";
    response.speechText += `Your books should be in the accessible format provided by <say-as interpret-as="spell-out">AIMVA</say-as>. `;
    response.speechText += "What do you want me to do?";
    response.shouldEndSession = false;
    response.done();
}
intentHandlers['PreviousPageIntent'] = function (request, session, response, slots) {
    if (session.attributes.currentTitle) {
        var bookTitle = session.attributes.currentTitle;
        session.attributes.currentLine -= LINES * 2;
        response.shouldEndSession = false;
        readBookByName(request, response, session, bookTitle);
    }

    else {
        var db = require('bookReadAnimesh/DynamoInterface');
        db.read(session.user.userId, callback);
    }
    function callback(value) {

        if (value.Item) {
            console.log('session retrieved from db');
            var accessTokenHold = session.user.accessToken;

            session.attributes = value.Item.session;
            if (session._session) {
                session = session._session;
            }
            //session.user.accessToken=accessTokenHold;
            if (session.attributes.currentTitle) {
                var bookTitle = session.attributes.currentTitle;
                session.attributes.currentLine -= LINES * 2;
                response.shouldEndSession = false;
                if (session.attributes.speed) {
                    s = session.attributes.speed;
                }
                else {
                    session.attributes.speed = s;
                }
                session.attributes.speed = s;
                var speedValue = speeds[s];
                readBookByName(request, response, session, bookTitle,speedValue);
            }

        } else {
            response.speechText += "Which book you want me to open? Say: Open, followed by the book name";
            response.repromptText = "Which book you want me to open? Say: Open, followed by the book name";
            response.shouldEndSession = false;
            response.done();
        }
    }
}
intentHandlers['SkipPageIntent'] = function (request, session, response, slots) {

    if (session.attributes.currentTitle) {
        var bookTitle = session.attributes.currentTitle;
        session.attributes.currentLine += LINES;
        response.shouldEndSession = false;
        if (session.attributes.speed) {
            s = session.attributes.speed;
        }
        else {
            session.attributes.speed = s;
        }
        session.attributes.speed = s;
        var speedValue = speeds[s];
        readBookByName(request, response, session, bookTitle,speedValue);
    }

    else {
        var db = require('bookReadAnimesh/DynamoInterface');
        db.read(session.user.userId, callback);
    }
    function callback(value) {

        if (value.Item) {
            console.log('session retrieved from db');
            var accessTokenHold = session.user.accessToken;
            session.attributes = value.Item.session;
            if (session._session) {
                session = session._session;
            }
            //session.user.accessToken=accessTokenHold;
            if (session.attributes.currentTitle) {
                var bookTitle = session.attributes.currentTitle;
                session.attributes.currentLine += LINES;
                response.shouldEndSession = false;
                if (session.attributes.speed) {
                    s = session.attributes.speed;
                }
                else {
                    session.attributes.speed = s;
                }
                session.attributes.speed = s;
                var speedValue = speeds[s];
                readBookByName(request, response, session, bookTitle,speedValue);
            }

        } else {
            response.speechText += "Which book you want me to open? Say: Open, followed by the book name";
            response.repromptText = "Which book you want me to open? Say: Open, followed by the book name or Say, help ";
            response.shouldEndSession = false;
            response.done();
        }
    }
}
intentHandlers['BookIntent'] = function (request, session, response, slots) {
//Intent logic
    var db = require('bookReadAnimesh/DynamoInterface');
    if (!slots.BookTitle) {
        session = resetSession(session);
        listFiles(response, session);
    }
    else {
        response.speechText += "Opening " + slots.BookTitle + ". At any time you can say, Skip Page to Skip current page. ";
        //response.speechText += "At any time you can say; skip page, to skip current page and go to next. "
        session.attributes.currentTitle = slots.BookTitle;
        response.shouldEndSession = false;
        db.create(session.user.userId, session.attributes, callback);
        //Session from db false
        // response.shouldEndSession = true;
        // response.done();
    }

    function callback(data) {
        if (session.attributes.speed) {
            s = session.attributes.speed;
        }
        else {
            session.attributes.speed = s;
        }
        session.attributes.speed = s;
        var speedValue = speeds[s];
        readBookByName(request, response, session, slots.BookTitle,speedValue);
    }
}
intentHandlers['YesIntent'] = function (request, session, response, slots) {
    //Intent logic
    var db = require('bookReadAnimesh/DynamoInterface');
    db.create(session.user.userId, session.attributes, callback);
    function callback(data) {
        response.shouldEndSession = false;
        response.done();
    }
}
intentHandlers['SpecificPageIntent'] = function (request, session, response, slots) {
    var pageNumber = slots.pageNumber;
    var currentLine = 0;
    if (pageNumber) {
        currentLine = pageNumber * LINES;
        if (session.attributes.currentTitle) {
            var bookTitle = session.attributes.currentTitle;
            session.attributes.currentLine = currentLine;
            response.shouldEndSession = false;
            if (session.attributes.speed) {
                s = session.attributes.speed;
            }
            else {
                session.attributes.speed = s;
            }
            session.attributes.speed = s;
            var speedValue = speeds[s];
            readBookByName(request, response, session, bookTitle,speedValue);
        }

        else {
            var db = require('bookReadAnimesh/DynamoInterface');
            db.read(session.user.userId, callback);
        }
    } else {
        response.speechText += "Which book you want me to open? Say: Open, followed by the book name";
        response.repromptText = "Which book you want me to open? Say: Open, followed by the book name";
        response.shouldEndSession = false;
        response.done();
    }


    function callback(value) {

        if (value.Item) {
            console.log('session retrieved from db');
            var accessTokenHold = session.user.accessToken;
            session.attributes = value.Item.session;
            if (session._session) {
                session = session._session;
            }
            //   session.user.accessToken=accessTokenHold;
            if (session.attributes.currentTitle) {
                var bookTitle = session.attributes.currentTitle;
                session.attributes.currentLine = currentLine;
                response.shouldEndSession = false;
                if (session.attributes.speed) {
                    s = session.attributes.speed;
                }
                else {
                    session.attributes.speed = s;
                }
                session.attributes.speed = s;
                var speedValue = speeds[s];
                readBookByName(request, response, session, bookTitle,speedValue);
            }

        } else {
            response.speechText += "Which book you want me to open? Say: Open, followed by the book name";
            response.repromptText = "Which book you want me to open? Say: Open, followed by the book name";
            response.shouldEndSession = false;
            response.done();
        }
    }
}

intentHandlers['MoreIntent'] = function (request, session, response, slots) {
    //Intent logic
    session.attributes.more = true;
    listFiles(response, session);
}
intentHandlers['ChapterIntent'] = function (request, session, response, slots) {

    if (session.attributes.currentTitle) {
        if (slots.chapterNumber) {
            if (session.attributes.speed) {
                s = session.attributes.speed;
            }
            else {
                session.attributes.speed = s;
            }
            session.attributes.speed = s;
            var speedValue = speeds[s];
            readFromChapter(slots.chapterNumber, session.attributes.currentTitle, request, session, response, speedValue);
        }
        else {
            response.speechText = "Which chapter you want me to open? Say, go to chapter followed by the chapter number";
            response.repromptText = "Which chapter you want me to open? Say, go to chapter followed by the chapter number";
            response.shouldEndSession = false;
            response.done();
        }
    }
    else {
        response.speechText = "Which book do you want me to open? Say, Open, followed by the book name";
        response.repromptText = "Which book do you want me to open? Say, Open, followed by the book name";
        response.shouldEndSession = false;
        response.done();
    }
}
intentHandlers['SlowerIntent'] = function (request, session, response, slots) {
    if (session.attributes.currentTitle) {
        var bookTitle = session.attributes.currentTitle;
        if (session.attributes.speed) {
            s = session.attributes.speed;
        }
        else {
            session.attributes.speed = s;
        }
        if(s>1)
        s--;
        session.attributes.speed = s;
        var speedValue = speeds[s];
        response.speechText+=`<prosody rate=${speedValue}>Reading at ${speedValue} speed. </prosody>`;
        readBookByName(request, response, session, bookTitle, speedValue);
    }
    else {
        response.speechText += "Which book you want me to open? Say: Open, followed by the book name";
        response.shouldEndSession = false;
        response.done();
    }
}
intentHandlers['FasterIntent'] = function (request, session, response, slots) {
    if (session.attributes.currentTitle) {
        var bookTitle = session.attributes.currentTitle;
        if (session.attributes.speed) {
            s = session.attributes.speed;
        }
        else {
            session.attributes.speed = s;
        }
        if(s<5)
            s++;
        session.attributes.speed = s;
        var speedValue = speeds[s];
        response.speechText+=`<prosody rate=${speedValue}>Reading at ${speedValue} speed. </prosody>`;
        readBookByName(request, response, session, bookTitle, speedValue);
    }
    else {
        response.speechText += "Which book you want me to open? Say: Open, followed by the book name";
        response.shouldEndSession = false;
        response.done();
    }
}
intentHandlers['SkipMultipleIntent'] = function (request, session, response, slots) {
    var lineNum = 1;
    var currentPageNumber = 1;
    var skips = 0;
    var pageNumber;
    if (session.attributes.currentTitle) {
        if (session.attributes.currentLine) {
            lineNum = session.attributes.currentLine;
            currentPageNumber = Math.ceil(lineNum / LINES);
        }

        if (slots.pageValue) {
            skips = slots.pageValue;
            pageNumber = skips + currentPageNumber;
            //go to pageNumber
            lineNum = pageNumber * LINES;
            var bookTitle = session.attributes.currentTitle;
            session.attributes.currentLine = lineNum;
            response.shouldEndSession = false;
            if (session.attributes.speed) {
                s = session.attributes.speed;
            }
            else {
                session.attributes.speed = s;
            }

            session.attributes.speed = s;
            var speedValue = speeds[s];
            readBookByName(request, response, session, bookTitle,speedValue);
        }
        else {
            response.speechText += "Which page do you want me to navigate? say go to page followed by the page number";
            response.repromptText = "Which page do you want me to navigate? say go to page followed by the page number";
            response.shouldEndSession = false;
            response.done();
        }

    }
    else {
        var db = require('bookReadAnimesh/DynamoInterface');
        db.read(session.user.userId, callback);
    }
    function callback(value) {

        if (value.Item) {
            console.log('session retrieved from db');
            var accessTokenHold = session.user.accessToken;

            session.attributes = value.Item.session;
            if (session._session) {
                session = session._session;
            }
            //   session.user.accessToken=accessTokenHold;
            if (session.attributes.currentTitle) {
                var bookTitle = session.attributes.currentTitle;
                session.attributes.currentLine = lineNum;
                response.shouldEndSession = false;
                readBookByName(request, response, session, bookTitle);
            }

        } else {
            response.speechText += "Which book you want me to open? Say: Open, followed by the book name";
            response.repromptText = "Which book you want me to open? Say: Open, followed by the book name";
            response.shouldEndSession = false;
            response.done();
        }
    }


}

intentHandlers['SkipParagraph'] = function (request, session, response, slots) {
    var lineNum = 1;
    var currentPageNumber = 1;
    var skips = 0;
    var pageNumber;
    if (session.attributes.currentTitle) {
        if (session.attributes.currentLine) {
            lineNum = session.attributes.currentLine;
            currentPageNumber = Math.ceil(lineNum / LINES);
        }
            //skip few pages
            lineNum += 4;
            var bookTitle = session.attributes.currentTitle;
            session.attributes.currentLine = lineNum;
            response.shouldEndSession = false;
            if (session.attributes.speed) {
                s = session.attributes.speed;
            }
            else {
                session.attributes.speed = s;
            }

            session.attributes.speed = s;
            var speedValue = speeds[s];
            readBookByName(request, response, session, bookTitle,speedValue);



    }
    else {
        var db = require('bookReadAnimesh/DynamoInterface');
        db.read(session.user.userId, callback);
    }
    function callback(value) {

        if (value.Item) {
            console.log('session retrieved from db');
            var accessTokenHold = session.user.accessToken;

            session.attributes = value.Item.session;
            if (session._session) {
                session = session._session;
            }
            //   session.user.accessToken=accessTokenHold;
            if (session.attributes.currentTitle) {
                var bookTitle = session.attributes.currentTitle;
                session.attributes.currentLine = lineNum;
                response.shouldEndSession = false;
                readBookByName(request, response, session, bookTitle);
            }

        } else {
            response.speechText += "Which book you want me to open? Say: Open, followed by the book name";
            response.repromptText = "Which book you want me to open? Say: Open, followed by the book name";
            response.shouldEndSession = false;
            response.done();
        }
    }


}

intentHandlers['RepeatParagraph'] = function (request, session, response, slots) {
    var lineNum = 1;
    var currentPageNumber = 1;
    var skips = 0;
    var pageNumber;
    if (session.attributes.currentTitle) {
        if (session.attributes.currentLine) {
            lineNum = session.attributes.currentLine;
            currentPageNumber = Math.ceil(lineNum / LINES);
        }
        //skip few pages
        lineNum -= 4;
        var bookTitle = session.attributes.currentTitle;
        session.attributes.currentLine = lineNum;
        response.shouldEndSession = false;
        if (session.attributes.speed) {
            s = session.attributes.speed;
        }
        else {
            session.attributes.speed = s;
        }

        session.attributes.speed = s;
        var speedValue = speeds[s];
        readBookByName(request, response, session, bookTitle,speedValue);



    }
    else {
        var db = require('bookReadAnimesh/DynamoInterface');
        db.read(session.user.userId, callback);
    }
    function callback(value) {

        if (value.Item) {
            console.log('session retrieved from db');
            var accessTokenHold = session.user.accessToken;

            session.attributes = value.Item.session;
            if (session._session) {
                session = session._session;
            }
            //   session.user.accessToken=accessTokenHold;
            if (session.attributes.currentTitle) {
                var bookTitle = session.attributes.currentTitle;
                session.attributes.currentLine = lineNum;
                response.shouldEndSession = false;
                readBookByName(request, response, session, bookTitle);
            }

        } else {
            response.speechText += "Which book you want me to open? Say: Open, followed by the book name";
            response.repromptText = "Which book you want me to open? Say: Open, followed by the book name";
            response.shouldEndSession = false;
            response.done();
        }
    }


}
var limit = 5;

function listFiles(response, session) {
    var url;
    if (!(session.user.accessToken)) {
        response.speechText = "Seems like your Google Account is not linked properly, please go to; your skills, and Link account in your alexa app."
        response.shouldEndSession = true;
        response.done();
    }
    url = `https://www.googleapis.com/drive/v2/files?access_token=${session.user.accessToken}&q=mimeType+%3d+%27text%2Fplain%27`;
    logger.debug(url);

    https.get(url, function (res) {
        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function () {
            var result = JSON.parse(body);
            var files = [];
            // response.speechText=`Result not available`;
            // response.shouldEndSession=true;
            // response.done();
            if (result) {
                var item;
                if (result['items']) {
                    item = result['items'];
                }
                else
                    response = result;
                var count = 0;
                for (var i = 0, len = item.length; i < len; i++) {
                    //if (item[i].mimeType == 'application/pdf') {
                    files[count] = item[i].title;
                    count++;

                    //}
                }
                if (!(session['attributes'].more)) {
                    response.speechText += `There are ${count} documents. First ${limit} documents are: `;
                }
                else if ((session['attributes'].more = true)) {
                    response.speechText += `Following are next ${limit} documents. `;
                }
                else {

                    response.shouldEndSession = false;
                    response.done();
                }


                if (!(session['attributes'].start)) {
                    session['attributes']['start'] = 0;
                }
                if (!(session['attributes'].searchResults)) {
                    session['attributes']['searchResults'] = files;
                }

                var j = 0;
                for (j = session['attributes']['start']; j < files.length; j++) {
                    if (j > limit + session['attributes']['start'])
                        break;
                    var name = files[j];
                    name = name.replace(/\.[^/.]+$/, "");
                    response.speechText += name + ", ";
                }
                session['attributes']['start'] = j;

                // files.forEach(function (name) {
                //     response.speechText += name+ ", ";
                // });
                response.speechText += `Which one you would like to open? you can say; More, to hear next ${limit} documents.`;
                response.shouldEndSession = false;
                response.done();

            }
            else {
                response.speechText += ` No documents found in your drive`;
                response.shouldEndSession = true;
                response.done();
            }


        });

    }).on('error', function (e) {
        //response.fail(e);
        response.speechText += e;
        response.shouldEndSession = true;
        response.done();
    });

}

function readBookByName(request, response, session, booktitle, speed) {
    var bookReader = require('bookReadAnimesh/bookReader');
    bookReader.readWholeBook(session.user.accessToken, booktitle, request, response, session, ".txt", callback, speed);
    function callback(sessionMod) {
        var db = require('bookReadAnimesh/DynamoInterface');
        db.create(session.user.userId, session.attributes, call);
    }

    function call(data) {
        console.log('session saved? :' + data);
    }
}
function readFromChapter(chapterNumber, bookTitle, request, session, response, speed) {
    var bookReader = require('bookReadAnimesh/bookReader');
    bookReader.readFromChapter(chapterNumber, session.user.accessToken, bookTitle, request, response, session, ".txt", callback, speed);
    function callback(sessionMod) {
        var db = require('bookReadAnimesh/DynamoInterface');
        db.create(session.user.userId, session.attributes, call);
    }

    function call(data) {
        console.log('session saved? :' + data);
    }
}

function readFilesFromIds(files, response, session) {
    logger.debug(files);
    var promises = files.map(function (filef) {
        return new Promise(function (resolve, reject) {

            getFileFromId(filef.id, session.user.accessToken, function (res, err) {
                var title = res.title.value;
                filef.result = {
                    title: res.title,
                    url: res.downloadUrl
                };
                resolve();
            });

        });
    });

    promises.all(promises).then(function () {
        files.forEach(function (filef, idx) {
            response.speechText += `<say-as interpret-as="ordinal">${idx + 1}</say-as> Files found with name ${filef.result.title}`
        });
        response.shouldEndSession = true;
        if (session.attributes.offset && session.attributes.offset > 0) {
            response.speechText += "Do you want to continue? ";
            response.repromptText = " You can say yes or stop. ";
            response.shouldEndSession = false;
        }
        response.done();
    }).catch(function (err) {
        response.speechText += err;
        response.done();
        //response.fail(err);
    });
}

function getFileFromID(fileId, token, callback) {
    var url = `https://www.googleapis.com/drive/v2/files/${fileId}?access_token=${token}`;
    https.get(url, function (res) {
        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            logger.debug(body);
            var result = JSON.parse(body);
            callback(result);
        });

    }).on('error', function (e) {
        logger.error("Error Caught: " + e);
        callback('', err);
    });


}

function resetSession(session) {
    session.attributes.more = false;
    session.attributes.start = 0;
    session.attributes.searchResults = {};
    return session;
}


/** For each intent write a intentHandlers
 Example:
 intentHandlers['HelloIntent'] = function(request,session,response,slots) {
  //Intent logic

}
 **/
