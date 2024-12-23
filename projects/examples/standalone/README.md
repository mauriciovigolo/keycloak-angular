# Keycloak Angular Standalone Example

This example project demonstrates how to set up **Keycloak Angular** using **standalone components**, along with the latest Keycloak server. It serves as a resource for testing, development, and as a guideline for integrating Keycloak Angular into your own projects.

### Key Features

In this project, you will find examples of:

- **Keycloak Initialization**: Using the `provideKeycloak` function.
- **Automatic Token Refresh**: Automatically refresh expired tokens based on user activity by including the `withAutoRefreshToken` feature.
- **Keycloak Signal Integration**: Simplifies working with Keycloak events.
- **Bearer Token Interceptor**: Easily include the interceptor using `includeBearerTokenInterceptor`.
- **Auth Guard Factory**: Use the `createAuthGuard` function to create functional route guards.
- **Role-Based Rendering**: Leverage the `*kaHasRoles` directive to conditionally render elements based on resource or realm roles.

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
   npm run showcase:standalone
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
