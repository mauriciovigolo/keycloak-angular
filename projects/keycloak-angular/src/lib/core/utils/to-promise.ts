import { KeycloakPromise } from 'keycloak-js';

interface LegacyKeycloakPromise<T, E> {
  success(callback: (result: T) => void): LegacyKeycloakPromise<T, E>;
  error(callback: (result: E) => void): LegacyKeycloakPromise<T, E>;
}

/**
 * Converts a 'legacy' Keycloak promise to a standardized one.
 *
 * @param originalPromise The Keycloak promise to convert.
 */
export function toPromise<T, E>(originalPromise: LegacyKeycloakPromise<T, E> | KeycloakPromise<T, E>) {
  if (originalPromise instanceof Promise) {
    return originalPromise;
  }

  return new Promise<T>((resolve, reject) => {
    originalPromise.success(resolve);
    originalPromise.error(reject);
  });
}
