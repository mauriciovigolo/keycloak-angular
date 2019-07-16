# keycloak-angular examples

The aim of this section is to provide some examples on how to use [keycloak-angular](https://github.com/mauriciovigolo/keycloak-angular) in your projects.

If there is a scenario that is not covered here and you would like to contribute, please submit a PR to the project. All the help is welcome.

---

## Topics

- [Quickstart](#Quickstart)
- [Examples](#Examples)
- [Credits](#Credits)

---

## Quickstart

> _Important_: The premise to the examples bellow is an installed and configured Keycloak instance. For more information about this topic, please visit [Keycloak Official Documentation](https://www.keycloak.org/documentation.html).

Considering you already have a working Keycloak server in your environment, the first thing to do is to clone the [keycloak-angular](https://github.com/mauriciovigolo/keycloak-angular) repository to your local machine.

1. Step #1: Clone the [keycloak-angular](https://github.com/mauriciovigolo/keycloak-angular) repository.

```
git clone https://github.com/mauriciovigolo/keycloak-angular
```

2. Step #2: Install all the dependencies for each project.

```
cd keycloak-angular/examples/backend/heroes-backend
npm i
```

```
cd keycloak-angular/examples/webapp/keycloak-heroes
npm i
```

3. Step #3: Then configure the environment.ts files to your Keycloak Instance

Prerequisites:

- A realm must be configured.
- A client must exist for keycloak-heroes
- The client for the backend is not a need at this time, but in future releases the client will also be secured (now it's not secured).

> ./examples/webapp/keycloak-heroes/src/environments/environment.ts

```typescript
import { KeycloakConfig } from "keycloak-angular";

// Add here your keycloak setup infos
const keycloakConfig: KeycloakConfig = {
  url: "KEYCLOAK-INSTANCE-URL", // http://localhost:8080/auth
  realm: "REALM-NAME", // your realm: keycloak-sandbox
  clientId: "CLIENT-ID-NAME" // keycloak-heroes
};

export const environment = {
  production: false,
  assets: {
    dotaImages:
      "https://cdn-keycloak-angular.herokuapp.com/assets/images/dota-heroes/"
  },
  apis: { dota: "http://localhost:3000" },
  keycloakConfig
};
```

4. Step #4: Start the Apps

- First Terminal

```
npm start .\examples\backend\heroes-backend\
```

- Second Terminal

```
npm start .\examples\keycloak-heroes\
```

If the apps were successfully loaded you could access:

> http://localhost:4200

and

> http://localhost:3000/api/docs

## Examples

<!-- prettier-ignore-start -->
| Project | Description                                        |
| :-----: | ------------------------------------------------ |
|[keycloak-heroes](https://github.com/mauriciovigolo/keycloak-angular/tree/master/examples/webapp/keycloak-heroes)|This app shows a simple configuration using an init function. It's consuming the heroes-backend REST API, provided as example|
|[keycloak-heroes-bootstrap](https://github.com/mauriciovigolo/keycloak-angular/tree/master/examples/webapp/keycloak-heroes-bootstrap)|This app shows a simple configuration using ngDoBootstrap. It's consuming the heroes-backend REST API, provided as example|
|[heroes-backend](https://github.com/mauriciovigolo/keycloak-angular/tree/master/examples/backend/heroes-backend)|This is the REST API for the examples provided and it provides Dota Heroes and Amiibos data. The credits topic gives all the credits for the data to its original sources.|
<!-- prettier-ignore-end -->

## Credits

- Examples source code are under MIT license.
- Dota Heroes (data and images) comes from - [Open Dota](https://docs.opendota.com/). All credits to them!
- Amiibos (data and images) comes from - [Amiibo API](https://www.amiiboapi.com). All credits to them!

_Important_: The purpose of the REST API is just for educational purposes.
