# Keycloak Angular NgModule Example

> **Note**: Starting from Keycloak-Angular v19, the standalone approach is the recommended method for use with Angular v19. The KeycloakService, KeycloakAngularModule, class-based interceptor, and guard have been deprecated. For more details, please refer to the migration guide.

This example project demonstrates a basic setup of **Keycloak Angular** using the **NgModule approach**, along with the latest Keycloak server. It serves as a resource for testing, development, and as a guideline for integrating Keycloak Angular into your own projects.

---

## Prerequisites

Ensure the following dependencies are installed on your system:

- [Angular CLI](https://cli.angular.io/)
- [Docker](https://www.docker.com/)

---

## Running the Application

The Keycloak server and Angular example are pre-configured for ease of use. To start the application:

1. Run the following command:

   ```bash
   npm run showcase:module
   ```

2. Access the application at: http://localhost:4200

### Login Credentials

You can use one of the following user credentials to log in:

```
User: johndoe
Passwd: qwerty@123
```

or

```
User: admin
Passwd: admin
```

## Keycloak Admin Access

To access the Keycloak Admin Console, visit:

http://localhost:8080

Use the same credentials as above to log in.
