const statusColors = [
  'primary',
  'success',
  'info',
  'warning',
  'danger'
];

export const getKidColor = (boardKids, kidId) => {
  const index = boardKids.findIndex((kid) => kid.id == kidId);

  if (index >= 0) {
    return  statusColors[index % statusColors.length];
  } else {
    return 'basic';
  }
};

export const getKidColorByIndex = (boardKids, kidId) => {
  const kid = boardKids.find((kid) => kid.id == kidId);
  const { kid_index } = kid;
  
  if (kid_index >= 0) {
    return  statusColors[kid_index % statusColors.length];
  } else {
    return 'basic';
  }
};
