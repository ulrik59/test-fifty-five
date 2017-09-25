// eslint-disable-next-line func-names
(function () {
  const apiUrl = 'http://cdn.55labs.com/demo/api.json';
  const svgUri = 'http://www.w3.org/2000/svg';

  const refreshButton = document.getElementById('refresh-button');
  const titleEl = document.getElementById('title');
  const graphTitleEl = document.getElementsByClassName('graph-title')[0];
  const xLabelsEl = document.getElementsByClassName('x-labels')[0];
  const dataEl = document.getElementsByClassName('data')[0];

  const playerInfoEl = document.getElementsByClassName('player-info')[0];
  const playerNameEl = document.getElementsByClassName('player-name')[0];
  const playerAverageEl = document.getElementsByClassName('player-average')[0];
  const playerMedianEl = document.getElementsByClassName('player-median')[0];
  const playerMaxEl = document.getElementsByClassName('player-max')[0];
  const playerMinEl = document.getElementsByClassName('player-min')[0];

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

      const textNode = document.createTextNode(moment(date, 'YYYYMMDD').format('DD/MM'));
      svgText.appendChild(textNode);
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
      });
  }

  refreshButton.onclick = fetchApi;
  fetchApi();
}());
