angular
  .module('app')
  .config(function (
    $routeProvider,
    appConfig,
    $locationProvider
  ) {
    $locationProvider
      .html5Mode({
        enabled: false
      })
      .hashPrefix('');

    $routeProvider
      .when('/', {
        controller: 'DashboardController as dashboard',
        templateUrl: '/app/components/dashboard/dashboard.html',
        activePage: 'dashboard'
      })
      .when('/login', {
        controller: 'LoginController',
        templateUrl: '/app/components/login/login.html',
        activePage: 'login'
      })
      .when('/dashboard', {
        controller: 'DashboardController as dashboard',
        templateUrl: '/app/components/dashboard/dashboard.html',
        activePage: 'dashboard'
      })
      .when('/agents', {
        controller: 'AgentsController as agent',
        templateUrl: '/app/components/agents/agents.html',
        activePage: 'agents'
      })
      .when('/agent/add', {
        controller: 'AddAgentController as addagent',
        templateUrl: '/app/components/agents/add_agent.html',
        activePage: 'agents'
      })
      .when('/agent/import', {
        controller: 'ImportAgentController as importagent',
        templateUrl: '/app/components/agents/import_agent.html',
        activePage: 'agents'
      })
      .when('/agent/:agent_id', {
        controller: 'EditAgentController as editagent',
        templateUrl: '/app/components/agents/edit_agent.html',
        activePage: 'agent'
      })
      .when('/agent/:agent_id/action/edit/:action_id', {
        controller: 'ActionsController as actionsController',
        templateUrl: '/app/components/actions/actions.html',
        activePage: 'agent'
      })
      .when('/agent/:agent_id/intent/add', {
        controller: 'AddIntentController as addintent',
        templateUrl: '/app/components/intents/add_intent.html',
        activePage: 'agent'
      })
      .when('/agent/:agent_id/intent/:intent_id', {
        controller: 'EditIntentController as editintent',
        templateUrl: '/app/components/intents/edit_intent.html',
        activePage: 'agent'
      })
      .when('/agent/:agent_id/stories/', {
        controller: 'StoriesController as stories',
        templateUrl: '/app/components/stories/stories.html',
        activePage: 'stories'
      })
      .when('/entities', {
        controller: 'EntitiesController as entity',
        templateUrl: '/app/components/entities/entities.html',
        activePage: 'entities'
      })
      .when('/agent/:agent_id/entity/add', {
        controller: 'AddEntityController as addentity',
        templateUrl: '/app/components/entities/add_entity.html',
        activePage: 'entities'
      })
      .when('/agent/:agent_id/entity/:entity_id', {
        controller: 'EntityController as entity',
        templateUrl: '/app/components/entities/edit_entity.html',
        activePage: 'agent'
      })
      .when('/agent/:agent_id/regex/add', {
        controller: 'AddRegexController as addentity',
        templateUrl: '/app/components/regex/add_regex.html',
        activePage: 'agent'
      })
      .when('/agent/:agent_id/regex/:regex_id', {
        controller: 'EditRegexController as editregex',
        templateUrl: '/app/components/regex/edit_regex.html',
        activePage: 'agent'
      })
      .when('/agent/:agent_id/synonym/:synonym_id', {
        controller: 'SynonymController',
        templateUrl: '/app/components/synonyms/edit_synonym.html',
        activePage: 'agent'
      })
      .when('/agent/:agent_id/synonyms/add', {
        controller: 'AddSynonymController',
        templateUrl: '/app/components/synonyms/add_synonym.html',
        activePage: 'agent'
      })
      .when('/rasaconfig', {
        controller: 'RasaConfigController',
        templateUrl: '/app/components/rasaconfig/rasa_config.html',
        activePage: 'config'
      })
      .when('/logs', {
        controller: 'LogsController',
        templateUrl: '/app/components/logs/logs.html',
        activePage: 'logs'
      })
      .when('/history', {
        controller: 'HistoryController',
        templateUrl: '/app/components/history/history.html',
        activePage: 'history'
      })
      .when('/conversation/:agent_id/:user_id', {
        //name: 'conversation',
        controller: 'ConversationController',
        templateUrl: '/app/components/conversation/conversation.html',
        activePage: 'history'
      })
      .when('/insights', {
        controller: 'InsightsController',
        templateUrl: '/app/components/insights/insights.html',
        activePage: 'insights'
      })
      .when('/training', {
        controller: 'TrainingController',
        templateUrl: '/app/components/training/training.html',
        activePage: 'training'
      })
      .when('/settings', {
        controller: 'SettingsController',
        templateUrl: '/app/components/settings/settings.html',
        activePage: 'settings'
      })
      .otherwise({ redirectTo: '/' });
  });
