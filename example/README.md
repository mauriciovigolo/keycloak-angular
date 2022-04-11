# Keycloak Angular Example

This example projects demonstrates a basic setup of Keycloak Angular together with an actual Keycloak server. It can be used for testing and development purposes as well as a guideline on how to use Keycloak Angular in your own projects. To run this project make sure you have [Angular CLI](https://cli.angular.io/) and [Docker](https://www.docker.com/) installed on your system.

# Running the application

To start the Keycloak server run `docker-compose up` in the same directory as this README file. The `keycloak-angular` client will be created automatically on startup and the Keycloak server will be up and running. You can administrate the Keycloak server by navigating to `http://localhost:8080/`. The default username and password will both be `admin`.

Once the Keycloak server is up and running you can start the client application by running `ng serve` and navigating to `http://localhost:4200/` just like any other Angular CLI application.
