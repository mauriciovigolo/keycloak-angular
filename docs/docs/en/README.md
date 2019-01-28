# keycloak-angular

> Easy Keycloak setup for Angular applications.

## What is it?

This library wraps the official [Keycloak Javascript Adapter](https://github.com/keycloak/keycloak-js-bower), adding new functionalities, features and components for authentication and authorization in Angular applications.

#### Why this library has keycloak-js as a dependency?

The keycloak-js library is the official javascript adapter from Keycloak project. On each Keycloak release, an equal keycloak-js version is shipped with the server. Using the official adapter is a good idea for these reasons:

- Avoid API breaking changes, as most of these changes are handled by keycloak-js.
- Faster release cicles when a new Keycloak version is published.
- Greater community supporting issues on the adapter, so it tends to be a more mature and secure implementation.
- Implemented by Keycloak community and Red Hat.

> ⚠️ - The version of keycloak-js may always be overriden in your project. To do so, you will need to install the required package as: `npm i --save keycloak-js@<version>`. Be aware that you may face some issues related to this custom installed version, since keycloak-angular is tested with the keycloak-js version as described on the package.json file.

## Features

- Compatible with Angular version 4.3.0 or higher.
- Keycloak service wraps all the keycloak-js functions, translating the result to RxJs Observables - when appropriate.
- Bearer Interceptor to automatically add the bearer in the Authorization HTTP header requests. This interceptor may be disabled if desired.
- Auth guard implementation that pre loads the authenticated user details and roles, so it's only needed to implement the business rule for the application.
- Keycloak events propagated as RxJs Observables.
- Better Typescript support with built in definitions types, enhancing, when necessary, the official keycloak-js types.
- Extra documentation, complementing the official from keycloak project, to support the use of Keycloak in Angular applications.

## Contributors

<!-- prettier-ignore -->
 |[<img src="https://avatars3.githubusercontent.com/u/676270?v=4" width="100px;"/><br /><sub><b>Mauricio Gemelli Vigolo</b></sub>](https://github.com/mauriciovigolo)<br />|[<img src="https://avatars0.githubusercontent.com/u/2146903?v=4" width="100px;"/><br /><sub><b>Frederik Prijck</b></sub>](https://github.com/frederikprijck)<br /> | [<img src="https://avatars1.githubusercontent.com/u/980278?v=4" width="100px;"/><br /><sub><b>jmparra</b></sub>](https://github.com/jmparra)<br /> | [<img src="https://avatars2.githubusercontent.com/u/6547340?v=4" width="100px;"/><br /><sub><b>Marcel Német</b></sub>](https://github.com/marcelnem)<br /> | [<img src="https://avatars3.githubusercontent.com/u/14264577?v=4" width="100px;"/><br /><sub><b>Raphael Alex Silva Abreu</b></sub>](https://github.com/aelkz)<br /> |
| :---: | :---: | :---: | :---: | :---: |

If you want to contribute to the project, please check out the [contributing](docs/CONTRIBUTING.md) document.

## License

**keycloak-angular** is licensed under the **[MIT](LICENSE)**.

[keycloak-js](https://github.com/keycloak/keycloak-js-bower) is licensed under the **Apache 2.0**.
