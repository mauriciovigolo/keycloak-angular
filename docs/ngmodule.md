# Keycloak Angular Integration with NgModule Application

[Return to README.md](../README.md)

---

- [About](#about)
- [Setup](#setup)
- [Example project](#example-project)
- [AuthGuard](#authguard)
- [HttpClient Interceptor](#httpclient-interceptor)
- [Keycloak-js Events](#keycloak-js-events)

---

## About

This library helps you to use [keycloak-js](https://www.keycloak.org/docs/latest/securing_apps/index.html#_javascript_adapter) in Angular applications providing the following features:

- A **Keycloak Service** which wraps the `keycloak-js` methods to be used in Angular, giving extra
  functionalities to the original functions and adding new methods to make it easier to be consumed by
  Angular applications.
- Generic **AuthGuard implementation**, so you can customize your own AuthGuard logic inheriting the authentication logic and the roles load.
- An **HttpClient interceptor** that adds the authorization header to all HttpClient requests.
  It is also possible to disable this interceptor or exclude routes from having the authorization header.
- This documentation also assists you to configure the keycloak in your Angular applications and with
  the client setup in the admin console of your keycloak installation.

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
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
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

If you want to see a complete overview a pre-configured client together with a working Keycloak server make sure to check out the [example project](projects/examples/ngmodule/README.md) in this repository.

## AuthGuard

A generic AuthGuard, `KeycloakAuthGuard` is provided to help you protect authenticated routes in your application. This guard provides you with information to see if the user is logged in and a list of roles from that belong to the user. In your implementation you just need to implement the desired logic to protect your routes.

To write your own implementation extend the `KeycloakAuthGuard` class and implement the `isAccessAllowed` method. For example the code provided below checks if the user is authenticated and if not the user is requested to sign in. It also checks if the user has the correct roles which could be provided by passing the `roles` field into the data of the route.

```ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
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

  public async isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // Force the user to log in if currently unauthenticated.
    if (!this.authenticated) {
      await this.keycloak.login({
        redirectUri: window.location.origin + state.url
      });
    }

    // Get the roles required from the route.
    const requiredRoles = route.data.roles;

    // Allow the user to proceed if no additional roles are required to access the route.
    if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
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
keycloak.init({
  config: {
    url: 'http://localhost:8080',
    realm: 'your-realm',
    clientId: 'your-client-id'
  },
  initOptions: {
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
  },
  shouldAddToken: (request) => {
    const { method, url } = request;

    const isGetRequest = 'GET' === method.toUpperCase();
    const acceptablePaths = ['/assets', '/clients/public'];
    const isAcceptablePathMatch = acceptablePaths.some((path) => url.includes(path));

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
    silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
  },
  bearerExcludedUrls: ['/assets', '/clients/public'],
  shouldUpdateToken(request) {
    return !request.headers.get('token-update') === 'false';
  }
});
```

## Keycloak-js Events

The callback events from [keycloak-js](https://www.keycloak.org/docs/latest/securing_apps/index.html#javascript-adapter-reference) are available through a RxJS subject which is defined by `keycloakEvents$`.

For example you make keycloak-angular auto refreshing your access token when expired:

```ts
keycloakService.keycloakEvents$.subscribe({
  next(event) {
    if (event.type == KeycloakEventType.OnTokenExpired) {
      keycloakService.updateToken(20);
    }
  }
});
```

[Return to README.md](../README.md)
