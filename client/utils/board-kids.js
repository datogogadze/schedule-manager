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