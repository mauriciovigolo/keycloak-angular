Keycloak Angular
========================

# Requirements

1. Easy integration of Keycloak with Angular > v.4 apps.
1. Possibility to initialize in the beginning of the angular app start. [(APP_INITIALIZER)](https://angular.io/api/core/APP_INITIALIZER).
1. Get the init information from default keycloak.json location or in custom path.
1. Init in lazy mode, so the user can navigate in public pages, for example: landing pages. In this mode when a restricted resource will be accessed, it should take the login process.
1. Should deal with authorizations.
1. First version will only consider the Authorization Code flow.
1. Should properly return user infos.