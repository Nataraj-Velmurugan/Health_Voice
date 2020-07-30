// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const nodemailer = require("nodemailer");
const AWS = require("aws-sdk");

const data = require('./data/main.json');
const template = require('./templates/main.json');

let awsConfig = {
    "region": "ap-south-1",
    "endpoint": "http://dynamodb.ap-south-1.amazonaws.com",
    "accessKeyId": "AKIAIUIMI7T2Y5UHJ4NA", "secretAccessKey": "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"
};
AWS.config.update(awsConfig);

let docClient = new AWS.DynamoDB.DocumentClient();

let insertDB = async (params) => {
    docClient.put(params, function (err, data) {
        if (err) {
            console.log("users::save::error - " + JSON.stringify(err, null, 2));
        } else {
            console.log("users::save::success" + JSON.stringify(data, null, 2));
        }
    });
}

let updateDB = async (params) => {
    docClient.update(params, function (err, data) {
        if (err) {
            console.log("users::save::error - " + JSON.stringify(err, null, 2));
        } else {
            console.log("users::save::success" + JSON.stringify(data, null, 2));
        }
    });
}

function getMemoryAttributes() {
    const memoryAttributes = {
        "history": [],

        // The remaining attributes will be useful after DynamoDB persistence is configured
        "launchCount": 0,
        "lastUseTimestamp": 0,

        "lastSpeechOutput": {},
        "nextIntent": []

        // "favoriteColor":"",
        // "name":"",
        // "namePronounce":"",
        // "email":"",
        // "mobileNumber":"",
        // "city":"",
        // "state":"",
        // "postcode":"",
        // "birthday":"",
        // "bookmark":0,
        // "wishlist":[],
    };
    return memoryAttributes;
}

function getPreviousIntent(attrs) {
    if (attrs.history && attrs.history.length > 1) {
        return attrs.history[attrs.history.length - 2].IntentRequest;
    } else {
        return false;
    }
}

function getPreviousBeforeIntent(attrs) {
    if (attrs.history && attrs.history.length > 1) {
        return attrs.history[attrs.history.length - 3].IntentRequest;
    } else {
        return false;
    }
}

const maxHistorySize = 20;

// testingu675
// tu@123456

async function main(emailID, data) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: 'testingu675@gmail.com',
            pass: 'tu@123456'
            // user: 'testalexa000@gmail.com',
            // pass: 'ta@123456'
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'testingu675@gmail.com', // sender address
        to: emailID, // list of receivers
        subject: "Repost From Neuro Centre--", // Subject line
        text: data, // plain text body
        html: "<b>" + data + "</b>", // html body
    });

    // console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

const RequestLog = {
    process(handlerInput) {
        console.log("REQUEST ENVELOPE = " + JSON.stringify(handlerInput.requestEnvelope));
        return;
    }
};

const ResponseLog = {
    process(handlerInput) {
        console.log(`RESPONSE = ${JSON.stringify(handlerInput.responseBuilder.getResponse())}`);
    }
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = '<speak> <amazon:emotion name="excited" intensity="high"> Welcome to Health App. </amazon:emotion> <break time="2s"/> Health App works with the mindset to integrate mutliple speciality over a single virtual platform.<break time="1s"/> We provide virtual consultation for the following<break time="1s"/> 1. Neuro. <break time="0.5s"/> 2. Cardiology.<break time="0.5s"/> 3. Inner Healing and yoga.<break time="2s"/> You can select one of the speciality that you would want to try. <break time="2s"/> </speak>';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: template,
                datasources: data
            })
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello World';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const NeuroIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'NeuroIntent';
    },
    async handle(handlerInput) {

        let requestEnvelope = handlerInput.requestEnvelope;
        let name = Alexa.getSlotValue(requestEnvelope, 'name');
        let mobile = Alexa.getSlotValue(requestEnvelope, 'mobile');
        let mail = Alexa.getSlotValue(requestEnvelope, 'email');

        var input = {
            "info_data": "Static",
            "user_name": name,
            "email_id": mail,
            "mobile_no": mobile,
            "sleepTiming": "",
            "officeType": "",
            "painType": "",
            "diseaseType": "",
            "slotBookingTime": "",
            "created_by": "clientUser",
            "created_on": new Date().toString(),
            "updated_by": "clientUser",
            "updated_on": new Date().toString(),
            "is_deleted": false
        };

        var user_data = {
            TableName: "Health_App",
            Item: input
        };

        let saved = await insertDB(user_data);
        console.log(saved);

        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.userData = {
            userName: name,
            userMobile: mobile,
            userEmail: mail,
            sleepTiming: "",
            officeType: "",
            painType: "",
            diseaseType: "",
            slotBookingTime: ""
        }

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        const speakOutput = '<speak> <say-as interpret-as="interjection">bingo</say-as><break time="1s"/>Lets get  <emphasis level="strong"> started!!</emphasis> <break time="3s"/> The Neuro Application is divided into three modules <break time="1s"/>. let me quickly walk you through them before you could start exploring.<break time="2s"/>The Info Block.<break time="1s"/> As the name suggests ,This section gives you access to wide range of information pertaining to mental health and latest hacks associated.<break time="1s"/>. you could also post in your medical queries or clarifications . Yu would be getting a prompt response  from the bestest of the best within 72 hours! <break time="2s"/> Mental stability Check.<break time="1s"/> This section takes you through a very unique way to analyse your mental stability.<break time="1s"/> It validates how much equipoised they are.<break time="1s"/>. This section also gives you unique techniques to strengthen them!<break time="1s"/> <say-as interpret-as="interjection">hmm</say-as>. they say your mind requires its <emphasis level="strong">own</emphasis> kind of a gym!<break time="2s"/> Need for a doc.<break time="1s"/> This section is for patients wanting to meet the doctor.<break time="1s"/> A series a questions are asked for evaluating the patients condition and a prior assesment is made.<break time="1s"/> You can also book the' + "doctor's" + 'Appointment in this section.<break time="1s"/> </speak>';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const WalkthroughBlockIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WalkthroughBlockIntent';
    },
    handle(handlerInput) {

        const speakOutput = '<speak> <say-as interpret-as="interjection">bingo</say-as><break time="1s"/>Lets get  <emphasis level="strong"> started!!</emphasis> <break time="3s"/> The Neuro Application is divided into three modules <break time="1s"/>. let me quickly walk you through them before you could start exploring.<break time="2s"/>The Info Block.<break time="1s"/> As the name suggests ,This section gives you access to wide range of information pertaining to mental health and latest hacks associated.<break time="1s"/>. you could also post in your medical queries or clarifications . Yu would be getting a prompt response  from the bestest of the best within 72 hours! <break time="2s"/> Mental stability Check.<break time="1s"/> This section takes you through a very unique way to analyse your mental stability.<break time="1s"/> It validates how much equipoised they are.<break time="1s"/>. This section also gives you unique techniques to strengthen them!<break time="1s"/> <say-as interpret-as="interjection">hmm</say-as>. they say your mind requires its <emphasis level="strong">own</emphasis> kind of a gym!<break time="2s"/> Need for a doc.<break time="1s"/> This section is for patients wanting to meet the doctor.<break time="1s"/> A series a questions are asked for evaluating the patients condition and a prior assesment is made.<break time="1s"/> You can also book the' + "doctor's" + 'Appointment in this section.<break time="1s"/> </speak>';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const InfoBlockVersionIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'InfoBlockVersionIntent';
    },
    async handle(handlerInput) {

        const { requestEnvelope, responseBuilder } = handlerInput;
        const { intent } = requestEnvelope.request;

        let dynaTrain = Alexa.getSlotValue(requestEnvelope, 'dynaTrain');

        let mail1 = "nitinkarthick.22@gmail.com"
        let mail = 'testalexa000@gmail.com';

        console.log("dynaTrain")
        console.log(dynaTrain)
        console.log(typeof dynaTrain)

        // const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        // sessionAttributes.blockStatus = {
        //     mentalStability: true
        // }
        // handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        let modifiedInfos = "<p>" + "Hi "
            + sessionAttributes.userData.userName +
            "<br>" + "Thanks for contacting Neuro APP." + "<br>" + "<br>" + "your posted question -->" + "<br>" + "<br>" + "<br>" + dynaTrain + "<br>" + "<br>" + "We will be reverting with 72 hours as promised!!." + "<br>" + "<br>" + "Thanks," + "<br> " + "Alexa Neuro APP" + "</p>"

        //main(mail1, modifiedInfos).catch(console.error);

        main(mail1, modifiedInfos).then(() => {
            const speakOutput = '<speak> Thanks for your post.!<break time="0.5s"/> Give us 72 hours and as promised we will get back !<break time="1s"/> Do you want to Try other modules of Neuro App? </speak>';

            return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
        });

    }
};

const InfoTainBlockIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'InfoTainBlockIntent';
    },
    async handle(handlerInput) {

        const { requestEnvelope, responseBuilder } = handlerInput;
        const { intent } = requestEnvelope.request;

        let dynaTrain = Alexa.getSlotValue(requestEnvelope, 'dynaTrain');

        let mail1 = "nitinkarthick.22@gmail.com"
        let mail = 'testalexa000@gmail.com';

        console.log("dynaTrain")
        console.log(dynaTrain)
        console.log(typeof dynaTrain)

        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.blockStatus = {
            mentalStability: true
        }
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        let modifiedInfos = "<p>" + "Hi "
            + sessionAttributes.userData.userName +
            "<br>" + "Thanks for contacting Neuro APP." + "<br>" + "<br>" + "your posted question -->" + "<br>" + "<br>" + "<br>" + dynaTrain + "<br>" + "<br>" + "We will be reverting with 72 hours as promised!!." + "<br>" + "<br>" + "Thanks," + "<br> " + "Alexa Neuro APP" + "</p>"

        // await main(mail1, modifiedInfos).catch(console.error);

        const speakOutput = '<speak> Thanks for your post.!<break time="0.5s"/> Give us 72 hours and as promised we will get back !<break time="1s"/> Do you want to Try other modules of Neuro App? </speak>';

        let say = 'inside'

        // + sessionAttributes.userData.userName +

        return handlerInput.responseBuilder
            .speak(say)
            .reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const ProfessionIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ProfessionIntent';
    },
    handle(handlerInput) {

        // const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        // handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        const { requestEnvelope, responseBuilder } = handlerInput;
        const { intent } = requestEnvelope.request;

        const profession = Alexa.getSlotValue(requestEnvelope, 'profession');
        const sleep_Timing = Alexa.getSlotValue(requestEnvelope, 'distro');

        console.log(profession);
        console.log(sleep_Timing);

        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.user_data.sleepTiming = sleep_Timing;
        sessionAttributes.user_data.officeType = profession;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        let speakOutput = '';

        if (sleep_Timing === "1 to 3 hours") {
            speakOutput = 'time is 1 to 3 hours';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .addDirective({
                    type: 'Dialog.Delegate',
                    updatedIntent: {
                        name: 'TimeOneIntent',
                        confirmationStatus: 'NONE',
                        slots: {}
                    }
                })
                .reprompt(speakOutput)
                .getResponse();

        } else if (sleep_Timing === "3 to 6 hours") {
            speakOutput = 'time is 3 to 6 hours';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .addDirective({
                    type: 'Dialog.Delegate',
                    updatedIntent: {
                        name: 'TimeThreeIntent',
                        confirmationStatus: 'NONE',
                        slots: {}
                    }
                })
                .reprompt(speakOutput)
                .getResponse();

        } else {
            speakOutput = 'time is greater than 6 hours';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .addDirective({
                    type: 'Dialog.Delegate',
                    updatedIntent: {
                        name: 'TimeGreaterIntent',
                        confirmationStatus: 'NONE',
                        slots: {}
                    }
                })
                .reprompt(speakOutput)
                .getResponse();

        }


    }
};

const TimeOneIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TimeOneIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello Time one';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDirective({
                type: 'Dialog.Delegate',
                updatedIntent: {
                    name: 'PainIntent',
                    confirmationStatus: 'NONE',
                    slots: {}
                }
            })
            .reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const TimeThreeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TimeThreeIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'TimeThreeIntent World!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDirective({
                type: 'Dialog.Delegate',
                updatedIntent: {
                    name: 'PainIntent',
                    confirmationStatus: 'NONE',
                    slots: {}
                }
            })
            .reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const TimeGreaterIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TimeGreaterIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Time greater Intent';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDirective({
                type: 'Dialog.Delegate',
                updatedIntent: {
                    name: 'PainIntent',
                    confirmationStatus: 'NONE',
                    slots: {}
                }
            })
            .reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const AlphaIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AlphaIntent';
    },
    handle(handlerInput) {

        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.blockStatus = {
            mentalStability: true
        }
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        const speakOutput = '<speak>Hi nithin.<break time="1s"/>This block walks you through questions to understand your mental stability<break time="1.5s"/> . Through this section we should have a fairly decent idea how stable your mind is and suggest you ways and means to monitor them.<break time="1.5s"/> .Can we proceed?</speak>';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const PainIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PainIntent';
    },
    handle(handlerInput) {
      
        sessionAttributes.blockStatus = {
            anexity: true
        }
        const duraMode = Alexa.getSlotValue(requestEnvelope, 'duraMode');
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.user_data.painType = duraMode;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        
        const speakOutput = 'Hello Pain!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const AnexIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AnexIntent';
    },
    handle(handlerInput) {

      const duraPain = Alexa.getSlotValue(requestEnvelope, 'duraPain');
      let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      sessionAttributes.user_data.diseaseType = duraPain;
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      const speakOutput = 'Hello Anex!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const ResultOneIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ResultOneIntent';
    },
    async handle(handlerInput) {
        const speakOutput = '<speak>You are going through chronic anxiety and its essential to visit the doctor as early as possible<break time="2.5s"/>. You might need to book an appointment with the doctor right away!</speak>';
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let e_mail = sessionAttributes.userData.userEmail;
        let sleepTiming =  sessionAttributes.userData.sleepTiming;
        let officeType= sessionAttributes.userData.officeType;
        let painType= sessionAttributes.userData.painType;
        let diseaseType= sessionAttributes.userData.diseaseType;
        let slotBookingTime= sessionAttributes.userData.slotBookingTime;

        var params = {
            TableName: "Health_App",
            Key: { "email_id": e_mail },
            UpdateExpression: "set updated_by = :byUser, is_deleted = :boolValue, sleepTiming = :sleep_Timing, officeType= :office_Type, painType= :pain_Type, diseaseType = :disease_Type , slotBookingTime = :slotBooking_Time",
            ExpressionAttributeValues: {
              "sleep_Timing":sleepTiming,
              "office_Type":officeType,
              "pain_Type":painType,
              "disease_Type":diseaseType,
              "slotBooking_Time":slotBookingTime,
              ":byUser": "updateUser",
              ":boolValue": true
            },
            ReturnValues: "UPDATED_NEW"
    
        };

        let updated = await updateDB(params);

        console.log(updated);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDirective({
                type: 'Dialog.Delegate',
                updatedIntent: {
                    name: 'BookApointmentIntent',
                    confirmationStatus: 'NONE',
                    slots: {}
                }
            })
            .reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const ResultTwoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ResultTwoIntent';
    },
    handle(handlerInput) {
        const speakOutput = '<speak>Great !! your mental condition seems to be stable. However, if you would want to have some discussion with the doc, you can go ahead and book an appointment!<break time="2.5s"/>would you want to proceed? </speak>';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const DecisionIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DecisionIntent';
    },
    handle(handlerInput) {

        const speakOutput = 'Hello Decision!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const BookApointmentIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'BookApointmentIntent';
    },
    handle(handlerInput) {

        const { requestEnvelope, responseBuilder } = handlerInput;
        const { intent } = requestEnvelope.request;

        let bookingDone = Alexa.getSlotValue(requestEnvelope, 'bookingDone');

        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.user_data.slotBookingTime = bookingDone;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        const speakOutput = 'Okay you have booked the apointment on the following schedule' + bookingDone + 'Thanks for visiting Health Voice app. You can get back to us anytime in future.';


        let mail1 = "nitinkarthick.22@gmail.com"
        let mail = 'testalexa000@gmail.com';

        let modifiedInfos = "<p>" + "Dear" +
            // sessionAttributes.userData.userName + 
            "<br>" + "Your Appointment with Dr Gauthama Das has been confirmed on " + bookingDone + "<br>" + "Kindly be 15 mins before your Appointment with the doctor."
            + "<br>" + "Thanks," + "<br>" +
            + "<br>" + "NeuroApp Clinic" + "</p>"

        main(mail1, modifiedInfos).catch(console.error);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const NoIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NoIntent';
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = '';
        let previousIntent = getPreviousIntent(sessionAttributes);
        let previousBeforeIntent = getPreviousBeforeIntent(sessionAttributes)

        console.log("previousIntent");
        console.log(previousIntent);

        console.log("previousBeforeIntent")
        console.log(previousBeforeIntent)

        if (previousIntent && !handlerInput.requestEnvelope.session.new) {
            say = 'Thanks for visiting the Neuro App nithin. We have other modules which you might want to try. Would you want to navigate to the main page or visit';
        }
        if (sessionAttributes.blockStatus.mentalStability === true && previousIntent === "InfoTainBlockIntent") {
            say = 'Thanks for visiting Health Voice app. You can get back to us anytime in future.';
        }
        if (previousIntent === "ProfessionIntent") {
            sessionAttributes.blockStatus = {
                anexity: false
            }
            const speakOutput = "Hola"
            return responseBuilder
                .speak(speakOutput)
                .addDirective({
                    type: 'Dialog.Delegate',
                    updatedIntent: {
                        name: 'AnexIntent',
                        confirmationStatus: 'NONE',
                        slots: {}
                    }
                })
                .reprompt('try again, ' + speakOutput)
                .getResponse();
            // return ProfessionIntentHandler.handle(handlerInput);
        }
        if (previousIntent === "TimeOneIntent"
            || previousIntent === "TimeThreeIntent"
            || previousIntent === "TimeGreaterIntent") {

            const speakOutput = "Hola Before"
            return responseBuilder
                .speak(speakOutput)
                .addDirective({
                    type: 'Dialog.Delegate',
                    updatedIntent: {
                        name: 'AnexIntent',
                        confirmationStatus: 'NONE',
                        slots: {}
                    }
                })
                .reprompt('try again, ' + speakOutput)
                .getResponse();
        }
        if (previousBeforeIntent === "TimeOneIntent"
            || previousBeforeIntent === "TimeThreeIntent"
            || previousBeforeIntent === "TimeGreaterIntent") {

            const speakOutput = "Hola Before"

            if (previousBeforeIntent === "TimeOneIntent") {
                return ResultOneIntentHandler.handle(handlerInput);
            } else {
                return ResultTwoIntentHandler.handle(handlerInput);
            }
        }
        else {
            say = "Not inside"
        }

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const YesIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let say = '';

        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let previousIntent = getPreviousIntent(sessionAttributes);
        let previousBeforeIntent = getPreviousBeforeIntent(sessionAttributes)

        if (previousIntent && !handlerInput.requestEnvelope.session.new) {
            say += 'Your last intent was ' + previousIntent + '. ';
        }

        console.log("previousIntent");
        console.log(previousIntent);
        console.log("previousBeforeIntent");
        console.log(previousBeforeIntent);

        if (sessionAttributes.blockStatus.mentalStability === true && previousIntent === "InfoTainBlockIntent") {
            sessionAttributes.blockStatus = {
                mentalStability: false
            }
            return WalkthroughBlockIntentHandler.handle(handlerInput);
        }
        if (sessionAttributes.blockStatus.mentalStability === true) {
            sessionAttributes.blockStatus = {
                mentalStability: false
            }

            const speakOutput = "Super"
            return responseBuilder
                .speak(speakOutput)
                .addDirective({
                    type: 'Dialog.Delegate',
                    updatedIntent: {
                        name: 'ProfessionIntent',
                        confirmationStatus: 'NONE',
                        slots: {}
                    }
                })
                .reprompt('try again, ' + speakOutput)
                .getResponse();

            // return ProfessionIntentHandler.handle(handlerInput);
        }
        if (previousIntent === "ProfessionIntent") {
            sessionAttributes.blockStatus = {
                anexity: false
            }
            const speakOutput = "Hola"
            return responseBuilder
                .speak(speakOutput)
                .addDirective({
                    type: 'Dialog.Delegate',
                    updatedIntent: {
                        name: 'AnexIntent',
                        confirmationStatus: 'NONE',
                        slots: {}
                    }
                })
                .reprompt('try again, ' + speakOutput)
                .getResponse();
            // return ProfessionIntentHandler.handle(handlerInput);
        }
        if (previousIntent === "TimeOneIntent"
            || previousIntent === "TimeThreeIntent"
            || previousIntent === "TimeGreaterIntent") {

            const speakOutput = "Hola Before"
            return responseBuilder
                .speak(speakOutput)
                .addDirective({
                    type: 'Dialog.Delegate',
                    updatedIntent: {
                        name: 'AnexIntent',
                        confirmationStatus: 'NONE',
                        slots: {}
                    }
                })
                .reprompt('try again, ' + speakOutput)
                .getResponse();
        }
        if (previousBeforeIntent === "TimeOneIntent"
            || previousBeforeIntent === "TimeThreeIntent"
            || previousBeforeIntent === "TimeGreaterIntent") {

            const speakOutput = "Hola Before"

            if (previousBeforeIntent === "TimeOneIntent") {
                return ResultOneIntentHandler.handle(handlerInput);
            } else {
                return ResultTwoIntentHandler.handle(handlerInput);
            }
        }
        else {
            const speakOutput = 'alphabet';
            return responseBuilder
                .speak(speakOutput)
                .reprompt('try again, ' + speakOutput)
                .getResponse();
        }
    },
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'QuitIntent');
    },
    handle(handlerInput) {

        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes = {}
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        const speakOutput = 'Thanks for visiting Health Voice app. You can get back to us anytime in future.!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.

        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        sessionAttributes.userData = {}

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const InitMemoryAttributesInterceptor = {
    process(handlerInput) {
        let sessionAttributes = {};
        if (handlerInput.requestEnvelope.session['new']) {

            sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

            let memoryAttributes = getMemoryAttributes();

            if (Object.keys(sessionAttributes).length === 0) {

                Object.keys(memoryAttributes).forEach(function (key) {

                    // initialize all attributes from global list 

                    sessionAttributes[key] = memoryAttributes[key];

                });

            }
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);


        }
    }
};

const RequestHistoryInterceptor = {
    process(handlerInput) {

        const thisRequest = handlerInput.requestEnvelope.request;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let history = sessionAttributes['history'] || [];

        let IntentRequest = {};
        if (thisRequest.type === 'IntentRequest') {

            let slots = [];

            IntentRequest = {
                'IntentRequest': thisRequest.intent.name
            };

            if (thisRequest.intent.slots) {

                for (let slot in thisRequest.intent.slots) {
                    let slotObj = {};
                    slotObj[slot] = thisRequest.intent.slots[slot].value;
                    slots.push(slotObj);
                }

                IntentRequest = {
                    'IntentRequest': thisRequest.intent.name,
                    'slots': slots
                };

            }

        } else {
            IntentRequest = { 'IntentRequest': thisRequest.type };
        }
        if (history.length > maxHistorySize - 1) {
            history.shift();
        }
        history.push(IntentRequest);

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    }

};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        NeuroIntentHandler,
        WalkthroughBlockIntentHandler,
        InfoBlockVersionIntentHandler,
        InfoTainBlockIntentHandler,
        ProfessionIntentHandler,
        TimeOneIntentHandler,
        TimeThreeIntentHandler,
        TimeGreaterIntentHandler,
        AlphaIntentHandler,
        PainIntentHandler,
        DecisionIntentHandler,
        AnexIntentHandler,
        ResultOneIntentHandler,
        ResultTwoIntentHandler,
        BookApointmentIntentHandler,
        HelpIntentHandler,
        NoIntentHandler,
        YesIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler,
        // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(InitMemoryAttributesInterceptor)
    .addRequestInterceptors(RequestHistoryInterceptor)
    .addRequestInterceptors(RequestLog)
    .addResponseInterceptors(ResponseLog)
    .lambda();



    // arn:aws:lambda:us-east-1:605561328681:function:d7714bbf-8f9f-493e-97fa-56d884ce60f4:Release_0