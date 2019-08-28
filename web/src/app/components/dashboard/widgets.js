// Default colors
const brandPrimary = '#20a8d8';
const brandSuccess = '#4dbd74';
const brandInfo = '#63c2de';
const brandWarning = '#f8cb00';
const brandDanger = '#f86c6b';

const grayDark = '#2a2c36';
const gray = '#55595c';
const grayLight = '#818a91';
const grayLighter = '#d1d4d7';
const grayLightest = '#f8f9fa';

angular
  .module('app')
  .controller('cardChartCtrl1', cardChartCtrl1)
  .controller('cardChartCtrl2', cardChartCtrl2)
  .controller('cardChartCtrl2', cardChartCtrl2)
  .controller('usageChartCtrl', usageChartCtrl);

//convert Hex to RGBA
function convertHex(hex, opacity) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
  return result;
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function usageChartCtrl($scope, NLU_log, NLU_log_stats) {
  NLU_log_stats.query({ path: 'intent_usage_by_day' }, function(data) {
    const elements = data.length;
    const data1 = [];
    const labels = [];

    for (let i = 0; i <= elements - 1; i++) {
      labels.push(data[i].day);
      data1.push(data[i].cnt);
    }

    $scope.labels = labels;
    $scope.series = ['Processed'];
    $scope.data = [data1];
    $scope.colors = [
      {
        backgroundColor: convertHex(brandInfo, 10),
        borderColor: brandInfo,
        pointHoverBackgroundColor: '#fff'}
    ];
    $scope.options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            gridLines: {
              drawOnChartArea: false
            },
            ticks: {
              callback: function(value) {
                return value;
              }}
          }
        ],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              maxTicksLimit: 5,
              stepSize: Math.ceil(
                (Math.max.apply(Math, data1) +
                  Math.max.apply(Math, data1) / 10) /
                  5
              ),
              max: Math.ceil(
                Math.max.apply(Math, data1) + Math.max.apply(Math, data1) / 10
              )
            }
          }
        ]
      },
      elements: {
        point: {
          radius: 0,
          hitRadius: 10,
          hoverRadius: 4,
          hoverBorderWidth: 3}
      }
    };
  });
}

function cardChartCtrl1($scope) {
  $scope.onlineusers = 1110;

  $scope.labels = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July'
  ];
  $scope.data = [[65, 59, 84, 84, 51, 55, 40]];
  $scope.colors = [
    {
      backgroundColor: brandPrimary,
      borderColor: 'rgba(255,255,255,.55)'
    }
  ];
  $scope.options = {
    maintainAspectRatio: false,
    scales: {
      xAxes: [
        {
          gridLines: {
            color: 'transparent',
            zeroLineColor: 'transparent'},
          ticks: {
            fontSize: 2,
            fontColor: 'transparent'}
        }
      ],
      yAxes: [
        {
          display: false,
          ticks: {
            display: false,
            min: Math.min.apply(Math, $scope.data[0]) - 5,
            max: Math.max.apply(Math, $scope.data[0]) + 5}}
      ]
    },
    elements: {
      line: {
        borderWidth: 1},
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 4}
    }
  };
}

function cardChartCtrl2() {
  this.onlineusers = 334;
}
