let getDailyStateData = async (stateId) => {

  if (!stateId || stateId.length <= 0) {
      return;
  }

  response = await fetch('https://covidtracking.com/api/states/daily?state=' + stateId);
  const jsonData = await response.json();
  // process data
  if (jsonData.length) {
      let dailyStateDateMarkers = [];
      let stateDaily = {
          positive: [],
          tested: []
      };
      for (day of jsonData) {

          if (day.date) {
              let month = day.date.toString().substring(4, 6);
              let _day = day.date.toString().substring(6);
              dailyStateDateMarkers.push(month + '/' + _day);
          }

          stateDaily.positive.push(day.positive);
          stateDaily.tested.push(day.totalTestResults);
      }

      return {
          data: stateDaily,
          dateMarkers: dailyStateDateMarkers.reverse()
      };
  }

  return null;
};

let getCurrentDataPerState = async () => {

  let dataItems = {};
  let heatMap = [];

  response = await fetch('https://covidtracking.com/api/states');
  const jsonData = await response.json();
  // process data
  if (jsonData.length) {
      // sort state by the highest positive occurrence
      jsonData.sort((a, b) => (a.positive < b.positive) ? 1 : -1);
      // store top 20 for rendering in state-testing page
      return jsonData.slice(0, 16);
  }

  return null;
};

getTestDataPerState = async () => {

  let chartHtmlContainers = '';
  let top20HighestPositives = await getCurrentDataPerState();

  for (let index = 0; index < top20HighestPositives.length; index++) {

    let _state = top20HighestPositives[index];
    // get data for state
    const stateData = await getDailyStateData(_state.state);

    let chartData = [{
        text: 'Positive',
        values: stateData.data.positive.reverse(),
        lineColor: '#D0021B',
        marker: {
            backgroundColor: '#D0021B',
            borderColor: '#D0021B'
        }
    },
    {
        text: 'Tested',
        values: stateData.data.tested.reverse(),
        lineColor: '#BD10E0',
        marker: {
            backgroundColor: '#BD10E0',
            borderColor: '#BD10E0'
        }
    }];

    // CHART CONFIG
    // -----------------------------
    let lineChartConfig = {
        type: 'line',
        theme: 'classic',
        backgroundColor: '#fff',
        title: {
          text: '<u>' + US_states[_state.state] + '</u>',
          backgroundColor: 'white',
          color: '#333',
          textAlign: 'center',
          width: '40%',
          y: '-3%'
      },
        plot: {
            backgroundMode: 'graph',
            backgroundState: {
                lineColor: '#eee',
                marker: {
                    backgroundColor: 'none'
                }
            },
            lineWidth: '1px',
        },
        plotarea: {
            margin: '18% 10% 30% 25%'
        },
        scaleX: {
            values: stateData.dateMarkers
        },
        scaleY: {
            lineColor: '#333'
        },
        tooltip: {
            text: '%v %t in %k',
            thousandsSeparator: ','

        },
        series: chartData
    };

    let lineChartName = 'lineChartTested' + index;
    // add html element
    chart_tests_container.innerHTML += '<span id="' + lineChartName + '" class="line-chart-tested"></span>';
    // RENDER CHART
    // -----------------------------
    zingchart.render({
        id: lineChartName,
        data: lineChartConfig,
        width: '220px',
        height: '180px'
    });
  } // end for
}

getTestDataPerState();