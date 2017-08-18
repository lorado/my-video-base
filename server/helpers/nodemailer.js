const debug = require('debug')('nodemailer');
const nodemailer = require('nodemailer');

let transporter;

switch (process.env.MAILER_TRANSPORT) {
    case 'sendmail':
        transporter = nodemailer.createTransport({
            sendmail: true,
            newline: 'unix',
            path: '/usr/sbin/sendmail'
        });
        break;
    default:
        transporter = nodemailer.createTransport({
            streamTransport: true,
            newline: 'unix',
            buffer: true
        });
        break;
}


const NodeMailer = {
    send: (mail, callback) => {
        transporter.sendMail(
            mail,
            (error, info) => {
                if (typeof callback === 'function') {
                    callback(error, info);
                }
                if (error) {
                    return debug('Message COULD NOT BE SEND: %O', error);
                }
                debug('Message %s sent: %s', info.messageId, info.response || '');

                if (info.message) {
                    console.log(info.message.toString())
                }
            }
        );
    }
};

module.exports = NodeMailer;