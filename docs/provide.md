# Keycloak-Angular `provideKeycloak`

The `provideKeycloak` function simplifies the initialization and integration of Keycloak with Angular applications. It ensures that Keycloak is properly configured and injected into the Angular Dependency Injection (DI) system, making it accessible throughout the application.

---

## **Purpose**

The `provideKeycloak` function configures and initializes a Keycloak instance at the application startup. It allows developers to easily set up Keycloak features, interceptors, and additional providers required for authentication and authorization.

---

## **Key Features**

- **Seamless Integration**: Initializes Keycloak and injects it into the Angular DI system.
- **Support for Keycloak Features**: Enables modular features like automatic token refresh and session management.
- **Flexible Initialization**: Allows custom initialization logic by skipping automatic initialization.

---

## **Function Signature**

```typescript
export function provideKeycloak(options: ProvideKeycloakOptions): EnvironmentProviders;
```

### Parameters

| Parameter | Type                     | Description                                                                                                    |
| --------- | ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `options` | `ProvideKeycloakOptions` | Configuration options for Keycloak, including its instance, initialization settings, and additional providers. |

---

## **Supporting Types**

### `ProvideKeycloakOptions`

```typescript
export type ProvideKeycloakOptions = {
  config: KeycloakConfig; // Keycloak server configuration
  initOptions?: KeycloakInitOptions; // Optional initialization options
  providers?: Array<Provider | EnvironmentProviders>; // Additional Angular providers
  features?: Array<KeycloakFeature>; // Array of Keycloak features
};
```

- **`config`**:  
  Keycloak server configuration, including:

  - `url`: Keycloak server URL.
  - `realm`: The realm to authenticate against.
  - `clientId`: The client ID for your application.

- **`initOptions`**:  
  Initialization options for the Keycloak instance, such as:

  - `onLoad`: Determines whether to check SSO or require login (`'check-sso'` or `'login-required'`).
  - `silentCheckSsoRedirectUri`: URL for the iframe used in silent SSO.

- **`providers`**:  
  Additional Angular providers required by your application.

- **`features`**:  
  Keycloak features such as `withAutoRefreshToken` to enhance functionality.

---

## **Usage**

### Basic Configuration

```typescript
import { provideKeycloak } from 'keycloak-angular';
import { ApplicationConfig } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloak({
      config: {
        url: 'https://auth-server.example.com',
        realm: 'my-realm',
        clientId: 'my-client'
      },
      initOptions: {
        onLoad: 'login-required',
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`
      }
    })
  ]
};
```

---

### Adding Keycloak Features

To enable advanced functionality like automatic token refresh, include the `features` option.

```typescript
import { provideKeycloak, withAutoRefreshToken, AutoRefreshTokenService, UserActivityService } from 'keycloak-angular';

export const appConfig = {
  providers: [
    provideKeycloak({
      config: {
        url: 'https://auth-server.example.com',
        realm: 'my-realm',
        clientId: 'my-client'
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`
      },
      features: [
        withAutoRefreshToken({
          sessionTimeout: 300000, // 5 minutes
          onInactivityTimeout: 'logout'
        })
      ],
      providers: [AutoRefreshTokenService, UserActivityService]
    })
  ]
};
```

---

### Custom Initialization

If you need to control when `keycloak.init()` is called, omit the `initOptions` parameter. This gives you full control over the initialization process.
