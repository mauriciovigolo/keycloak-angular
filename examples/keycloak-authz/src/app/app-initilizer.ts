import { KeycloakService, KeycloakEvent } from 'keycloak-angular';

import { environment } from '../environments/environment';
import { EventStackService } from './core/services/event-stack.service';

export function initializer(
  keycloak: KeycloakService,
  eventStackService: EventStackService
): () => Promise<any> {
  return (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        keycloak.keycloakEvents$.subscribe(event => {
          eventStackService.triggerEvent(event);
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
