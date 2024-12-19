# Docker Setup

This directory contains a `docker-compose` file designed to bootstrap a Keycloak server environment. It uses the latest version of Keycloak and simplifies the setup required for testing the `keycloak-angular` examples.

## Keycloak Realm and Users

The setup includes an exported realm named **`keycloak-angular-sandbox`**, preconfigured with the following users:

- **Admin**

  - **Username**: `admin`
  - **Password**: `admin`

- **John Doe**
  - **Username**: `johndoe`
  - **Password**: `qwerty@123`

## Requirements

Before starting, ensure you have a container runtime compatible with Docker, such as Docker itself or Rancher Desktop.

## Starting the Keycloak Server

To start the Keycloak server, run the following command:

```bash
npm run serve:keycloak
```
