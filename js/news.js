// ------------------------------------------
// NEWS
// ------------------------------------------

let getCovid19News = async () => {
  let dataItems = {};
  response = await fetch('https://covidtracking.com/api/press');
  const jsonData = await response.json();
  // process data
  if (jsonData.length) {
    let newsItems = '';
    for (item of jsonData) {
      newsItems +=
        '<div class="news-item">' +
        '<a class="news-details" target="_blank"' +
        'href="' + item.url + '">' + item.title + '</a>' +
        '<div class="news-source">' +
        item.publication + ', ' + item.publishDate +
        '</div>' +
        '</div>';
    }
    return newsItems;
  }
  return '';
};

getCovid19News().then(newsItems => {
  let elNewsItems = document.getElementById('news_items');
  if (elNewsItems) {
    elNewsItems.innerHTML = newsItems;
  }
});