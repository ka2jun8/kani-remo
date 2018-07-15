"use strict";
var Alexa = require("alexa-sdk");

// for nature-remo
const rp = require("request-promise");
const NATURE_REMO_BASE_API = "https://api.nature.global/1";
const API_URL_DEVICES = "/devices/";
const API_URL_APPLIANCES = "/appliances/";
const DEVICE_ID = process.env.DEVICE_ID;
const TEMP_API = "/temperature_offset";
const AIRCON_ID = process.env.AIRCON_ID;
const AIRCON_SETTINGS = "/aircon_settings";
const token = process.env.token;

var APP_ID = process.env.APP_ID;
var HELP_MESSAGE = "温度をおしえて、エアコンつけて、などと言ってください。";
var HELP_REPROMPT = "どうしますか？";
var STOP_MESSAGE = "さようなら";

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.appId = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};

var handlers = {
  MyTempIntent: function() {
    rp({
      method: "POST",
      uri: `${NATURE_REMO_BASE_API}${API_URL_DEVICES}${DEVICE_ID}${TEMP_API}`,
      headers: {
        Authorization: `Bearer ${token}`
      },
      form: {
        offset: 0
      },
      json: true
    })
      .then(res => {
        const tempValue = res.newest_events.te.val;
        this.emit(":tell", "部屋の温度は" + tempValue + "度です.");
      })
      .catch(err => {
        console.error(err);
      });
  },
  MyAirConStart: function() {
    rp({
      method: "POST",
      uri: `${NATURE_REMO_BASE_API}${API_URL_APPLIANCES}${AIRCON_ID}${AIRCON_SETTINGS}`,
      headers: {
        Authorization: `Bearer ${token}`
      },
      form: {
        temperature: 28
      },
      json: true
    })
      .then(() => {
        this.emit(":tell", "つけまちた");
      })
      .catch(err => {
        console.error(err);
      });
  },
  MyAirConStop: function() {
    rp({
      method: "POST",
      uri: `${NATURE_REMO_BASE_API}${API_URL_APPLIANCES}${AIRCON_ID}${AIRCON_SETTINGS}`,
      headers: {
        Authorization: `Bearer ${token}`
      },
      form: {
        button: null
      },
      json: true
    })
      .then(() => {
        this.emit(":tell", "あい");
      })
      .catch(err => {
        console.error(err);
      });
  },
  LaunchRequest: function() {
    this.emit("HelpIntent");
  },
  "AMAZON.HelpIntent": function() {
    var speechOutput = HELP_MESSAGE;
    var reprompt = HELP_REPROMPT;
    this.emit(":ask", speechOutput, reprompt);
  },
  "AMAZON.CancelIntent": function() {
    this.emit(":tell", STOP_MESSAGE);
  },
  "AMAZON.StopIntent": function() {
    this.emit(":tell", STOP_MESSAGE);
  },
  SessionEndedRequest: function() {
    // Nothing to do
  }
};
