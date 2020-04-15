export const isMongooseId = id => {
  const regex = /^[a-f\d]{24}$/i;
  return regex.test(id);
};

export const regexWildCard = str => ({
  $regex: new RegExp(str.toLowerCase(), 'i'),
});
