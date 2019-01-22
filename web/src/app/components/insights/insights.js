angular.module("app").controller("InsightsController", InsightsController);

function InsightsController($scope, $http, $sce, NLU_log_stats) {
  $scope.option = "Daily";
  loadDailyActiveUsers();

  NLU_log_stats.query({ path: "avgNluResponseTimesLast30Days" }, function(
    data
  ) {
    var nlu_response_data = [];
    $scope.nlu_response_labels = [];
    var nlu_avg_response = 0;
    $scope.nlu_response_series = ["time in ms"];
    for (var i = 0; i < data.length; i++) {
      $scope.nlu_response_labels.push(data[i].month_date);
      nlu_response_data.push(data[i].round);
      nlu_avg_response = nlu_avg_response + Number(data[i].round);
    }
    $scope.nlu_avg = Number(nlu_avg_response / data.length);
    $scope.nlu_response_data = [nlu_response_data];
  });

  NLU_log_stats.query({ path: "avgUserResponseTimesLast30Days" }, function(
    data
  ) {
    var response_data = [];
    var user_avg_response = 0;
    $scope.user_response_labels = [];
    $scope.user_response_series = ["time in ms"];
    for (var i = 0; i < data.length; i++) {
      $scope.user_response_labels.push(data[i].month_date);
      response_data.push(data[i].round);
      user_avg_response = user_avg_response + Number(data[i].round);
    }
    $scope.user_avg = Number(user_avg_response / data.length);
    $scope.users_response_data = [response_data];
  });

  $scope.updateData = function(option) {
    if (option == "Daily") {
      loadDailyActiveUsers();
    } else {
      loadMonthlyActiveUsers();
    }
  };

  NLU_log_stats.query({ path: "intentsMostUsed" }, function(data) {
    //group data by agent id.
    var agents_intents_map = new Map();
    var agents_dropdown = [];

    for (var i = 0; i < data.length; i++) {
      //{"intent_name":"is360_server_search","agent_id":7,"agent_name":"IS360Bot","grp_intent_count":null}
      var agentDataObj = new Object();
      if (agents_intents_map.has(data[i].agent_name)) {
        agentDataObj = agents_intents_map.get(data[i].agent_name);
      } else {
        //no data create one.
        agentDataObj = { label_data: [], data: [] };
      }
      agentDataObj.label_data.push(data[i].intent_name);
      if (data[i].grp_intent_count == null || data[i].grp_intent_count == "") {
        agentDataObj.data.push(0);
      } else {
        agentDataObj.data.push(data[i].grp_intent_count);
      }
      agents_intents_map.set(data[i].agent_name, agentDataObj);
    }
    // select first agent
    for (const key of agents_intents_map.keys()) {
      agents_dropdown.push(key);
    }
    if (agents_dropdown.length > 0) {
      $scope.intents_pie_labels = agents_intents_map.get(
        agents_dropdown[0]
      ).label_data;
      $scope.intents_pie_data = agents_intents_map.get(agents_dropdown[0]).data;
      $scope.agents_intents_map = agents_intents_map;
      $scope.agents_dropdown = agents_dropdown;
    }
  });

  $scope.updatePieChartData = function(agent_name) {
    $scope.intents_pie_labels = $scope.agents_intents_map.get(
      agent_name
    ).label_data;
    $scope.intents_pie_data = $scope.agents_intents_map.get(agent_name).data;
  };

  NLU_log_stats.query({ path: "agentsByIntentConfidencePct" }, function(data) {
    $scope.bar_chart_labels = [];
    $scope.bar_chart_series = ["Passed", "Failed"];
    var agents_names_confidence_map = new Map();
    for (var i = 0; i < data.length; i++) {
      var agentDataObj = new Object();
      if (agents_names_confidence_map.has(data[i].agent_name)) {
        agentDataObj = agents_names_confidence_map.get(data[i].agent_name);
      } else {
        //no data create one.
        agentDataObj = { data: [] };
      }
      agentDataObj.data.push(data[i].intent_confidence_pct);
      agents_names_confidence_map.set(data[i].agent_name, agentDataObj);
    }

    var passed_data = [];
    var failed_data = [];
    for (const key of agents_names_confidence_map.keys()) {
      if (key.length > 10) {
        $scope.bar_chart_labels.push(key.substring(0, 10) + "...");
      } else {
        $scope.bar_chart_labels.push(key);
      }
      var map_obj = agents_names_confidence_map.get(key);
      var passed_conter = 0;
      var failed_conter = 0;
      for (var j = 0; j < map_obj.data.length; j++) {
        if (map_obj.data[j] > $scope.confidencePercent) {
          passed_conter++;
        } else {
          failed_conter++;
        }
      }
      passed_data.push(passed_conter);
      failed_data.push(failed_conter);
    }
    $scope.barchar_data = [passed_data, failed_data];
    $scope.agents_names_confidence_map = agents_names_confidence_map;
  });
  $scope.updateBarChart = function() {
    var passed_data = [];
    var failed_data = [];
    if ($scope.agents_names_confidence_map == undefined) {
      //nothing populated yet
      return;
    }
    for (const key of $scope.agents_names_confidence_map.keys()) {
      var map_obj = $scope.agents_names_confidence_map.get(key);
      var passed_conter = 0;
      var failed_conter = 0;
      for (var j = 0; j < map_obj.data.length; j++) {
        if (map_obj.data[j] > $scope.confidencePercent) {
          passed_conter++;
        } else {
          failed_conter++;
        }
      }
      passed_data.push(passed_conter);
      failed_data.push(failed_conter);
    }
    $scope.barchar_data = [passed_data, failed_data];
  };

  $scope.piechart_options = {
    legend: { display: true, position: "top" },
    backgroundColor: [
      "rgb(255, 99, 132)",
      "rgb(54, 162, 235)",
      "rgb(255, 205, 86)"
    ],
    scales: {
      xAxes: [
        {
          gridLines: {
            color: "transparent",
            zeroLineColor: "transparent"
          },
          ticks: {
            fontSize: 2,
            fontColor: "transparent"
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

  $scope.activeusers_options = {
    maintainAspectRatio: false,
    legend: { display: false },
    scales: {
      xAxes: [
        {
          gridLines: {
            color: "transparent",
            zeroLineColor: "transparent"
          },
          ticks: {
            fontSize: 2,
            fontColor: "transparent"
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
    NLU_log_stats.query({ path: "activeUserCountLast30Days" }, function(data) {
      var users_data = [];
      var avg_act_users = 0;
      $scope.activeusers_labels = [];
      $scope.activeusers_series = ["Active"];
      for (var i = 0; i < data.length; i++) {
        $scope.activeusers_labels.push(data[i].month_date);
        users_data.push(data[i].user_count);
        avg_act_users = avg_act_users + Number(data[i].user_count);
      }
      $scope.avg_active_users = Number(avg_act_users / data.length);
      $scope.activeusers_data = [users_data];
    });
  }

  function loadMonthlyActiveUsers() {
    NLU_log_stats.query({ path: "activeUserCountLast12Months" }, function(
      data
    ) {
      var users_data = [];
      var avg_act_users = 0;
      $scope.activeusers_labels = [];
      $scope.activeusers_series = ["Active"];
      for (var i = 0; i < data.length; i++) {
        $scope.activeusers_labels.push(data[i].month_year);
        users_data.push(data[i].count_users);
        avg_act_users = avg_act_users + Number(data[i].count_users);
      }
      $scope.activeusers_data = [users_data];
      $scope.avg_active_users = Number(avg_act_users / data.length);
    });
  }
}
