const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/index').User;
const logger = require('../utils/winston');

module.exports = async email => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const { id } = await User.findOne({ where: { email } });

    jwt.sign(
      {
        id,
      },
      process.env.EMAIL_SECRET,
      {
        expiresIn: '1d',
      },
      (err, token) => {
        if (err) {
          logger.error('token creation error', err);
          return;
        }
        const url = `${process.env.HOST_ADDRESS}/auth/confirm/${token}`;
        transporter.sendMail(
          {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Schedule manager confirmation',
            text: `იმეილის ვერიფიკაციისთვის გადადით შემდეგ ლინკზე: <a href="${url}">${url}</a>`,
            html: `იმეილის ვერიფიკაციისთვის გადადით შემდეგ ლინკზე: <a href="${url}">${url}</a>`,
            list: {
              help: `${process.env.GMAIL_USER}?subject=help`,
              unsubscribe: {
                url: process.env.HOST_ADDRESS,
                comment: 'Comment',
              },
            },
          },
          (err, info) => {
            if (err) {
              logger.error('nodemailer error: ', err);
            }
            logger.debug('nodemailer info', info.messageId);
          }
        );
      }
    );
  } catch (err) {
    logger.error('error in sending mail', err);
  }
};
