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

module.exports = {
  Role,
};
