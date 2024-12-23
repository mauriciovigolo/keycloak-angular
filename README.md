# Keycloak Angular

<!-- prettier-ignore-start -->
[![License: MIT][license-mit-badge]][license-mit]
[![Build Status][build-badge]][build]
[![Known Vulnerabilities][vulnerabilities-badge]][vulnerabilities]
[![npm version][npm-version-badge]][npm]
[![npm][npm-badge]][npm]
<!-- prettier-ignore-end -->

> Easy Keycloak integration for Angular applications.

---

- [About](#about)
- [Installation](#installation)
- [Setup](#setup)
- [Example project](#example-project)
- [Keycloak Angular Features](#Keycloak-angular-features)
- [Guards](#guards)
- [HttpClient Interceptors](#httpclient-interceptors)
- [Directives](#directives)
- [Keycloak Events Signal](#keycloak-events-signal)
- [Contributors](#contributors)
- [License](#license)

---

## About

`Keycloak-Angular` is a library that makes it easier to use [keycloak-js](https://www.keycloak.org/docs/latest/securing_apps/index.html#_javascript_adapter) in Angular applications. It provides the following features:

- **Easy Initialization**: Use the `provideKeycloak` function to set up and initialize a Keycloak instance with `provideAppInitializer`. This simplifies the setup process.
- **Angular DI Support**: The Keycloak client instance can be injected directly into Angular components, services, and other parts of your app. There’s no need to create a custom service to wrap the client.
- **HTTP Interceptors**: Add the Bearer token to the `Authorization` header with built-in interceptors. These are modular and easy to configure using injection tokens. You can also create your own interceptors with provided helper functions.
- **Keycloak Events as Signals**: Access Keycloak events easily using Angular Signals, provided through the `KEYCLOAK_EVENT_SIGNAL` injection token.
- **Automatic Token Refresh**: Use the `withAutoRefreshToken` feature to automatically refresh tokens when they expire, considering the user activity and a sessionTimeout.
- **Custom Route Guards**: Use the `createAuthGuard` factory to build guards for `CanActivate` and `CanActivateChild`, helping you secure routes with custom logic.
- **Role-Based Rendering**: The `*kaHasRoles` directive lets you show or hide parts of the DOM based on the user’s resource or realm roles.

## Installation

Run the following command to install both Keycloak Angular and the official Keycloak client library:

```sh
npm install keycloak-angular keycloak-js
```

Note that `keycloak-js` is a peer dependency of `keycloak-angular`. This allows greater flexibility of choosing the right version of the Keycloak client for your project.

### Versions

| Angular | keycloak-js | keycloak-angular |       Support       |
| :-----: | :---------: | :--------------: | :-----------------: |
|  19.x   |   18 - 26   |      19.x.x      | New Features / Bugs |
|  18.x   |   18 - 26   |      16.x.x      |        Bugs         |
|  17.x   |   18 - 25   |      15.x.x      |          -          |
|  16.x   |   18 - 25   |      14.x.x      |          -          |
|  15.x   |   18 - 21   |      13.x.x      |          -          |

> 1. Only the latest version of Angular listed in the table above is actively supported. This is because the compilation of Angular libraries can be [incompatible between major versions](https://angular.io/guide/creating-libraries#ensuring-library-version-compatibility).
> 2. Starting with Angular v19, Keycloak-Angular will adopt the same **major** version numbering as Angular, making it easier to identify the correct version to use.

#### Choosing the right keycloak-js version

The Keycloak client documentation recommends to use the same version of your Keycloak server installation.

## Setup

To initialize Keycloak, add `provideKeycloak` to the `providers` array in the `ApplicationConfig` object (e.g., in `app.config.ts`). If `initOptions` is included, `keycloak-angular` will automatically use `provideAppInitializer` to handle initialization, following the recommended approach for starting dependencies.

Use the example code below as a guide for your application.

```ts
import { provideRouter } from '@angular/router';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideKeycloak } from 'keycloak-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloak({
      config: {
        url: 'keycloak-server-url',
        realm: 'realm-id',
        clientId: 'client-id'
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
      }
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};
```

> **Important:**
>
> 1. You do not need to call `provideAppInitializer` if `initOptions` is provided. The library handles this automatically.
> 2. If you need to control when `keycloak.init` is called, do not pass the `initOptions` to the `provideKeycloak` function. In this case, you are responsible for calling `keycloak.init` manually.
> 3. For reference, Angular's `APP_INITIALIZER` is deprecated. The recommended approach is to use `provideAppInitializer`.

In the example, Keycloak is configured to use a silent `check-sso`. With this feature enabled, your browser avoids a full redirect to the Keycloak server and back to your application. Instead, this action is performed in a hidden iframe, allowing your application resources to be loaded and parsed only once during initialization, rather than reloading after a redirect.

To enable communication through the iframe, you need to serve a static HTML file from your application at the location specified in `silentCheckSsoRedirectUri`.

Create a file named `silent-check-sso.html` in the `public` or `assets` directory of your application and paste in the content shown below.

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

> **Note About NgModules:**
> Since Keycloak-Angular v19, the KeycloakAngularModule, KeycloakService, KeycloakBearerInterceptor and KeycloakAuthGuard are deprecated.
> If your application relies on NgModules, the library still has support for it. See more information on how to configure a [NgModule the application](https://github.com/mauriciovigolo/keycloak-angular/docs/ngmodule.md).

**Additional Resources**
For more details, refer to the [provideKeycloak](https://github.com/mauriciovigolo/keycloak-angular/blob/main/docs/provide.md) documentation.

## Example project

If you want to see a complete overview a pre-configured client together with a working Keycloak server make sure to check out the [standalone example project](projects/examples/standalone/README.md) in this repository.

## Keycloak Angular Features

Keycloak Angular Features enhance the library's capabilities and make it more modular and composable. These features are executed during application initialization and have access to Angular's Dependency Injection (DI) context. While there is currently only one feature available, more features will be introduced over time to address new scenarios and expand functionality.

### Usage

The example below adds the `withAutoRefreshToken` feature to Keycloak Angular. Note that this feature depends on two services provided by Keycloak Angular, which are: `AutoRefreshTokenService` and `UserActivityService`.

```ts
import { provideKeycloak, withAutoRefreshToken, AutoRefreshTokenService, UserActivityService } from 'keycloak-angular';

export const provideKeycloakAngular = () =>
  provideKeycloak({
    config: {
      url: 'keycloak-server-url',
      realm: 'realm-id',
      clientId: 'client-id'
    },
    initOptions: {
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
    },
    features: [
      withAutoRefreshToken({
        onInactivityTimeout: 'logout',
        sessionTimeout: 60000
      })
    ],
    providers: [AutoRefreshTokenService, UserActivityService]
  });

export const appConfig: ApplicationConfig = {
  providers: [provideKeycloakAngular(), provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
};
```

## Guards

The `createAuthGuard` function is a higher-order function that simplifies the creation of guards relying on Keycloak data. It can be used to create `CanActivateFn` or `CanActivateChildFn` guards to protect the routes in your application.

### Usage:

```ts
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';

const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  _: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles } = authData;

  const requiredRole = route.data['role'];
  if (!requiredRole) {
    return false;
  }

  const hasRequiredRole = (role: string): boolean =>
    Object.values(grantedRoles.resourceRoles).some((roles) => roles.includes(role));

  if (authenticated && hasRequiredRole(requiredRole)) {
    return true;
  }

  const router = inject(Router);
  return router.parseUrl('/forbidden');
};

export const canActivateAuthRole = createAuthGuard<CanActivateFn>(isAccessAllowed);
```

The `canActivateAuthRole` can be used in the route configuration to protect specific routes.

```ts
import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { BooksComponent } from './components/books/books.component';
import { canActivateAuthRole } from './guards/auth-role.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'books',
    component: BooksComponent,
    canActivate: [canActivateAuthRole],
    data: { role: 'view-books' }
  }
];
```

## HttpClient Interceptors

Keycloak Angular provides `HttpClient` interceptors for managing the Bearer Token in the HTTP request header.

> By default, the library **does not** add the Bearer token to requests. It is the application's responsibility to configure and use the appropriate interceptors.
>
> **Important:** This behavior is a significant change from previous versions of the library. The new approach is more declarative, secure, extendable and configurable. There are no services directly interacting with interceptors anymore. All configurations are handled within the interceptor itself.

### Usage:

```ts
import { provideRouter } from '@angular/router';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  provideKeycloak,
  createInterceptorCondition,
  IncludeBearerTokenCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG
} from 'keycloak-angular';

import { routes } from './app.routes';

const urlCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: /^(http:\/\/localhost:8181)(\/.*)?$/i,
  bearerPrefix: 'Bearer'
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloak({
      config: {
        url: 'keycloak-server-url',
        realm: 'realm-id',
        clientId: 'client-id'
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
      }
    }),
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [urlCondition] // <-- Note that multiple conditions might be added.
    },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor]))
  ]
};
```

**Additional Resources**
For more details on the available interceptors and their configurations, refer to the [Keycloak HttpClient Interceptors](https://github.com/mauriciovigolo/keycloak-angular/blob/main/docs/interceptors.md) documentation.

## Directives

The library offers the `*kaHasRoles` structural directive to evaluate if the user has the required Realm or Resource Roles to render or not to render a DOM.

### Usage

In the component, add the `HasRolesDirective` in the imports list.

```ts
@Component({
  selector: 'app-menu',
  imports: [RouterModule, HasRolesDirective],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {}
```

```html
<nav class="menu">
  <div class="developer-status"><strong>Keycloak Events:</strong> {{ keycloakStatus }}</div>

  <div class="actions">
    <a routerLink="/" class="action-item">Home</a>
    <a routerLink="/books" class="action-item" *kaHasRoles="['view-books']">My Books</a>
  </div>
</nav>
```

> **Note:**  
> If no resource is specified in `*kaHasRoles="['view-books']"`, the default resource used will be the Keycloak application client ID.

## Keycloak Events Signal

Keycloak Angular provides a Signal that allows Angular applications to easily react to `keycloak-js` authorization and session events.

This Signal is created during the library's initialization and is available without any additional configuration. It can be accessed by injecting the `KEYCLOAK_EVENT_SIGNAL` injection token.

### Usage

```ts
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  authenticated = false;

  constructor(private readonly keycloak: Keycloak) {
    const keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

    effect(() => {
      const keycloakEvent = keycloakSignal();

      if (keycloakEvent.type === KeycloakEventType.Ready) {
        this.authenticated = typeEventArgs<ReadyArgs>(keycloakEvent.args);
      }

      if (keycloakEvent.type === KeycloakEventType.AuthLogout) {
        this.authenticated = false;
      }
    });
  }
}
```

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore -->
 | [<img src="https://avatars3.githubusercontent.com/u/676270?v=4" width="89px;"/><br /><sub><b>Mauricio Vigolo</b></sub>](https://github.com/mauriciovigolo)<br /> | [<img src="https://avatars1.githubusercontent.com/u/695720?s=400&v=4" width="89px;"/><br /><sub><b>Jon Koops</b></sub>](https://github.com/https://github.com/jonkoops)<br /> |
 | :--------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |

<!-- ALL-CONTRIBUTORS-LIST:END -->

If you want to contribute to the project, please check out the [contributing](CONTRIBUTING.md)
document.

## License

**keycloak-angular** is licensed under the **[MIT license](LICENSE)**.

<!-- prettier-ignore-start -->
[license-mit-badge]: https://img.shields.io/badge/License-MIT-yellow
[license-mit]: https://opensource.org/licenses/MIT
[build-badge]: https://img.shields.io/github/actions/workflow/status/mauriciovigolo/keycloak-angular/main.yml?branch=main&label=CI&logo=github
[build]: https://github.com/mauriciovigolo/keycloak-angular/actions/workflows/main.yml?query=branch%3Amain
[vulnerabilities-badge]: https://snyk.io/test/github/mauriciovigolo/keycloak-angular/badge.svg
[vulnerabilities]: https://snyk.io/test/github/mauriciovigolo/keycloak-angular
[npm-version-badge]: https://img.shields.io/npm/v/keycloak-angular?logo=npm&logoColor=fff
[npm-badge]: https://img.shields.io/npm/dm/keycloak-angular?logo=npm&logoColor=fff
[npm]: https://www.npmjs.com/package/keycloak-angular
[contributors-badge]: https://img.shields.io/badge/all_contributors-5-orange
<!-- prettier-ignore-end -->
