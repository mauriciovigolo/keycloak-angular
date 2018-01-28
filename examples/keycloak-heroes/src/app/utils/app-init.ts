import { KeycloakService } from 'keycloak-angular';

export function initializer(keycloak: KeycloakService): () => Promise<any> {
  return (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        await keycloak.init({
          config: {
            url: 'KEYCLOAK-INSTANCE-URL', // .ie: http://localhost:8080/auth/
            realm: 'REALM-NAME', // .ie: master
            clientId: 'CLIENT-ID-NAME' // .ie: account
          },
          initOptions: {
            onLoad: 'login-required',
            checkLoginIframe: false
          }
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };
}
