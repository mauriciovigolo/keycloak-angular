# keycloak-angular

> Easy Keycloak setup for Angular applications.

## What is it?

This is a library that wraps the official [keycloak javascript adapter](https://github.com/keycloak/keycloak-js-bower), adding new functionalities, features and components for authentication and authorization for Angular applications.

#### Why this lib has keycloak-js as a dependency?

The keycloak-js library is the official javascript adapter from Keycloak project. On each Keycloak release, an equal keycloak-js version is shipped along side the server. Using the official adapter is a good idea for these reasons:

- Avoid API breaking changes, as most of these changes are handled by keycloak-js.
- Faster release cicles when a new Keycloak version is published.
- Greater community supporting issues on the adapter, so it tends to be a more mature implementation.
- Implemented Keycloak community and Red Hat.

## Features

- Compatible with Angular version 4.3.0 or higher.
- Keycloak service wraps all the keycloak-js functions, translating the result to RxJs Observables - when appropriate.
- Bearer Interceptor to automatically add the bearer in the Authorization HTTP header requests.
- Auth guard implementation that pre loads the authenticated user details, roles and ...
- Keycloak events propagated as RxJs Observables.
- Better Typescript support with built in definitions types, enhancing, when necessary, the official keycloak-js types.
- Extra documentation, complementing the official from keycloak project, to support the use of Keycloak in Angular applications.

## Examples

## Contributors
