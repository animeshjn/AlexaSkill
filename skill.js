'use strict';
var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({prettyPrint: true, timestamp: true, json: false, stderrLevels: ['error']})
    ]
});

var intentHandlers = {};

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
                response.speechText = 'Unknown intent';
                response.shouldEndSession = true;
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
function onSessionStarted(sessionStartedRequest, session) {
    logger.debug('onSessionStarted requestId=' + sessionStartedRequest.requestId + ', sessionId=' + session.sessionId);
    // add any session init logic here

}

function onSessionEnded(sessionEndedRequest, session) {
    logger.debug('onSessionEnded requestId=' + sessionEndedRequest.requestId + ', sessionId=' + session.sessionId);
    // Add any cleanup logic here

}

function onLaunch(launchRequest, session, response) {
    logger.debug('onLaunch requestId=' + launchRequest.requestId + ', sessionId=' + session.sessionId);

    //response.speechText = 'Welcome msg'
    response.speechText = "Welcome to book reading. You can ask to search your google drive and read books. You can say, list files or read book";
    response.repromptText = "What do you want me to do? You can say read book followed by book name";
    response.shouldEndSession = false;
    response.done();
}

intentHandlers['HelloIntent'] = function (request, session, response, slots) {
    //Intent logic
    response.speechText = "Hello intent has been called";
    response.shouldEndSession = false;
    response.done();
}
intentHandlers['BookIntent'] =
    function (request, session, response, slots) {
//Intent logic
        if(!slots.BookTitle)
        listFiles(response, session);
else {
            response.speechText = "Opening " + slots.BookTitle;
            response.shouldEndSession = true;
            response.done();
        }

    }
intentHandlers['YesIntent'] = function (request, session, response, slots) {
    //Intent logic
    response.speechText = "Yes intent has been called";
    response.shouldEndSession = true;
    response.done();
}
var limit=10;

function listFiles(response, session) {
    var url;
    url = `https://www.googleapis.com/drive/v2/files?access_token=${session.user.accessToken}`;
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
                    if (item[i].mimeType == 'application/pdf') {
                        files[count] = item[i].title;
                        count++;
                    }
                }
                response.speechText += `There are ${count} documents. `;

                if (!(session['attributes'].start)) {
                    session['attributes']['start'] = 0;
                }


                for (var j = session['attributes']['start']; j <files.length ; j++) {
                    if(j>limit)
                        break;
                    response.speechText += files[j] + ", ";
                }
                // files.forEach(function (name) {
                //     response.speechText += name+ ", ";
                // });
                response.speechText += `Which one you would like to open?`;
                response.shouldEndSession = false;
                response.done();

            }
            else {
                response.speechText += `No documents found in your drive`;
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


/** For each intent write a intentHandlers
 Example:
 intentHandlers['HelloIntent'] = function(request,session,response,slots) {
  //Intent logic
  
}
 **/
