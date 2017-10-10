Keycloak Angular
========================

[Keycloak-js](https://github.com/keycloak/keycloak-js-bower) port for Angular > v4.3 applications. 

---
* [About](#about)
* [Install](#install)
* [Setup in Angular](#setup-in-angular)
* [License](#license)
---

## About

This library helps you to use keycloak-js in Angular > v4.3 applications providing the following  
features:
- A **Keycloak Service** which wraps the keycloak-js methods to be used in Angular, giving extra 
functionalities to the original functions and adding new methods to make it easier to be consumed by 
Angular applications.
- Generic **AuthGuard implementation**, so you can customize your own AuthGuard logic inheriting the authentication logic and the roles load.
- A **HtppClient interceptor** that adds the authorization header to all HttpClient requests.
It is also possible to exclude routes from having the authorization header.
- This documentation also assists you to configure the keycloak in the Angular applications and with
the client setup in the admin console of your keycloak installation.

## Install

In your angular application directory:

- NPM

```sh
npm install --save keycloak-angular
```

or with yarn:

- YARN

```sh
yarn add keycloak-angular
```

## Setup

### Angular

The KeycloakService must be initialized during the application loading, using the [APP_INITIALIZER](https://angular.io/api/core/APP_INITIALIZER) token.

#### AppModule
```js
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { KeycloakService, KeycloakAngularModule } from 'keycloak-angular';
import { initializer } from '../utils/app-init';

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

#### initializer Function

This function can be named and placed in the way you think is most appropriate. 

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

## License

Copyright (C) 2017 Mauricio Gemelli Vigolo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.