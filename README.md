# Keycloak Angular

[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Slack](https://slackin-iijwrzzihr.now.sh/badge.svg)](https://slackin-iijwrzzihr.now.sh)
[![npm version](https://badge.fury.io/js/keycloak-angular.svg)](https://badge.fury.io/js/keycloak-angular)
[![Build Status](https://travis-ci.org/mauriciovigolo/keycloak-angular.svg?branch=master)](https://travis-ci.org/mauriciovigolo/keycloak-angular)
[![Dependencies](https://david-dm.org/mauriciovigolo/keycloak-angular/status.svg)](https://david-dm.org/mauriciovigolo/keycloak-angular)
[![DepDependencies](https://david-dm.org/mauriciovigolo/keycloak-angular/dev-status.svg)](https://david-dm.org/mauriciovigolo/keycloak-angular?type=dev)

[Keycloak-js](https://github.com/keycloak/keycloak-js-bower) port for Angular > v4.3 applications.

![alt text](https://github.com/mauriciovigolo/keycloak-angular/blob/master/docs/images/keycloak-angular.png 'Keycloak Angular')

---

* [About](#about)
* [Install](#install)
* [Setup](#setup)
  * [Angular](#angular)
  * [Keycloak](#keycloak)
* [AuthGuard](#authguard)
* [HttpClient Interceptor](#httpclient-interceptor)
* [Contributing](#contributing)
* [License](#license)

---

## About

This library helps you to use [keycloak-js](https://github.com/keycloak/keycloak-js-bower) in Angular > v4.3 applications providing the following features:

* A **Keycloak Service** which wraps the keycloak-js methods to be used in Angular, giving extra
  functionalities to the original functions and adding new methods to make it easier to be consumed by
  Angular applications.
* Generic **AuthGuard implementation**, so you can customize your own AuthGuard logic inheriting the authentication logic and the roles load.
* A **HttpClient interceptor** that adds the authorization header to all HttpClient requests.
  It is also possible to exclude routes from having the authorization header.
* This documentation also assists you to configure the keycloak in the Angular applications and with
  the client setup in the admin console of your keycloak installation.

## Install

**Attention**: This library will work only with versions higher or equal than 4.3.0 of Angular. The reason for this is that we are using Interceptor from `@angular/common/http` package.

In your angular application directory:

With npm:

```sh
npm install --save keycloak-angular
```

With yarn:

```sh
yarn add keycloak-angular
```

## Setup

### Angular

The KeycloakService should be initialized during the application loading, using the [APP_INITIALIZER](https://angular.io/api/core/APP_INITIALIZER) token.

#### AppModule

```js
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { KeycloakService, KeycloakAngularModule } from 'keycloak-angular';
import { initializer } from './utils/app-init';

@NgModule({
  imports: [KeycloakAngularModule],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializer,
      multi: true,
      deps: [KeycloakService]
    }
  ]
})
export class AppModule {}
```

* **Notice** that the KeycloakAngularModule was imported by the AppModule. For this reason you don't need to insert the KeycloakService in the AppModule providers array.

#### initializer Function

This function can be named and placed in the way you think is most appropriate. The
underneath example was put in a separate file `app-init.ts` and the function called
`initializer`.

```js
import { KeycloakService } from 'keycloak-angular';

export function initializer(keycloak: KeycloakService): () => Promise<any> {
  return (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        await keycloak.init();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };
}
```

### Keycloak

Besides configuring the keycloak lib in your application it is also necessary to setup the
access - scope for the **account** client.

In this documentation we suppose that you already installed and configured your Keycloak
instance, as well created the client app.

**Hint:** If you need to create an environment for testing purposes, try out the [Keycloak demo](http://www.keycloak.org/downloads.html).

#### Client configuration

When requesting the method to get the User's Profile, the client app should have the scope and access to the account **view-profile** role. To do it, access **Clients** :arrow_right: **My-app** :arrow_right: **Scope**. Select the **account** app in Client Roles and assign the view-profile role.

![keycloak-account-scope](./docs/images/keycloak-account-scope.png)

## AuthGuard

A generic AuthGuard, `KeycloakAuthGuard`, was created to help you bootstrap your security configuration and avoid duplicate code. This class already checks if the user is logged in and get the list of roles from the authenticated user, provided by the keycloak instance. In your implementation you just need to implement the desired security logic.

Example:

```js
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { KeycloakService, KeycloakAuthGuard } from 'keycloak-angular';

@Injectable()
export class AppAuthGuard extends KeycloakAuthGuard {
  constructor(protected router: Router, protected keycloakAngular: KeycloakService) {
    super(router, keycloakAngular);
  }

  isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      if (!this.authenticated) {
        this.keycloakAngular.login();
        return;
      }

      const requiredRoles = route.data.roles;
      if (!requiredRoles || requiredRoles.length === 0) {
        return resolve(true);
      } else {
        if (!this.roles || this.roles.length === 0) {
          resolve(false);
        }
        let granted: boolean = false;
        for (const requiredRole of requiredRoles) {
          if (this.roles.indexOf(requiredRole) > -1) {
            granted = true;
            break;
          }
        }
        resolve(granted);
      }
    });
  }
}
```

## HttpClient Interceptor

By default all HttpClient requests will add the Authorization header in the format of: Authorization: Bearer **_TOKEN_**.

There is also the possibility to exclude a list of URLs that should not have the authorization header. The excluded list must be informed in the keycloak initialization. For example:

```js
 try {
  await keycloak.init({
    config: {
      url: 'http://localhost:8080/auth',
      realm: 'your-realm',
      clientId: 'client-id'
    },
    initOptions: {
      onLoad: 'login-required',
      checkLoginIframe: false
    },
    bearerExcludedUrls: [
      '/assets',
      '/clients/public'
    ],
  });
  resolve();
} catch (error) {}
```

## HttpClient RPT Interceptor

It is possbile to activate RPT interceptor which adds RPT (requesting party token) to all HttpClient requests. Set `enableAuthorization` to true to enable the RPT Interceptor. The RPT will be added into Authorization header in the format of: Authorization: Bearer **_RPT_**. In this case the bearer token interceptor can be deactivated by setting `bearerExcludedUrls` to exclude all paths (see example below).

By default the RPT Interceptor uses the UMA (v2) API to support resource servers with UMA enabled policy enforcer. RPT Interceptor works with UMA 2 shipped with Keycloak 4.0.0 Beta1.

There is also the possibility to exclude a list of URLs that should not have the RPT added (it probably makes sense to only add RPT token to HTTP requests sent to resource server and to exclude requests going to keycloak server). For example:

```js
 try {
  await keycloak.init({
    config: {
      url: 'http://localhost:8080/auth',
      realm: 'your-realm',
      clientId: 'client-id'
    },
    initOptions: {
      onLoad: 'login-required',
      checkLoginIframe: false
    },
    bearerExcludedUrls: ["/"],
    enableAuthorization: true,
    rptExcludedUrls: ["/auth"]
  });
  resolve();
} catch (error) {}
```

#### Entitlement API

It is also possible to use the RPT interceptor with the Resource server which do not have UMA activated. Then the RPT Interceptor uses entitlement API to obtain RPT.

For example:

```js
 try {
  await keycloak.init({
    config: {
      url: 'http://localhost:8080/auth',
      realm: 'your-realm',
      clientId: 'client-id'
    },
    initOptions: {
      onLoad: 'login-required',
      checkLoginIframe: false
    },
    bearerExcludedUrls: ["/"],
    enableAuthorization: true,
    rptExcludedUrls: ["/auth"],
    resourceServerID: "resource-server-id",
    resourceServerAuthorizationType: "entitlement"
  });
  resolve();
} catch (error) {}
```

#### Authorization Request Template

It is possible to specify additional parameters for all authorization requests as described in https://www.keycloak.org/docs/latest/authorization_services/index.html#authorization-request.

Note that UMA and Entitlement APIs support different parameters. 

For example to reduce permissions in the RPT obtained from Entitlement API:

```js
 try {
  await keycloak.init({
    config: {
      url: 'http://localhost:8080/auth',
      realm: 'your-realm',
      clientId: 'client-id'
    },
    initOptions: {
      onLoad: 'login-required',
      checkLoginIframe: false
    },
    bearerExcludedUrls: ["/"],
    enableAuthorization: true,
    rptExcludedUrls: ["/auth"],
    resourceServerID: "resource-server-id",
    resourceServerAuthorizationType: "entitlement",
    authorizationRequestTemplate: {
      permissions: [
        {
          id: 'Some Resource',
          scopes: ['view', 'edit']
        }
      ]
  }
  });
  resolve();
} catch (error) {}
```

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

If you want to contribute to the project, please check out the [contributing](CONTRIBUTING.md)
document.

## License

MIT
