app.config(function(
  $routeProvider,
  adalAuthenticationServiceProvider,
  appConfig,
  $httpProvider,
  $locationProvider
) {
  adalAuthenticationServiceProvider.init(
    {
      anonymousEndpoints: [],
      instance: "https://login.microsoftonline.com/",
      tenant: appConfig.azureadtenantid,
      clientId: appConfig.azureddclientid,
      //cacheLocation: 'localStorage',
      postLogoutRedirectUri: window.location.origin
    },
    $httpProvider
  );

  $locationProvider.html5Mode({
    enabled: false,
    //requireBase: false
  }).hashPrefix('');


  $routeProvider
    .when("/", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "DashboardController as dashboard",
      templateUrl: "/app/components/dashboard/dashboard.html",
      activePage: "dashboard"
    })
    .when("/login", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "LoginController",
      templateUrl: "/app/components/login/login.html",
      activePage: "login"
    })
    .when("/dashboard", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "DashboardController as dashboard",
      templateUrl: "/app/components/dashboard/dashboard.html",
      activePage: "dashboard"
    })
    .when("/agents", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "AgentsController as agent",
      templateUrl: "/app/components/agents/agents.html",
      activePage: "agents"
    })
    .when("/agent/add", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "AddAgentController as addagent",
      templateUrl: "/app/components/agents/add_agent.html",
      activePage: "agents"
    })
    .when("/agent/import", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "ImportAgentController as importagent",
      templateUrl: "/app/components/agents/import_agent.html",
      activePage: "agents"
    })
    .when("/agent/:agent_id", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "EditAgentController as editagent",
      templateUrl: "/app/components/agents/edit_agent.html",
      activePage: "agents"
    })
    .when("/agent/:agent_id/action/edit/:action_id", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "ActionsController as actionsController",
      templateUrl: "/app/components/actions/actions.html",
      activePage: "agents"
    })
    .when("/agent/:agent_id/intent/add", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "AddIntentController as addintent",
      templateUrl: "/app/components/intents/add_intent.html",
      activePage: "agents"
    })
    .when("/agent/:agent_id/intent/:intent_id", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "EditIntentController as editintent",
      templateUrl: "/app/components/intents/edit_intent.html",
      activePage: "agents"
    })
    .when("/agent/:agent_id/stories/", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "StoriesController as stories",
      templateUrl: "/app/components/stories/stories.html",
      activePage: "stories"
    })
    .when("/entities", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "EntitiesController as entity",
      templateUrl: "/app/components/entities/entities.html",
      activePage: "entities"
    })
    .when("/agent/:agent_id/entity/add", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "AddEntityController as addentity",
      templateUrl: "/app/components/entities/add_entity.html",
      activePage: "entities"
    })
    .when("/regex", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "RegexController as regex",
      templateUrl: "/app/components/regex/regex.html",
      activePage: "regex"
    })
    .when("/regex/add", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "AddRegexController as addentity",
      templateUrl: "/app/components/regex/add_regex.html",
      activePage: "regex"
    })
    .when("/regex/:regex_id", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "EditRegexController as editregex",
      templateUrl: "/app/components/regex/edit_regex.html",
      activePage: "regex"
    })
    .when("/agent/:agent_id/entity/:entity_id/synonyms", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "SynonymController",
      templateUrl: "/app/components/synonyms/synonyms.html",
      activePage: "entities"
    })
    .when("/rasaconfig", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "RasaConfigController",
      templateUrl: "/app/components/rasaconfig/rasa_config.html",
      activePage: "config"
    })
    .when("/logs", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "LogsController",
      templateUrl: "/app/components/logs/logs.html",
      activePage: "logs"
    })
    .when("/history", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "HistoryController",
      templateUrl: "/app/components/history/history.html",
      activePage: "history"
    })
    .when("/conversation/:agent_id/:user_id", {
      requireADLogin: appConfig.azureadauthentication,
      name: "conversation",
      controller: "ConversationController",
      templateUrl: "/app/components/conversation/conversation.html",
      activePage: "history"
    })
    .when("/insights", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "InsightsController",
      templateUrl: "/app/components/insights/insights.html",
      activePage: "insights"
    })
    .when("/training", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "TrainingController",
      templateUrl: "/app/components/training/training.html",
      activePage: "training"
    })
    .when("/settings", {
      requireADLogin: appConfig.azureadauthentication,
      controller: "SettingsController",
      templateUrl: "/app/components/settings/settings.html",
      activePage: "settings"
    })
    .otherwise({
      redirectTo: "/"
    });
});
