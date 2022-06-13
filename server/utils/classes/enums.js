const { default: RRule } = require('rrule');

const Role = Object.freeze({
  Mother: 'mother',
  Father: 'father',
  BabySitter: 'babySitter',
  GrandMother: 'grandMother',
  GrandFather: 'grandFather',
  Aunt: 'aunt',
  Uncle: 'uncle',
  Sister: 'sister',
  Brother: 'brother',

  has: (role) => Object.values(Role).includes(role),
});

const recurrences = {
  daily: RRule.DAILY,
  weekly: RRule.WEEKLY,
  monthly: RRule.MONTHLY,
};

const Recurrence = Object.freeze({
  Daily: 'daily',
  Weekly: 'weekly',
  Monthly: 'monthly',
  convert: (recurrence) => recurrences[recurrence],
  has: (recurrence) => Object.values(Recurrence).includes(recurrence),
});

module.exports = {
  Role,
  Recurrence,
};
