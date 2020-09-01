const config = require('config');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(config.get('SENDGRID_API_KEY'));

exports.send = function (from, to, subject, html){

      return sgMail.send({
            from: from,
            to:to,
            subject:subject,
            html:html
      });
};