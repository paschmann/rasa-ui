// Default colors
var brandPrimary =  '#20a8d8';
var brandSuccess =  '#4dbd74';
var brandInfo =     '#63c2de';
var brandWarning =  '#f8cb00';
var brandDanger =   '#f86c6b';

var grayDark =      '#2a2c36';
var gray =          '#55595c';
var grayLight =     '#818a91';
var grayLighter =   '#d1d4d7';
var grayLightest =  '#f8f9fa';

angular
.module('app')
.controller('cardChartCtrl1', cardChartCtrl1)
.controller('cardChartCtrl2', cardChartCtrl2)
.controller('cardChartCtrl2', cardChartCtrl2)
.controller('usageChartCtrl', usageChartCtrl)

//convert Hex to RGBA
function convertHex(hex,opacity){
  hex = hex.replace('#','');
  r = parseInt(hex.substring(0,2), 16);
  g = parseInt(hex.substring(2,4), 16);
  b = parseInt(hex.substring(4,6), 16);

  result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
  return result;
}

function random(min,max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}


function usageChartCtrl($scope, NLU_log, NLU_log_stats){
  NLU_log_stats.query({path: "avg_intent_usage_by_day"}, function(avg_data) {
    NLU_log_stats.query({path: "intent_usage_by_day"}, function(data) {
      var elements = data.length;
      var data1 = [];
      var data2 = [];
      var labels = [];

      for (var i = 0; i <= elements - 1; i++) {
        labels.push(data[i].to_char);
        data1.push(data[i].count);
        data2.push(avg_data[0].avg);
      }

      $scope.labels = labels;
      $scope.series = ['Processed', 'Average'];
      $scope.data = [ data1, data2];
      $scope.colors = [{
        backgroundColor: convertHex(brandInfo,10),
        borderColor: brandInfo,
        pointHoverBackgroundColor: '#fff'

      }, {
        backgroundColor: 'transparent',
        borderColor: brandSuccess,
        pointHoverBackgroundColor: '#fff'
      }];
      $scope.options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            gridLines: {
              drawOnChartArea: false,
            },
            ticks: {
              callback: function(value) {
                return value;
              }
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true,
              maxTicksLimit: 5,
              stepSize: Math.ceil((Math.max.apply(Math, data1) + (Math.max.apply(Math, data1)/10)) / 5),
              max: Math.ceil((Math.max.apply(Math, data1) + (Math.max.apply(Math, data1)/10)))
            }
          }]
        },
        elements: {
          point: {
            radius: 0,
            hitRadius: 10,
            hoverRadius: 4,
            hoverBorderWidth: 3,
          }
        },
      }
    });
  });




}

function cardChartCtrl1($scope) {
  console.log('card controller 1 loaded');
  $scope.onlineusers = 1110;

  $scope.labels = ['January','February','March','April','May','June','July'];
  $scope.data = [
    [65, 59, 84, 84, 51, 55, 40]
  ];
  $scope.colors = [{
    backgroundColor: brandPrimary,
    borderColor: 'rgba(255,255,255,.55)',
  }];
  $scope.options = {
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        gridLines: {
          color: 'transparent',
          zeroLineColor: 'transparent'
        },
        ticks: {
          fontSize: 2,
          fontColor: 'transparent',
        }

      }],
      yAxes: [{
        display: false,
        ticks: {
          display: false,
          min: Math.min.apply(Math, $scope.data[0]) - 5,
          max: Math.max.apply(Math, $scope.data[0]) + 5,
        }
      }],
    },
    elements: {
      line: {
        borderWidth: 1
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 4,
      },
    },
  }

}


function cardChartCtrl2() {
  this.onlineusers = 334;
  console.log('card controller 2 loaded');
}
