import { KeycloakService } from 'keycloak-angular';

import { environment } from '../environments/environment';

export function initializer(keycloak: KeycloakService): () => Promise<any> {
  return (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        await keycloak.init({
          config: environment.keycloak,
          initOptions: {
            checkLoginIframe: true
          }
        });

        // Registering all events from keycloak
        let keycloakInstance = keycloak.getKeycloakInstance();
        keycloakInstance.onReady = function(authenticated) {
          console.log('Keycloak initialized', authenticated);
        };

        keycloakInstance.onAuthSuccess = function() {
          console.log('authenticated');
        };

        keycloakInstance.onAuthLogout = function() {
          console.log('logoff');
        };
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };
}
