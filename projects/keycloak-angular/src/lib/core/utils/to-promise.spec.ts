import { KeycloakPromise } from 'keycloak-js';
import { toPromise } from './to-promise';

describe('toPromise', () => {
  it('should ignore values that are already an instance of Promise', () => {
    const testPromise = new Promise(() => {}) as KeycloakPromise<void, void>;

    expect(toPromise(testPromise)).toBe(testPromise);
  });

  it('should convert a legacy promise to a Promise instance and handle success and error states', async () => {
    const testPromiseSuccess = createLegacyPromise();
    const testPromiseError = createLegacyPromise();

    const convertedPromiseSuccess = toPromise(testPromiseSuccess.promise);
    const convertedPromiseError = toPromise(testPromiseError.promise);

    const successValue = 'Hello World';
    const errorValue = new Error('Whoopsie');

    testPromiseSuccess.setSuccess(successValue);
    testPromiseError.setError(errorValue);

    await expectAsync(convertedPromiseSuccess).toBeResolvedTo(successValue);
    await expectAsync(convertedPromiseError).toBeRejectedWith(errorValue);
  });
});

// Old promise code copied from Keycloak JS and modified to work here.
// See: https://github.com/keycloak/keycloak/pull/6665/files#diff-f41a82d32ba240c5165fc1ee64741068L1147-L1185
function createLegacyPromise() {
  const p = {
      success: false,
      error: false,
      result: null,
      successCallback: null,
      errorCallback: null,

      setSuccess: function(result) {
          p.success = true;
          p.result = result;

          if (p.successCallback) {
              p.successCallback(result);
          }
      },

      setError: function(result) {
          p.error = true;
          p.result = result;
          if (p.errorCallback) {
              p.errorCallback(result);
          }
      },

      promise: {
          success: function(callback) {
              if (p.success) {
                  callback(p.result);
              } else if (!p.error) {
                  p.successCallback = callback;
              }
              return p.promise;
          },
          error: function(callback) {
              if (p.error) {
                  callback(p.result);
              } else if (!p.success) {
                  p.errorCallback = callback;
              }
              return p.promise;
          }
      }
  };

  return p;
}
