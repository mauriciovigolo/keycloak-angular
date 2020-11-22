#!/bin/bash
echo "Creating keycloak-angular client in own process..."
/tmp/create-client.sh &> /dev/null & disown