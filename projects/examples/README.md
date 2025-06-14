# Keycloak Angular Examples

This repository contains example applications demonstrating the use of **Keycloak Angular** with different approaches. Each application includes a README file detailing its setup, features, and usage instructions.

---

## Applications

### 1. **Keycloak Angular Standalone**

- **Purpose**: Showcases the **standalone approach** of using **Keycloak Angular**, which is the recommended method starting from Keycloak-Angular v19+ with Angular v19+.
- **Features**:
  - Keycloak initialization using `provideKeycloak`.
  - Automatic token refresh with `withAutoRefreshToken`.
  - Simplified event handling using Keycloak Signal.
  - Role-based rendering with `*kaHasRoles` directive.
  - Bearer token interceptor and functional auth guard.

[Read More](./standalone/README.md)

---

### 2. **Fetch Config File**

- **Purpose**: Showcases how to initialize a Keycloak Angular application by fetching the config file. The application functionalities are identical as the Keycloak Angular Standalone example.
- **Features**:
  - Initialization of Keycloak using an external config file.
  - Keycloak initialization using `provideKeycloak`.
  - Automatic token refresh with `withAutoRefreshToken`.
  - Simplified event handling using Keycloak Signal.
  - Role-based rendering with `*kaHasRoles` directive.
  - Bearer token interceptor and functional auth guard.

[Read More](./fetch_config/README.md)

---

### 3. **Keycloak Angular NgModule**

- **Purpose**: Demonstrates the integration of **Keycloak Angular** using the **NgModule approach**. This example is helpful for projects that still rely on the traditional Angular module system.
- **Features**:
  - Uses `KeycloakService`, `KeycloakAngularModule`, and class-based interceptor and guard.
  - Pre-configured Keycloak server and Angular application for testing and development.

[Read More](./ngmodule/README.md)

---

### 4. **Mock Server**

- **Purpose**: An Express application that serves mocked data. It is designed to act as a backend resource for Angular applications to test features like HTTP interceptors and token handling.
- **Features**:
  - Provides a list of science fiction books as mocked data.

[Read More](./mockserver/README.md)

---

### 5. **Docker Setup**

- **Purpose**: Provides a `docker-compose` and a Realm export to quickly bootstrap a Keycloak server for testing and development purposes.
- **Features**:
  - Pre-configured realm (`keycloak-angular-sandbox`) with test users.
  - Ready-to-use setup for testing Keycloak Angular applications.
  - Simplifies environment management using Docker.

[Read More](./docker/README.md)

---

## Prerequisites

All the applications require the following tools installed on your system:

- [Angular CLI](https://cli.angular.io/)
- [Docker](https://www.docker.com/)
