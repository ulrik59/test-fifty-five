// eslint-disable-next-line func-names
(function () {
  const apiUrl = 'http://cdn.55labs.com/demo/api.json';
  let apiData = {};

  function renderGraph() {
    const title = apiData.settings && apiData.settings.label;
    $('#title').text(title);
    $('.graph-title').text(title);

    const { dates } = apiData.data.DAILY;
    const xColumnWidth = Math.floor(800 / dates.length);
    const dateLabels = dates.map((date, index) => {
      const momentDate = moment(date, 'YYYYMMDD');
      return `<text x="${100 + (index * xColumnWidth)}" y="400">${momentDate.format('YYYY/MM/DD')}</text>`;
    });

    $('.x-labels').prepend(dateLabels.join(''));
  }

  function fetchApi() {
    fetch(apiUrl)
      .then((response) => {
        const { status, statusText } = response;

        if (status >= 200 && status < 300) {
          return response.json();
        }

        throw new Error(statusText, status);
      })
      .then((data) => {
        apiData = data;
        renderGraph();
      });
  }

  $('#refresh-button').click(fetchApi);
  fetchApi();
}());
