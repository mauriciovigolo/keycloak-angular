# Keycloak Angular

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/mauriciovigolo/keycloak-angular.svg?branch=master)](https://travis-ci.org/mauriciovigolo/keycloak-angular)
[![Known Vulnerabilities](https://snyk.io/test/github/mauriciovigolo/keycloak-angular/badge.svg)](https://snyk.io/test/github/mauriciovigolo/keycloak-angular)
[![npm version](https://badge.fury.io/js/keycloak-angular.svg)](https://badge.fury.io/js/keycloak-angular)
![npm](https://img.shields.io/npm/dm/keycloak-angular.svg)
[![All Contributors](https://img.shields.io/badge/all_contributors-5-orange.svg?style=flat-square)](#contributors)
[![Slack](https://slackin-iijwrzzihr.now.sh/badge.svg)](https://slackin-iijwrzzihr.now.sh)

> Easy Keycloak setup for Angular applications.

---

- [About](#about)
- [Install](#install)
- [Setup](#setup)
  - [Angular](#angular)
  - [Keycloak](#keycloak)
- [AuthGuard](#authguard)
- [HttpClient Interceptor](#httpclient-interceptor)
- [Contributors](#contributors)
- [License](#license)

---

## About

This library helps you to use [keycloak-js](https://www.keycloak.org/docs/latest/securing_apps/index.html#_javascript_adapter) in Angular > v4.3 applications providing the following features:

- A **Keycloak Service** which wraps the keycloak-js methods to be used in Angular, giving extra
  functionalities to the original functions and adding new methods to make it easier to be consumed by
  Angular applications.
- Generic **AuthGuard implementation**, so you can customize your own AuthGuard logic inheriting the authentication logic and the roles load.
- A **HttpClient interceptor** that adds the authorization header to all HttpClient requests.
  It is also possible to disable this interceptor or exclude routes from having the authorization header.
- This documentation also assists you to configure the keycloak in your Angular applications and with
  the client setup in the admin console of your keycloak installation.

## Install

### keycloak-angular

```sh
npm i --save keycloak-angular
```

### keycloak-js

> Since keycloak-angular v.7.0.0, the [keycloak-js](https://www.npmjs.com/package/keycloak-js) dependency became a peer dependency. This change allows greater flexibility for choosing the keycloak-js adapter version and follows the [project documentation recommendation](https://www.keycloak.org/docs/latest/securing_apps/index.html#_javascript_adapter).

```sh
npm i --save keycloak-js@version
```

#### Choosing the keycloak-js version

The keycloak-js adapter documentation recommends to use the same version of your Keycloak / RH-SSO (Red Hat Single Sign On) installation.

> A best practice is to load the JavaScript adapter directly from Keycloak Server as it will automatically be updated when you upgrade the server. If you copy the adapter to your web application instead, make sure you upgrade the adapter only after you have upgraded the server.

## Setup

### Angular

The following topics explain two different ways to bootstrap the library and configure keycloak-angular. The first one is by using the APP_INITIALIZER token and the second option uses ngDoBootstrap. You will have to choose one of them.

#### Using APP_INITIALIZER

The KeycloakService can be initialized during the application loading, using the [APP_INITIALIZER](https://angular.io/api/core/APP_INITIALIZER) token.

##### AppModule

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

##### Initializer Function

This function can be named and placed in the way you think is most appropriate. In the
underneath example it was placed in a separate file `app-init.ts` and the function was called
`initializer`.

```js
import { KeycloakService } from 'keycloak-angular';

export function initializer(keycloak: KeycloakService): () => Promise<any> {
  return (): Promise<any> => keycloak.init();
}
```

#### Using ngDoBootstrap

The KeycloakService can be initialized before the application loading. When the Keycloak initialization is successful the application is bootstrapped.

This has two major benefits.

1. This is faster because the application isn't fully bootstrapped and
1. It prevents a moment when you see the application without having the authorization.

#### AppModule

```js
import { NgModule, DoBootstrap, ApplicationRef } from '@angular/core';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

const keycloakService = new KeycloakService();

@NgModule({
  imports: [KeycloakAngularModule],
  providers: [
    {
      provide: KeycloakService,
      useValue: keycloakService
    }
  ],
  entryComponents: [AppComponent]
})
export class AppModule implements DoBootstrap {
  ngDoBootstrap(appRef: ApplicationRef) {
    keycloakService
      .init()
      .then(() => {
        console.log('[ngDoBootstrap] bootstrap app');

        appRef.bootstrap(AppComponent);
      })
      .catch(error => console.error('[ngDoBootstrap] init Keycloak failed', error));
  }
}
```

### Keycloak

Besides configuring the keycloak lib in your application it is also necessary to setup the
access - scope for the **account** client.

In this documentation we assume that you already installed and configured your Keycloak
instance, as well created the client app.

**Hint:** If you need to create an environment for testing purposes, try out the [Keycloak demo](http://www.keycloak.org/downloads.html) or the official [keycloak docker image](https://hub.docker.com/r/jboss/keycloak/).

#### Client configuration

When requesting the method to get the User's Profile, the client app should have the scope and access to the account **view-profile** role. To do it, access **Clients** :arrow_right: **My-app** :arrow_right: **Scope**. Select the **account** app in Client Roles and assign the view-profile role.

![keycloak-account-scope](./docs/images/keycloak-account-scope.png)

Please be aware that when accessing the `https://keycloak/auth/realms/REALM/account` endpoint, if this role is not configured, a misleading `No 'Access-Control-Allow-Origin'` error might show up. If that happens, this role should be enough to fix it, no changes in the Web Origin of the account client is needed.

## AuthGuard

A generic AuthGuard, `KeycloakAuthGuard`, was created to help you bootstrap your security configuration and avoid duplicate code. This class already checks if the user is logged in and get the list of roles from the authenticated user, provided by the keycloak instance. In your implementation you just need to implement the desired security logic.

Example:

```js
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class CanAuthenticationGuard extends KeycloakAuthGuard implements CanActivate {
  constructor(protected router: Router, protected keycloakAngular: KeycloakService) {
    super(router, keycloakAngular);
  }

  isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.authenticated) {
        this.keycloakAngular.login()
          .catch(e => console.error(e));
        return reject(false);
      }

      const requiredRoles: string[] = route.data.roles;
      if (!requiredRoles || requiredRoles.length === 0) {
        return resolve(true);
      } else {
        if (!this.roles || this.roles.length === 0) {
          resolve(false);
        }
        resolve(requiredRoles.every(role => this.roles.indexOf(role) > -1));
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
    enableBearerInterceptor: true,
    bearerExcludedUrls: ['/assets', '/clients/public']
  });
  resolve();
} catch (error) {}
```

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore -->
 |[<img src="https://avatars3.githubusercontent.com/u/676270?v=4" width="100px;"/><br /><sub><b>Mauricio Gemelli Vigolo</b></sub>](https://github.com/mauriciovigolo)<br />|[<img src="https://avatars0.githubusercontent.com/u/2146903?v=4" width="100px;"/><br /><sub><b>Frederik Prijck</b></sub>](https://github.com/frederikprijck)<br /> | [<img src="https://avatars2.githubusercontent.com/u/161351?s=460&v=4" width="100px;"/><br /><sub><b>Jonathan Share</b></sub>](https://github.com/sharebear)<br /> | [<img src="https://avatars1.githubusercontent.com/u/980278?v=4" width="100px;"/><br /><sub><b>jmparra</b></sub>](https://github.com/jmparra)<br /> | [<img src="https://avatars2.githubusercontent.com/u/6547340?v=4" width="100px;"/><br /><sub><b>Marcel Német</b></sub>](https://github.com/marcelnem)<br /> | [<img src="https://avatars3.githubusercontent.com/u/14264577?v=4" width="100px;"/><br /><sub><b>Raphael Alex Silva Abreu</b></sub>](https://github.com/aelkz)<br /> |
| :---: | :---: | :---: | :---: | :---: | :---: |

<!-- ALL-CONTRIBUTORS-LIST:END -->

If you want to contribute to the project, please check out the [contributing](docs/CONTRIBUTING.md)
document.

## License

**keycloak-angular** is licensed under the **[MIT](LICENSE)**.

[keycloak-js](https://github.com/keycloak/keycloak-js-bower) is licensed under the **Apache 2.0**.
