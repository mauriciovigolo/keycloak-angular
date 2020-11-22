#!/bin/bash
export PATH=$PATH:$JBOSS_HOME/bin

AUTH_ENDPOINT=http://localhost:8080/auth/
CLIENT_ID=keycloak-angular

while ! curl -s --head  --request GET $AUTH_ENDPOINT | grep "200 OK" > /dev/null; do
  echo "Waiting for Keycloak server..."
  sleep 5s
done

kcreg.sh config credentials --server $AUTH_ENDPOINT --realm master --user $KEYCLOAK_USER --password $KEYCLOAK_PASSWORD
client=$(kcreg.sh get $CLIENT_ID)

if [ -z "$client" ]; then
    kcreg.sh create -s clientId=$CLIENT_ID -s 'redirectUris=["http://localhost:4200/*"]' -s 'publicClient=true'
else
    echo "The client has already been created."
fi
