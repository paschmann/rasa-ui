app.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      controller:'DashboardController as dashboard',
      templateUrl:'/app/components/dashboard/dashboard.html',
      activePage:'dashboard'
    })
    .when('/dashboard', {
      controller:'DashboardController as dashboard',
      templateUrl:'/app/components/dashboard/dashboard.html',
      activePage:'dashboard'
    })
    .when('/agents', {
      controller:'AgentsController as agent',
      templateUrl:'/app/components/agents/agents.html',
      activePage:'agents'
    })
    .when('/agent/add', {
      controller:'AddAgentController as addagent',
      templateUrl:'/app/components/agents/add_agent.html',
      activePage:'agents'
    })
    .when('/agent/:agent_id', {
      controller:'EditAgentController as editagent',
      templateUrl:'/app/components/agents/edit_agent.html',
      activePage:'agents'
    })
    .when('/agent/:agent_id/intent/add', {
      controller:'AddIntentController as addintent',
      templateUrl:'/app/components/intents/add_intent.html',
      activePage:'agents'
    })
    .when('/agent/:agent_id/intent/:intent_id', {
      controller:'EditIntentController as editintent',
      templateUrl:'/app/components/intents/edit_intent.html',
      activePage:'agents'
    })
    .when('/entities', {
      controller:'EntitiesController as entity',
      templateUrl:'/app/components/entities/entities.html',
      activePage:'entities'
    })
    .when('/entity/add', {
      controller:'AddEntityController as addentity',
      templateUrl:'/app/components/entities/add_entity.html',
      activePage:'entities'
    })
    .when('/entity/:entity_id/synonyms', {
      controller:'SynonymController',
      templateUrl:'/app/components/synonyms/synonyms.html',
      activePage:'entities'
    })
    .when('/rasaconfig', {
      controller:'RasaConfigController',
      templateUrl:'/app/components/rasaconfig/rasa_config.html',
      activePage:'config'
    })
    .when('/logs', {
      controller:'LogsController',
      templateUrl:'/app/components/logs/logs.html',
      activePage:'logs'
    })
    .when('/training', {
      controller:'TrainingController',
      templateUrl:'/app/components/training/training.html',
      activePage:'training'
    })
    .when('/settings', {
      controller:'SettingsController',
      templateUrl:'/app/components/settings/settings.html',
      activePage:'settings'
    })
    .otherwise({
      redirectTo:'/'
    });
})
