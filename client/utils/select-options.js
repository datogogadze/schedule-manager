import { Role } from './enums';

export const frequencies = [
  'daily',
  'weekly',
  'monthly'
];
  
export const frequencyOptions = [
  'დღე',
  'კვირა',
  'თვე',
];
  
export const recurrenceEndingOptions = [
  'თარიღზე',
  'განმეორების შემდეგ'
];

export const roleOptions = [
  'დედა',
  'მამა',
  'ძიძა',
  'ბებია',
  'ბაბუა',
  'დეიდა',
  'ბიძა',
  'და',
  'ძმა',
  'ბავშვი'
];

export const roleValues = [
  Role.Mother,
  Role.Father,
  Role.BabySitter,
  Role.GrandMother,
  Role.GrandFather,
  Role.Aunt,
  Role.Uncle,
  Role.Sister,
  Role.Brother,
  Role.Kid
];