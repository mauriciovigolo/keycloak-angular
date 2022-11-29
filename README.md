# Keycloak Angular

<!-- prettier-ignore-start -->
[![License: MIT][license-mit-badge]][license-mit]
[![Build Status][build-badge]][build]
[![Known Vulnerabilities][vulnerabilities-badge]][vulnerabilities]
[![npm version][npm-version-badge]][npm]
[![npm][npm-badge]][npm]
[![Discord][discord-badge]][discord]
<!-- prettier-ignore-end -->

> Easy Keycloak setup for Angular applications.

---

- [About](#about)
- [Installation](#installation)
- [Setup](#setup)
- [Example project](#example-project)
- [AuthGuard](#authguard)
- [HttpClient Interceptor](#httpclient-interceptor)
- [Keycloak-js Events](#keycloak-js-events)
- [Contributors](#contributors)
- [License](#license)

---

## About

This library helps you to use [keycloak-js](https://www.keycloak.org/docs/latest/securing_apps/index.html#_javascript_adapter) in Angular applications providing the following features:

- A **Keycloak Service** which wraps the `keycloak-js` methods to be used in Angular, giving extra
  functionalities to the original functions and adding new methods to make it easier to be consumed by
  Angular applications.
- Generic **AuthGuard implementation**, so you can customize your own AuthGuard logic inheriting the authentication logic and the roles load.
- A **HttpClient interceptor** that adds the authorization header to all HttpClient requests.
  It is also possible to disable this interceptor or exclude routes from having the authorization header.
- This documentation also assists you to configure the keycloak in your Angular applications and with
  the client setup in the admin console of your keycloak installation.

## Installation

Run the following command to install both Keycloak Angular and the official Keycloak client library:

```sh
npm install keycloak-angular keycloak-js
```

Note that `keycloak-js` is a peer dependency of Keycloak Angular. This change allows greater flexibility of choosing the right version of the Keycloak client version for your project.

### Versions

| Angular | keycloak-js | keycloak-angular |       Support       |
| :-----: | :---------: | :--------------: | :-----------------: |
|  15.x   |   18 - 20   |      13.x.x      | New Features / Bugs |
|  14.x   |   18 - 19   |      12.x.x      |        Bugs         |
|  14.x   |   10 - 17   |      11.x.x      |          -          |
|  13.x   |     18      |      10.x.x      |          -          |
|  13.x   |   10 - 17   |      9.x.x       |          -          |

Only the latest version of Angular in the table above is actively supported. This is due to the fact that compilation of Angular libraries is [incompatible between major versions](https://angular.io/guide/creating-libraries#ensuring-library-version-compatibility).

_Note_: Only for keycloak-angular **v.9**, there is the need to add `allowSyntheticDefaultImports: true` in the tsconfig.json file in your project. This is related to this [issue in the keycloak project](https://github.com/keycloak/keycloak/issues/9045). From keycloak-angular v.10 on, there is no need to set this configuration.

#### Choosing the right keycloak-js version

The Keycloak client documentation recommends to use the same version of your Keycloak installation.

> A best practice is to load the JavaScript adapter directly from Keycloak Server as it will automatically be updated when you upgrade the server. If you copy the adapter to your web application instead, make sure you upgrade the adapter only after you have upgraded the server.

## Setup

In order to make sure Keycloak is initialized when your application is bootstrapped you will have to add an `APP_INITIALIZER` provider to your `AppModule`. This provider will call the `initializeKeycloak` factory function shown below which will set up the Keycloak service so that it can be used in your application.

Use the code provided below as an example and implement it's functionality in your application. In this process ensure that the configuration you are providing matches that of your client as configured in Keycloak.

```ts
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'http://localhost:8080',
        realm: 'your-realm',
        clientId: 'your-client-id'
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/assets/silent-check-sso.html'
      }
    });
}

@NgModule({
  declarations: [AppComponent],
  imports: [AppRoutingModule, BrowserModule, KeycloakAngularModule],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

In the example we have set up Keycloak to use a silent `check-sso`. With this feature enabled, your browser will not do a full redirect to the Keycloak server and back to your application, instead this action will be performed in a hidden iframe, so your application resources only need to be loaded and parsed once by the browser when the app is initialized and not again after the redirect back from Keycloak to your app.

To ensure that Keycloak can communicate through the iframe you will have to serve a static HTML asset from your application at the location provided in `silentCheckSsoRedirectUri`.

Create a file called `silent-check-sso.html` in the `assets` directory of your application and paste in the contents as seen below.

```html
<html>
  <body>
    <script>
      parent.postMessage(location.href, location.origin);
    </script>
  </body>
</html>
```

If you want to know more about these options and various other capabilities of the Keycloak client is recommended to read the [JavaScript Adapter documentation](https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter).

## Example project

If you want to see a complete overview a pre-configured client together with a working Keycloak server make sure to check out the [example project](projects/example/README.md) in this repository.

## AuthGuard

A generic AuthGuard, `KeycloakAuthGuard` is provided to help you protect authenticated routes in your application. This guard provides you with information to see if the user is logged in and a list of roles from that belong to the user. In your implementation you just need to implement the desired logic to protect your routes.

To write your own implementation extend the `KeycloakAuthGuard` class and implement the `isAccessAllowed` method. For example the code provided below checks if the user is authenticated and if not the user is requested to sign in. It also checks if the user has the correct roles which could be provided by passing the `roles` field into the data of the route.

```ts
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard extends KeycloakAuthGuard {
  constructor(
    protected readonly router: Router,
    protected readonly keycloak: KeycloakService
  ) {
    super(router, keycloak);
  }

  public async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    // Force the user to log in if currently unauthenticated.
    if (!this.authenticated) {
      await this.keycloak.login({
        redirectUri: window.location.origin + state.url
      });
    }

    // Get the roles required from the route.
    const requiredRoles = route.data.roles;

    // Allow the user to proceed if no additional roles are required to access the route.
    if (!(requiredRoles instanceof Array) || requiredRoles.length === 0) {
      return true;
    }

    // Allow the user to proceed if all the required roles are present.
    return requiredRoles.every((role) => this.roles.includes(role));
  }
}
```

## HttpClient Interceptor

By default, all HttpClient requests will add the Authorization header in the format of: `Authorization: Bearer **_TOKEN_**`.

There is also the possibility to exclude requests that should not have the authorization header. This is accomplished by implementing the `shouldAddToken` method in the keycloak initialization. For example, the configuration below will not add the token to `GET` requests that match the paths `/assets` or `/clients/public`:

```ts
await keycloak.init({
  config: {
    url: 'http://localhost:8080',
    realm: 'your-realm',
    clientId: 'your-client-id'
  },
  initOptions: {
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri:
      window.location.origin + '/assets/silent-check-sso.html'
  },
  shouldAddToken: (request) => {
    const { method, url } = request;

    const isGetRequest = 'GET' === method.toUpperCase();
    const acceptablePaths = ['/assets', '/clients/public'];
    const isAcceptablePathMatch = urls.some((path) => url.includes(path));

    return !(isGetRequest && isAcceptablePathMatch);
  }
});
```

In the case where your application frequently polls an authenticated endpoint, you will find that users will not be logged out automatically over time. If that functionality is not desirable, you can add an http header to the polling requests then configure the `shouldUpdateToken` option in the keycloak initialization.

In the example below, any http requests with the header `token-update: false` will not trigger the user's keycloak token to be updated.

```ts
await keycloak.init({
  config: {
    url: 'http://localhost:8080',
    realm: 'your-realm',
    clientId: 'your-client-id'
  },
  initOptions: {
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri:
      window.location.origin + '/assets/silent-check-sso.html'
  },
  bearerExcludedUrls: ['/assets', '/clients/public'],
  shouldUpdateToken: (request) => {
    return !request.headers.get('token-update') === 'false';
  }
});
```

## Keycloak-js Events

The callback events from [keycloak-js](https://www.keycloak.org/docs/latest/securing_apps/index.html#javascript-adapter-reference) are available through a RxJS subject which is defined by `keycloakEvents$`.

For example you make keycloak-angular auto refreshing your access token when expired:

```ts
keycloakService.keycloakEvents$.subscribe({
  next: (e) => {
    if (e.type == KeycloakEventType.OnTokenExpired) {
      keycloakService.updateToken(20);
    }
  }
});
```

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore -->
 |[<img src="https://avatars3.githubusercontent.com/u/676270?v=4" width="89px;"/><br /><sub><b>Mauricio Vigolo</b></sub>](https://github.com/mauriciovigolo)<br />|[<img src="https://avatars1.githubusercontent.com/u/695720?s=400&v=4" width="89px;"/><br /><sub><b>Jon Koops</b></sub>](https://github.com/https://github.com/jonkoops)<br />|
| :---: | :---: |

<!-- ALL-CONTRIBUTORS-LIST:END -->

If you want to contribute to the project, please check out the [contributing](CONTRIBUTING.md)
document.

## License

**keycloak-angular** is licensed under the **[MIT license](LICENSE)**.

<!-- prettier-ignore-start -->
[license-mit-badge]: https://img.shields.io/badge/License-MIT-yellow
[license-mit]: https://opensource.org/licenses/MIT
[build-badge]: https://img.shields.io/github/workflow/status/mauriciovigolo/keycloak-angular/CI?label=CI&logo=github
[build]: https://github.com/mauriciovigolo/keycloak-angular/actions/workflows/main.yml
[vulnerabilities-badge]: https://img.shields.io/snyk/vulnerabilities/github/mauriciovigolo/keycloak-angular?logo=snyk
[vulnerabilities]: https://snyk.io/test/github/mauriciovigolo/keycloak-angular
[npm-version-badge]: https://img.shields.io/npm/v/keycloak-angular
[npm-badge]: https://img.shields.io/npm/dm/keycloak-angular
[npm]: https://www.npmjs.com/package/keycloak-angular
[contributors-badge]: https://img.shields.io/badge/all_contributors-5-orange
[discord-badge]: https://img.shields.io/discord/790617227853692958?color=7389d8&labelColor=6a7ec2&logo=discord&logoColor=fff
[discord]: https://discord.gg/mmzEhYXXDG
<!-- prettier-ignore-end -->
