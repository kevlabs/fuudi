/*
 * Twilio interface defined here
 */

const Twilio = require('twilio');

class Text {
  constructor(params) {
    const existingTwilio = Text.findTwilio(params);
    if (existingTwilio) return existingTwilio;

    const { accountSid, authToken } = params;

    this.params = params;
    this.twilio = new Twilio(accountSid, authToken);
    Text.registerTwilio(this);
  }

  static findTwilio(params) {
    return Text.instances.find(({ params: { accountSid, authToken, fromNumber } }) => accountSid === params.accountSid && authToken === params.authToken && fromNumber === params.fromNumber);
  }

  static registerTwilio(text) {
    Text._instances.push(text);
  }

  static get instances() {
    return Text._instances;
  }

  /**
   * Send text messages
   * @param {string} phone - Dest phone number - country code required.
   * @param {string} textBody - Message body.
   * @return Promise resolving Twilio response.
   */
  send(phone, textBody) {

    return this.twilio.messages.create({
      from: this.params.fromNumber,
      to: phone,
      body: textBody
    })
      .then(message => ({
        id: message['messaging_service_sid'],
        number: message.to,
        error: message['error_message']
      }));

  }

}

// Static property
Text._instances = [];

module.exports = (params) => {
  return new Text(params);
};
