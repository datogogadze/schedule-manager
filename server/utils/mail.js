const sgMail = require('@sendgrid/mail');
const jwt = require('jsonwebtoken');
const User = require('../models/index').User;
const logger = require('../utils/winston');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
        const msg = {
          to: email,
          from: 'kidschedulemanager@gmail.com',
          subject: 'იმეილის ვერიფიკაცია',
          text: `მადლობას გიხდით რეგისტრაციისთვის, გთხოვთ დააჭიროთ დადასტურებას რათა დაასრულოთ პროცესი`,
          html: `<strong>მადლობას გიხდით რეგისტრაციისთვის, გთხოვთ დააჭიროთ ღილაკს <a href="${url}"><button>დადასტურება</button></a><strong> რათა დაასრულოთ პროცესი`,
        };

        sgMail
          .send(msg)
          .then((response) => {
            logger.info('verification mail sent to: ', email);
          })
          .catch((err) => {
            logger.error('error in mail verification send', err);
          });
      }
    );
  } catch (err) {
    logger.error('error in sending verification mail', err);
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
        const url = `${process.env.HOST_ADDRESS}/auth/reset/password/page/${token}`;
        const msg = {
          to: email,
          from: 'kidschedulemanager@gmail.com',
          subject: 'პაროლის ცვლილება',
          text: `პაროლის შესაცვლელად შემდეგი 15 წუთის განმავლობაში დააჭირეთ ღილაკს გადასვლა`,
          html: `<strong>პაროლის შესაცვლელად შემდეგი 15 წუთის განმავლობაში დააჭირეთ ღილაკს <a href="${url}"><button>გადასვლა</button></a><strong>`,
        };

        sgMail
          .send(msg)
          .then((response) => {
            logger.info('password reset mail sent to', email);
          })
          .catch((err) => {
            logger.error('error in password reset send', err);
          });
      }
    );
  } catch (err) {
    logger.error('error in sending password reset mail', err);
  }
};

module.exports = {
  sendVerificationMail,
  sendResetPasswrdMail,
};
