formatNumber = (num, returnOnError = 'N/A') => {
  if (!num || num.length == 0) 
      return returnOnError;
  let result = returnOnError;
  try {
      result = num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  } catch (err) {
      console.log('formatNumber error: ' + err);
  }
  return result;
}

formatDate = (date) => {
  const locale = 'en-US';
  const options = { month: 'long', day: 'numeric', year: 'numeric', second: 'numeric', minute: 'numeric', hour: 'numeric' };
  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
}
