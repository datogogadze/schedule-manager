const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/index').User;
const logger = require('../utils/winston');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

const sendVerificationMail = async (email) => {
  try {
    const { id } = await User.findOne({ where: { email } });

    jwt.sign(
      {
        id,
      },
      process.env.JWT_SECRET,
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
            text: `მადლობას გიხდით რეგისტრაციისთვის <a href="${url}">დადასტურება</a>`,
            html: `მადლობას გიხდით რეგისტრაციისთვის <a href="${url}">დადასტურება</a>`,
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
              return;
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

const sendResetPasswrdMail = async (email) => {
  try {
    const { id } = await User.findOne({ where: { email } });

    jwt.sign(
      {
        id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '15m',
      },
      (err, token) => {
        if (err) {
          logger.error('token creation error', err);
          return;
        }
        const url = `${process.env.HOST_ADDRESS}/resetPassword?token=${token}`;
        transporter.sendMail(
          {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Schedule manager reset password',
            text: `პაროლს შესაცვლელად შემდეგი 15 წუთის განმავლობაში გადადით ლინკზე: <a href="${url}">გადასვლა</a>`,
            html: `პაროლს შესაცვლელად შემდეგი 15 წუთის განმავლობაში გადადით ლინკზე: <a href="${url}">გადასვლა</a>`,
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
              return;
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

module.exports = {
  sendVerificationMail,
  sendResetPasswrdMail,
};
