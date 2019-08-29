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
      .when('/bots', {
        controller: 'BotsController as bot',
        templateUrl: '/app/components/bots/bots.html',
        activePage: 'bots'
      })
      .when('/bot/add', {
        controller: 'AddBotController as addbot',
        templateUrl: '/app/components/bots/add_bot.html',
        activePage: 'bots'
      })
      .when('/bot/import', {
        controller: 'ImportBotController as importbot',
        templateUrl: '/app/components/bots/import_bot.html',
        activePage: 'bots'
      })
      .when('/bot/:bot_id', {
        controller: 'EditBotController as editbot',
        templateUrl: '/app/components/bots/edit_bot.html',
        activePage: 'bot'
      })
      .when('/bot/:bot_id/action/edit/:action_id', {
        controller: 'ActionsController as actionsController',
        templateUrl: '/app/components/actions/actions.html',
        activePage: 'bot'
      })
      .when('/bot/:bot_id/intent/add', {
        controller: 'AddIntentController as addintent',
        templateUrl: '/app/components/intents/add_intent.html',
        activePage: 'bot'
      })
      .when('/bot/:bot_id/intent/:intent_id', {
        controller: 'EditIntentController as editintent',
        templateUrl: '/app/components/intents/edit_intent.html',
        activePage: 'intent'
      })
      .when('/bot/:bot_id/stories/', {
        controller: 'StoriesController as stories',
        templateUrl: '/app/components/stories/stories.html',
        activePage: 'stories'
      })
      .when('/entities', {
        controller: 'EntitiesController as entity',
        templateUrl: '/app/components/entities/entities.html',
        activePage: 'entities'
      })
      .when('/bot/:bot_id/entity/add', {
        controller: 'AddEntityController as addentity',
        templateUrl: '/app/components/entities/add_entity.html',
        activePage: 'entities'
      })
      .when('/bot/:bot_id/entity/:entity_id', {
        controller: 'EntityController as entity',
        templateUrl: '/app/components/entities/edit_entity.html',
        activePage: 'bot'
      })
      .when('/bot/:bot_id/regex/add', {
        controller: 'AddRegexController as addentity',
        templateUrl: '/app/components/regex/add_regex.html',
        activePage: 'bot'
      })
      .when('/bot/:bot_id/regex/:regex_id', {
        controller: 'EditRegexController as editregex',
        templateUrl: '/app/components/regex/edit_regex.html',
        activePage: 'bot'
      })
      .when('/bot/:bot_id/synonym/:synonym_id', {
        controller: 'SynonymController',
        templateUrl: '/app/components/synonyms/edit_synonym.html',
        activePage: 'bot'
      })
      .when('/bot/:bot_id/synonyms/add', {
        controller: 'AddSynonymController',
        templateUrl: '/app/components/synonyms/add_synonym.html',
        activePage: 'bot'
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
      .when('/conversation/:bot_id/:user_id', {
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
      .when('/models/:bot_id', {
        controller: 'ModelController',
        templateUrl: '/app/components/models/models.html',
        activePage: 'models'
      })
      .when('/models', {
        controller: 'ModelController',
        templateUrl: '/app/components/models/models.html',
        activePage: 'models'
      })
      .when('/models/:bot_id/add', {
        controller: 'AddModelController',
        templateUrl: '/app/components/models/add_model.html',
        activePage: 'models'
      })
      .when('/chat/:bot_id', {
        controller: 'ChatController',
        templateUrl: '/app/components/chat/chat.html',
        activePage: 'chat'
      })
      .when('/chat', {
        controller: 'ChatController',
        templateUrl: '/app/components/chat/chat.html',
        activePage: 'chat'
      })
      .when('/stories', {
        controller: 'StoriesController',
        templateUrl: '/app/components/stories/stories.html',
        activePage: 'stories'
      })
      .when('/stories/:bot_id', {
        controller: 'StoriesController',
        templateUrl: '/app/components/stories/stories.html',
        activePage: 'stories'
      })
      .when('/responses', {
        controller: 'ResponseController',
        templateUrl: '/app/components/responses/responses.html',
        activePage: 'responses'
      })
      .when('/responses/:bot_id', {
        controller: 'ResponseController',
        templateUrl: '/app/components/responses/responses.html',
        activePage: 'responses'
      })
      .when('/responses/:bot_id/add', {
        controller: 'AddActionController',
        templateUrl: '/app/components/responses/add_action.html',
        activePage: 'responses'
      })
      .when('/stories/:bot_id', {
        controller: 'StoriesController',
        templateUrl: '/app/components/stories/stories.html',
        activePage: 'stories'
      })
      .otherwise({ redirectTo: '/' });
  });
