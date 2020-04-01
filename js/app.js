
const HeatMap = {
    1: '#f9e3a1',
    2: '#f9da98',
    3: '#f7d491',
    4: '#f5ca86',
    5: '#f4c27e',
    6: '#f3bb78',
    7: '#f1b373',
    8: '#f0ad6f',
    9: '#eda067',
    10: '#e27950'
    /*
    1: '#f4f4cf',
    2: '#f8f0bc',
    3: '#fbeead',
    4: '#f9da98',
    5: '#f5ca86',
    6: '#41b373',
    7: '#ec9c64',
    8: '#e58054',
    9: '#c84535',
    10: '#9a202b'
    */
};

btnClose.onclick = function () {
    myModal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == myModal) {
        myModal.style.display = "none";
    }
}

// MISC
// ------------------------------------------

formatNumber = (num) => {
    if (!num) return 'N/A';
    let result = 'N/A';
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


// ------------------------------------------
// MAP CHART
// ------------------------------------------

let state = (text, bgColor = null) => {
    let color = '#c0ccdb';

    let stateObj = {
        tooltip: {
            text: text,
            borderColor: color,
            borderWidth: '2px',
            shadow: true,
            textAlign: 'left',
            padding: '20%',
        },
    };

    if (bgColor) {
        //stateObj.backgroundColor = 'linear-gradient(to bottom right, #dddddd ' + (10 -grade) + '%, #ff5050 100%)';
        stateObj.backgroundColor = bgColor;
        //stateObj.backgroundColor1 = bgColor;
        //stateObj.fillAngle = 270;
    }

    return stateObj;
}


let getCurrentDataPerState = async () => {

    let dataItems = {};
    let heatMap = [];

    response = await fetch('https://covidtracking.com/api/states');
    const jsonData = await response.json();
    // process data
    if (jsonData.length) {
        // sort state by the highest positive occurrence
        jsonData.sort((a, b) => (a.positive < b.positive) ? 1 : -1);
        // compute heatmap
        let highestPositive = jsonData[0].positive;
        for (_state of jsonData) {
            // compute and setup html objects
            if (_state.positive !== null && _state.positive > 0) {
                // determine size of shape for the state. Bigger positive, bigger shape
                let size = (_state.positive / highestPositive) * 10;
                if (size % 1) {
                    size = Math.trunc(size) + 1;
                } else {
                    size = Math.trunc(size);
                }
                /*
                // setup heatmap
                heatMap.push({
                type: 'circle',
                id:  _state.state.toLowerCase(),
                x: US_coords[_state.state].lng ? US_coords[_state.state].lng + 'lon' : '',
                y: US_coords[_state.state].lat ? US_coords[_state.state].lat + 'lat' : '',
                map: 'usa',
                size: size,
                alpha: 0.3,
                backgroundColor: 'red',
                tooltip: {
                    text: stateObj.tooltip.text,
                    borderColor: stateObj.tooltip.borderColor,
                    borderWidth: stateObj.tooltip.borderWidth,
                    shadow: stateObj.tooltip.shadow,
                    textAlign: stateObj.tooltip.textAlign,
                    padding: stateObj.tooltip.padding,
                }
                });
                */
                // setup tooltip
                dataItems[_state.state] = state(
                    '<u>' + US_states[_state.state] + '</u><br><br>' +
                    'Positive: <b>' + formatNumber(_state.positive) + '</b><br>' +
                    'Negative: <b>' + formatNumber(_state.negative) + '</b><br>' +
                    'Deaths: <b>' + formatNumber(_state.death) + '</b><br>' +
                    'Hospitalized: <b>' + formatNumber(_state.hospitalized) + '</b><br>' +
                    'Tested: <b>' + formatNumber(_state.totalTestResults) + '</b>',
                    //HeatMap[size]
                );
            }
        };
    }

    return {
        heatMap: heatMap,
        dataItems: dataItems
    }

};

let USData = {
    positive: 0,
    death: 0,
    negative: 0,
    hospitalized: 0,
    total: 0
};

let getUSCurrentData = async () => {
    response = await fetch('https://covidtracking.com/api/us');
    let jsonData = await response.json();
    if (jsonData.length) {
        lastUpdated.innerHTML = formatDate(jsonData[0].lastModified);
        return jsonData[0];
    }
    return '';
};

getUSCurrentData().then(usData => {
    USData = usData;
});

getCurrentDataPerState().then(covidData => {

    // setup summary stats
    positive.innerHTML = '<span style="color:#D0021B;">Positive</span> <b>' + formatNumber(USData.positive) + '</b>';
    negative.innerHTML = '<span style="color:#4A90E2;">Negative</span> <b>' + formatNumber(USData.negative) + '</b>';
    hospitalized.innerHTML = '<span style="color:#F5A623;">Hospitalized</span> <b>' + formatNumber(USData.hospitalized) + '</b>';
    deaths.innerHTML = '<span style="color:#979797;">Deaths</span> <b>' + formatNumber(USData.death) + '</b>';
    tested.innerHTML = '<span style="color:#BD10E0;">Tested</span> <b>' + formatNumber(USData.totalTestResults) + '</b>';

    // CHART CONFIG
    // -----------------------------

    let chartConfig = {
        graphset: [{
            backgroundColor: 'white', //'#9DDCF9',
            title: {
                text: 'COVID-19 Tracker - Daily',
                backgroundColor: 'none',
                fontColor: '#000',
                y: '7%'
            },
            shapes: [{
                type: 'zingchart.maps',
                options: {
                    name: 'usa',
                    scale: true,
                    style: {
                        hoverState: {
                            visible: false // highlight state on hover
                        },
                        controls: {
                            placement: 'tr'
                        },
                        items: covidData.dataItems
                    },
                    width: '80%',
                    height: '80%',
                    x: '17%',
                    y: '12%'
                }
            }]
        }]
    };

    // RENDER CHARTS
    // -----------------------------

    // add heatmap
    chartConfig.graphset[0].shapes.push(...covidData.heatMap.slice(0, 52));

    zingchart.loadModules('maps, maps-usa');

    zingchart.render({
        id: 'mapChart',
        data: chartConfig,
        width: '100%',
        height: '80%'
    });

});

// popup dialog for state chart
zingchart.bind('mapChart', 'shape_click', (e) => {
    let state = e.shapeid;
    if (state) {
        plotStateDailyChart(state);
    }
});

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
            death: [],
            negative: [],
            hospitalized: [],
            tested: []
        };
        for (day of jsonData) {

            if (day.date) {
                let month = day.date.toString().substring(4, 6);
                let _day = day.date.toString().substring(6);
                dailyStateDateMarkers.push(month + '/' + _day);
            }

            stateDaily.positive.push(day.positive);
            stateDaily.negative.push(day.negative);
            stateDaily.death.push(day.death);
            stateDaily.hospitalized.push(day.hospitalized);
            stateDaily.tested.push(day.totalTestResults);
        }

        return {
            data: stateDaily,
            dateMarkers: dailyStateDateMarkers.reverse()
        };
    }

    return null;
};

let plotStateDailyChart = async (stateId) => {

    const stateData = await getDailyStateData(stateId);

    let chartData = [{
        text: 'Positive',
        values: stateData.data.positive.reverse(),
        lineColor: '#D0021B',
        marker: {
            backgroundColor: '#D0021B',
            borderColor: '#D0021B'
        },
    },
    {
        text: 'Negative',
        values: stateData.data.negative.reverse(),
        lineColor: '#4A90E2',
        marker: {
            backgroundColor: '#4A90E2',
            borderColor: '#4A90E2'
        }
    },
    {
        text: 'Hospitalized',
        values: stateData.data.hospitalized.reverse(),
        lineColor: '#F5A623',
        marker: {
            backgroundColor: '#F5A623',
            borderColor: '#F5A623'
        }
    },
    {
        text: 'Deaths',
        values: stateData.data.death.reverse(),
        lineColor: '#979797',
        marker: {
            backgroundColor: '#979797',
            borderColor: '#979797'
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
        backgroundColor: 'white',
        title: {
            text: '<u>' + US_states[stateId] + '</u> Daily Progression',
            backgroundColor: 'white',
            color: '#333',
            textAlign: 'center',
            width: '60%'
        },
        legend: {
            marginTop: '55%',
            marginLeft: '85%',
            backgroundColor: 'white',
            borderWidth: '0px',
            item: {
                cursor: 'hand'
            },
            layout: 'x1',
            marker: {
                borderWidth: '0px',
                cursor: 'hand'
            },
            shadow: false,
            toggleAction: 'remove'
        },
        plot: {
            backgroundMode: 'graph',
            backgroundState: {
                lineColor: '#eee',
                marker: {
                    backgroundColor: 'none'
                }
            },
            lineWidth: '3px',
            selectedState: {
                lineWidth: '4px'
            },
            selectionMode: 'multiple'
        },
        plotarea: {
            margin: '8% 17% 5% 10%'
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

    // replace previous chart, render current one
    zingchart.exec('lineChart', 'destroy');

    // RENDER CHARTS
    // -----------------------------
    //zingchart.render({
    //    id: 'lineChart',
    //    data: lineChartConfig,
    //    width: '90%',
    //    height: '90%'
    // });

    // myModal.style.display = "block";

}

// ------------------------------------------
// LINE CHART
// ------------------------------------------

// LINE DATA
// -----------------------------

let dailyDateMarkers = [];

let getUSDaily = async () => {

    response = await fetch('https://covidtracking.com/api/us/daily');
    let jsonData = await response.json();

    if (jsonData.length) {
        let USDaily = {
            positive: [],
            death: [],
            negative: [],
            hospitalized: [],
            tested: []
        };
        for (day of jsonData) {

            if (day.date) {
                let month = day.date.toString().substring(4, 6);
                let _day = day.date.toString().substring(6);
                dailyDateMarkers.push(month + '/' + _day);
            }

            USDaily.positive.push(day.positive);
            USDaily.negative.push(day.negative);
            USDaily.death.push(day.death);
            USDaily.hospitalized.push(day.hospitalized);
            USDaily.tested.push(day.totalTestResults);
        }

        return USDaily;
    }

    return '';
};

getUSDaily().then(usDaily => {

    let chartData = [{
        text: 'Positive',
        values: usDaily.positive.reverse(),
        lineColor: '#D0021B',
        marker: {
            backgroundColor: '#D0021B',
            borderColor: '#D0021B'
        },
    },
    {
        text: 'Negative',
        values: usDaily.negative.reverse(),
        lineColor: '#4A90E2',
        marker: {
            backgroundColor: '#4A90E2',
            borderColor: '#4A90E2'
        }
    },
    {
        text: 'Hospitalized',
        values: usDaily.hospitalized.reverse(),
        lineColor: '#F5A623',
        marker: {
            backgroundColor: '#F5A623',
            borderColor: '#F5A623'
        }
    },
    {
        text: 'Deaths',
        values: usDaily.death.reverse(),
        lineColor: '#979797',
        marker: {
            backgroundColor: '#979797',
            borderColor: '#979797'
        }
    },
    {
        text: 'Tested',
        values: usDaily.tested.reverse(),
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
        backgroundColor: 'white',
        title: {
            text: 'US Daily Progression',
            backgroundColor: 'white',
            color: '#333',
            textAlign: 'center',
            width: '60%'
        },
        legend: {
            marginTop: '55%',
            marginLeft: '77%',
            backgroundColor: 'white',
            borderWidth: '0px',
            item: {
                cursor: 'hand'
            },
            layout: 'x1',
            marker: {
                borderWidth: '0px',
                cursor: 'hand'
            },
            shadow: false,
            toggleAction: 'remove'
        },
        plot: {
            backgroundMode: 'graph',
            backgroundState: {
                lineColor: '#eee',
                marker: {
                    backgroundColor: 'none'
                }
            },
            lineWidth: '3px',
            selectedState: {
                lineWidth: '4px'
            },
            selectionMode: 'multiple'
        },
        plotarea: {
            margin: '15% 25% 10% 25%'
        },
        scaleX: {
            values: dailyDateMarkers.reverse(),
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

    // RENDER CHARTS
    // -----------------------------
    zingchart.render({
        id: 'lineUSChart',
        data: lineChartConfig,
    });

});

