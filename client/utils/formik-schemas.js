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
  name: Yup.string(),
  description: Yup.string(),
  eventDay: Yup.date(),
  hourFrom: Yup.date(),
  hourTo: Yup.date(),
  isRecurring: Yup.boolean(),
  interval: Yup.number(),
  frequencyIndex: Yup.number(),
  recurrenceEndingIndex: Yup.number(),
  recurrenceEndDate: Yup.date(),
  recurrenceCount: Yup.number()
});