angular
  .module('app')
  .config(function(
    $routeProvider,
    adalAuthenticationServiceProvider,
    appConfig,
    $locationProvider
  ) {
    adalAuthenticationServiceProvider.init({
      anonymousEndpoints: [],
      instance: appConfig.adalinstance + '/',
      tenant: appConfig.adaltenantid,
      clientId: appConfig.adalclientid,
      postLogoutRedirectUri: window.location.origin});

    // Avoid AAD login loop
    $locationProvider
      .html5Mode({
        enabled: false
      })
      .hashPrefix('');

    $routeProvider
      .when('/', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'DashboardController as dashboard',
        templateUrl: '/app/components/dashboard/dashboard.html',
        activePage: 'dashboard'
      })
      .when('/login', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'LoginController',
        templateUrl: '/app/components/login/login.html',
        activePage: 'login'
      })
      .when('/dashboard', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'DashboardController as dashboard',
        templateUrl: '/app/components/dashboard/dashboard.html',
        activePage: 'dashboard'
      })
      .when('/agents', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'AgentsController as agent',
        templateUrl: '/app/components/agents/agents.html',
        activePage: 'agents'
      })
      .when('/agent/add', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'AddAgentController as addagent',
        templateUrl: '/app/components/agents/add_agent.html',
        activePage: 'agents'
      })
      .when('/agent/import', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'ImportAgentController as importagent',
        templateUrl: '/app/components/agents/import_agent.html',
        activePage: 'agents'
      })
      .when('/agent/:agent_id', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'EditAgentController as editagent',
        templateUrl: '/app/components/agents/edit_agent.html',
        activePage: 'agents'
      })
      .when('/agent/:agent_id/action/edit/:action_id', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'ActionsController as actionsController',
        templateUrl: '/app/components/actions/actions.html',
        activePage: 'agents'
      })
      .when('/agent/:agent_id/intent/add', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'AddIntentController as addintent',
        templateUrl: '/app/components/intents/add_intent.html',
        activePage: 'agents'
      })
      .when('/agent/:agent_id/intent/:intent_id', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'EditIntentController as editintent',
        templateUrl: '/app/components/intents/edit_intent.html',
        activePage: 'agents'
      })
      .when('/agent/:agent_id/stories/', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'StoriesController as stories',
        templateUrl: '/app/components/stories/stories.html',
        activePage: 'stories'
      })
      .when('/entities', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'EntitiesController as entity',
        templateUrl: '/app/components/entities/entities.html',
        activePage: 'entities'
      })
      .when('/agent/:agent_id/entity/add', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'AddEntityController as addentity',
        templateUrl: '/app/components/entities/add_entity.html',
        activePage: 'entities'
      })
      .when('/agent/:agent_id/entity/:entity_id', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'EntityController as entity',
        templateUrl: '/app/components/entities/entity.html',
        activePage: 'agents'
      })
      .when('/agent/:agent_id/regex/add', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'AddRegexController as addentity',
        templateUrl: '/app/components/regex/add_regex.html',
        activePage: 'regex'
      })
      .when('/agent/:agent_id/regex/:regex_id', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'EditRegexController as editregex',
        templateUrl: '/app/components/regex/edit_regex.html',
        activePage: 'regex'
      })
      .when('/agent/:agent_id/synonym/:synonym_id', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'SynonymController',
        templateUrl: '/app/components/synonyms/synonyms.html',
        activePage: 'agents'
      })
      .when('/agent/:agent_id/synonyms/add', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'SynonymController',
        templateUrl: '/app/components/synonyms/synonyms.html',
        activePage: 'agents'
      })
      .when('/rasaconfig', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'RasaConfigController',
        templateUrl: '/app/components/rasaconfig/rasa_config.html',
        activePage: 'config'
      })
      .when('/logs', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'LogsController',
        templateUrl: '/app/components/logs/logs.html',
        activePage: 'logs'
      })
      .when('/history', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'HistoryController',
        templateUrl: '/app/components/history/history.html',
        activePage: 'history'
      })
      .when('/conversation/:agent_id/:user_id', {
        requireADLogin: appConfig.adalauthentication,
        name: 'conversation',
        controller: 'ConversationController',
        templateUrl: '/app/components/conversation/conversation.html',
        activePage: 'history'
      })
      .when('/insights', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'InsightsController',
        templateUrl: '/app/components/insights/insights.html',
        activePage: 'insights'
      })
      .when('/training', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'TrainingController',
        templateUrl: '/app/components/training/training.html',
        activePage: 'training'
      })
      .when('/settings', {
        requireADLogin: appConfig.adalauthentication,
        controller: 'SettingsController',
        templateUrl: '/app/components/settings/settings.html',
        activePage: 'settings'
      })
      .otherwise({ redirectTo: '/' });
  });
