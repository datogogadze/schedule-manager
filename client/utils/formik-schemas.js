import * as Yup from 'yup';

export const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  password: Yup.string()
    .required('Required')
    .min(8, 'Should contain at least 8 symbols')
});

export const SignupSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  firstName: Yup.string()
    .required('Required'),
  lastName: Yup.string()
    .required('Required'),
  password: Yup.string()
    .required('Required')
    .min(8, 'Should contain at least 8 symbols'),
  confirmPassword: Yup.string()
    .required('Required')
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
});

export const EditEventSchema = Yup.object().shape({
  name: Yup.string().required().min(3, 'Should contain at least 3 letters'),
  description: Yup.string().required().min(3, 'Should contain at least 3 letters'),
  eventDay: Yup.date().required(),
  hourFrom: Yup.date().required(),
  hourTo: Yup.date().required(),
  enableNotification: Yup.boolean().required(),
  notificationTimeDay: Yup.number().when('enableNotification', {
    is: true,
    then: Yup.number().required()
  }),
  notificationTimeHour: Yup.number().when('enableNotification', {
    is: true,
    then: Yup.number().required()
  }),
  notificationTimeMinute: Yup.number().when('enableNotification', {
    is: true,
    then: Yup.number().max(59).required()
  }),
  isRecurring: Yup.boolean().required(),
  interval: Yup.number().when('isRecurring', {
    is: true,
    then: Yup.number().required()
  }),
  frequencyIndex: Yup.number().when('isRecurring', {
    is: true,
    then: Yup.number().required()
  }),
  recurrenceEndingIndex: Yup.number().when('isRecurring', {
    is: true,
    then: Yup.number().required()
  }),
  recurrenceEndDate: Yup.date().when('recurrenceEndingIndex', {
    is: 0,
    then: Yup.date().required()
  }),
  recurrenceCount: Yup.number().when('recurrenceEndingIndex', {
    is: 1,
    then: Yup.number().required()
  }),
});