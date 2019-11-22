/*
 * Nexmo interface defined here
 */

const Nexmo = require('nexmo');

class Text {
  constructor(params) {
    const existingNexmo = Text.findNexmo(params);
    if (existingNexmo) return existingNexmo;

    this.params = params;
    this.nexmo = new Nexmo(params, { debug: true });
    Text.registerNexmo(this);
  }

  static findNexmo(params) {
    return Text.instances.find(({ params: { apiKey, apiSecret, fromNumber } }) => apiKey === params.apiKey && apiSecret === params.apiSecret && fromNumber === params.fromNumber);
  }

  static registerNexmo(text) {
    Text._instances.push(text);
  }

  static get instances() {
    return Text._instances;
  }

  /**
   * Send text messages
   * @param {string} phone - Dest phone number - country code required.
   * @param {string} textBody - Message body.
   * @return Promise resolving Nexmo response.
   */
  send(phone, textBody) {
    return new Promise((resolve, reject) => {

      const cb = (err, data) => {
        if (err) return reject(`Error: ${err.message}`);

        // grab response data
        const { ['message-id']: id, to: number,['error-text']: error } = data.messages[0];

        // send response data
        resolve({
          id,
          number,
          error
        });
      };

      this.nexmo.message.sendSms(
        this.params.fromNumber,
        phone,
        textBody,
        { type: 'unicode' },
        cb
      );
    });

  }

}

// Static property
Text._instances = [];

module.exports = (params) => {
  return new Text(params);
};
