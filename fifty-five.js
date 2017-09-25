// eslint-disable-next-line func-names
(function () {
  const apiUrl = 'http://cdn.55labs.com/demo/api.json';
  const svgUri = 'http://www.w3.org/2000/svg';

  const refreshButton = document.getElementById('refresh-button');
  const titleEl = document.getElementById('title');
  const graphTitleEl = document.getElementById('graphTitle');
  const xLabelsEl = document.getElementById('xLabels');
  const dataEl = document.getElementById('data');

  const playerInfoEl = document.getElementById('player-info');
  const playerNameEl = document.getElementById('player-name');
  const playerAverageEl = document.getElementById('player-average');
  const playerMedianEl = document.getElementById('player-median');
  const playerMaxEl = document.getElementById('player-max');
  const playerMinEl = document.getElementById('player-min');

  let apiData = {};

  function avg(values) {
    const sum = values.reduce((buffer, value) => buffer + value);
    return sum / values.length;
  }

  function median(values) {
    const sortedValues = values.sort((a, b) => a - b);
    const lowMiddle = Math.floor((sortedValues.length - 1) / 2);
    const highMiddle = Math.ceil((sortedValues.length - 1) / 2);
    return (sortedValues[lowMiddle] + sortedValues[highMiddle]) / 2;
  }

  function renderPlayerInfo(playerId) {
    document.location.hash = playerId;
    const player = apiData.settings.dictionary[playerId];
    const playerScores = apiData.data.DAILY.dataByMember.players[playerId].points.filter(score => score !== null);

    playerNameEl.textContent = `${player.firstname} ${player.lastname}`;
    playerAverageEl.textContent = avg(playerScores).toFixed(2);
    playerMedianEl.textContent = median(playerScores);
    playerMaxEl.textContent = Math.max(...playerScores);
    playerMinEl.textContent = Math.min(...playerScores);

    playerInfoEl.style.display = 'block';
  }

  function renderGraph() {
    const title = apiData.settings.label;
    const { dates, dataByMember } = apiData.data.DAILY;
    const { players } = dataByMember;

    titleEl.textContent = title;
    graphTitleEl.textContent = title;

    const filteredDates = dates.filter(date => !!date);
    const xColumnWidth = Math.floor(1300 / filteredDates.length);

    filteredDates.forEach((date, index) => {
      const svgText = document.createElementNS(svgUri, 'text');

      svgText.setAttribute('x', 100 + (index * xColumnWidth));
      svgText.setAttribute('y', 400);
      svgText.textContent = moment(date, 'YYYYMMDD').format('DD/MM');

      xLabelsEl.appendChild(svgText);
    });

    const playerNbrs = Object.keys(players).length;
    const rectWidth = Math.floor((xColumnWidth - 3) / playerNbrs);

    Object.keys(players).forEach((playerId, playerIndex) => {
      const scores = players[playerId].points.filter(score => score !== null);
      const color = randomColor({ seed: playerIndex * 1000 });

      scores.forEach((score, index) => {
        const scoreEl = document.createElementNS(svgUri, 'g');

        const scoreTitleEl = document.createElementNS(svgUri, 'title');
        const scoreTitle = document.createTextNode(`${playerId} - ${score}`);
        scoreTitleEl.appendChild(scoreTitle);

        const svgRect = document.createElementNS(svgUri, 'rect');
        const height = Math.floor((score * 358) / 1000);
        svgRect.setAttribute('width', rectWidth);
        svgRect.setAttribute('height', height);
        svgRect.setAttribute('x', 96 + (index * ((rectWidth * 2) + 4)) + (playerIndex * rectWidth));
        svgRect.setAttribute('y', 368 - height);
        svgRect.style.fill = color;
        svgRect.style.cursor = 'pointer';
        svgRect.onclick = () => renderPlayerInfo(playerId);

        scoreEl.appendChild(scoreTitleEl);
        scoreEl.appendChild(svgRect);
        dataEl.appendChild(scoreEl);
      });
    });
  }

  function fetchApi() {
    playerInfoEl.style.display = 'none';
    dataEl.innerHTML = '';

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

        const locationHash = document.location.hash.substring(1);
        if (locationHash && Object.keys(apiData.settings.dictionary).includes(locationHash)) {
          renderPlayerInfo(locationHash);
        }
      });
  }

  refreshButton.onclick = fetchApi;
  fetchApi();
}());
