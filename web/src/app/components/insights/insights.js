/* TODO: */
angular.module('app').controller('InsightsController', InsightsController);

function InsightsController($scope, $http, $sce, NLU_log_stats, Bot, appConfig) {
  $scope.option = 'Daily';
  loadDailyActiveUsers();

  Bot.query(function (data) {
    $scope.botList = data;
    $scope.selectedBot = data[0].bot_id;
    $scope.drawCharts();
  });
  //chart options
  $scope.barchart_options = {
    legend: { display: true, position: 'top' },
    scales: {
      yAxes: [
        {
          ticks: {
            suggestedMin: 0,
            stepSize: 1
          }
        }
      ]
    }
  };
  $scope.piechart_options = {
    legend: { display: true, position: 'top' },
    backgroundColor: [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 205, 86)'
    ],
    scales: {
      xAxes: [
        {
          gridLines: {
            color: 'transparent',
            zeroLineColor: 'transparent'
          },
          ticks: {
            fontSize: 2,
            fontColor: 'transparent'
          }
        }
      ],
      yAxes: [
        {
          display: false
        }
      ]
    },
    elements: {
      line: {
        tension: 0.00001,
        borderWidth: 2
      },
      point: {
        radius: 1,
        hitRadius: 10,
        hoverRadius: 4
      }
    }
  };

  $scope.drawCharts = function () {
    $http({ method: 'GET', url: appConfig.api_endpoint_v2 + '/intentsMostUsed/' + $scope.selectedBot }).then(
      function (response) {
        console.log("Resp " + JSON.stringify(response));

        $scope.intents_pie_labels = [];
        $scope.intents_pie_data = [];
        let results = response.data;
        for (var i = 0; i < results.length; i++) {
          $scope.intents_pie_labels.push(results[i].intent_name);
          if (results[i].grp_intent_count == null || results[i].grp_intent_count === '') {
            $scope.intents_pie_data.push(0);
          } else {
            $scope.intents_pie_data.push(results[i].grp_intent_count);
          }
        }
      },
      function (errorResponse) {
        console.log("Error Message while Getting Messages." + errorResponse);
      });
    $http({ method: 'GET', url: appConfig.api_endpoint_v2 + '/botsByIntentConfidencePct/' + $scope.selectedBot }).then(
      function (response) {
        $scope.botResults = response.data;
        var botNameForBarChart = response.data[0].bot_name;
        $scope.bar_chart_labels = [];
        $scope.bar_chart_series = ['Passed', 'Failed'];
        let passed_conter = 0;
        let failed_conter = 0;
        for (let j = 0; j < $scope.botResults.length; j++) {
          if ($scope.botResults[j].intent_confidence_pct > $scope.confidencePercent) {
            passed_conter++;
          } else {
            failed_conter++;
          }
        }
        $scope.bar_chart_labels = ["Bot:" + botNameForBarChart];
        $scope.bar_chart_series = ['Passed', 'Failed'];
        $scope.barchar_data = [[passed_conter], [failed_conter]];
      },
      function (errorResponse) {
        console.log("Error Message while Getting Messages." + errorResponse);
      }
    )
  }


  NLU_log_stats.query({ path: 'avgNluResponseTimesLast30Days' }, function (
    data
  ) {
    const nlu_response_data = [];
    $scope.nlu_response_labels = [];
    let nlu_avg_response = 0;
    $scope.nlu_response_series = ['time in ms'];
    for (let i = 0; i < data.length; i++) {
      $scope.nlu_response_labels.push(data[i].month_date);
      nlu_response_data.push(data[i].round);
      nlu_avg_response = nlu_avg_response + Number(data[i].round);
    }
    $scope.nlu_avg = Number(nlu_avg_response / data.length).toFixed(0);
    $scope.nlu_response_data = [nlu_response_data];
  });

  NLU_log_stats.query({ path: 'avgUserResponseTimesLast30Days' }, function (
    data
  ) {
    const response_data = [];
    let user_avg_response = 0;
    $scope.user_response_labels = [];
    $scope.user_response_series = ['time in ms'];
    for (let i = 0; i < data.length; i++) {
      $scope.user_response_labels.push(data[i].month_date);
      response_data.push(data[i].round);
      user_avg_response = user_avg_response + Number(data[i].round);
    }
    $scope.user_avg = Number(user_avg_response / data.length);
    $scope.users_response_data = [response_data];
  });

  $scope.updateData = function (option) {
    if (option === 'Daily') {
      loadDailyActiveUsers();
    } else {
      loadMonthlyActiveUsers();
    }
  };

  $scope.updateBarChart = function () {
    let passed_conter = 0;
    let failed_conter = 0;
    for (let j = 0; j < $scope.botResults.length; j++) {
      if ($scope.botResults[j].intent_confidence_pct > $scope.confidencePercent) {
        passed_conter++;
      } else {
        failed_conter++;
      }
    }
    $scope.barchar_data = [[passed_conter], [failed_conter]];
  };

  $scope.activeusers_options = {
    maintainAspectRatio: false,
    legend: { display: false },
    scales: {
      xAxes: [
        {
          gridLines: {
            color: 'transparent',
            zeroLineColor: 'transparent'
          },
          ticks: {
            fontSize: 2,
            fontColor: 'transparent'
          }
        }
      ],
      yAxes: [
        {
          display: false
        }
      ]
    },
    elements: {
      line: {
        tension: 0.00001,
        borderWidth: 2
      },
      point: {
        radius: 1,
        hitRadius: 10,
        hoverRadius: 4
      }
    }
  };

  function loadDailyActiveUsers() {
    NLU_log_stats.query({ path: 'activeUserCountLast30Days' }, function (data) {
      const users_data = [];
      let avg_act_users = 0;
      $scope.activeusers_labels = [];
      $scope.activeusers_series = ['Active'];
      for (let i = 0; i < data.length; i++) {
        $scope.activeusers_labels.push(data[i].month_date);
        users_data.push(data[i].user_count);
        avg_act_users = avg_act_users + Number(data[i].user_count);
      }
      $scope.avg_active_users = Number(avg_act_users / data.length).toFixed(0);
      $scope.activeusers_data = [users_data];
    });
  }

  function loadMonthlyActiveUsers() {
    NLU_log_stats.query({ path: 'activeUserCountLast12Months' }, function (
      data
    ) {
      const users_data = [];
      let avg_act_users = 0;
      $scope.activeusers_labels = [];
      $scope.activeusers_series = ['Active'];
      for (let i = 0; i < data.length; i++) {
        $scope.activeusers_labels.push(data[i].month_year);
        users_data.push(data[i].count_users);
        avg_act_users = avg_act_users + Number(data[i].count_users).toFixed(0);
      }
      $scope.activeusers_data = [users_data];
      $scope.avg_active_users = Number(avg_act_users / data.length).toFixed(0);
    });
  }
}
