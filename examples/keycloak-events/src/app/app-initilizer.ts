import { KeycloakService, KeycloakEvent } from 'keycloak-angular';

import { environment } from '../environments/environment';

export function initializer(keycloak: KeycloakService): () => Promise<any> {
  return (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        keycloak.keycloakEvents$.subscribe(event => {
          // Add event handler.
        });
        await keycloak.init({
          config: environment.keycloak
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };
}
