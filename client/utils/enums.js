export const ModalOption = {
  None: 'None',
  Calendar: 'Calendar',
  Create: 'Create',
  Filter: 'Filter',
  Select: 'Select'
};

export const Role = {
  Mother: 'mother',
  Father: 'father',
  BabySitter: 'babySitter',
  GrandMother: 'grandMother',
  GrandFather: 'grandFather',
  Aunt: 'aunt',
  Uncle: 'uncle',
  Sister: 'sister',
  Brother: 'brother',
  Kid: 'kid',
  has: (role) => Object.values(Role).includes(role),
};
