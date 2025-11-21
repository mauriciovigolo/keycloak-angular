# Keycloak-Angular Features

Keycloak-Angular introduces modular features that enhance its integration with Angular applications. These features enable advanced functionality such as automatic token refresh, session management, and event handling. They are designed to be composable, allowing you to enable specific features based on your application’s needs.

## **Feature: `withAutoRefreshToken`**

### Purpose

The `withAutoRefreshToken` feature automatically manages the Keycloak token refresh process and handles session inactivity. It helps maintain session stability by refreshing the token based on user activity, reducing the risk of unexpected token expiration.

The check is triggered when `keycloak-js` attempts to update the token, following the configuration defined on the Keycloak server. If the session timeout has passed the configured threshold, the user will be logged out. Otherwise, the token will be refreshed.

This feature is particularly useful because the authorization token is not automatically renewed unless there is an explicit request to update it.

### Key Features

- **Automatic Token Refresh**: Refreshes tokens when they are about to expire.
- **Session Inactivity Handling**: Monitors user activity to detect inactivity and execute appropriate actions (e.g., logout).
- **Configurable Timeout**: Allows customization of session timeout duration and actions on timeout.

---

### Configuration Options

The `withAutoRefreshToken` feature accepts the following options:

| Option                | Type                                | Default     | Description                                                                                                   |
| --------------------- | ----------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------- |
| `sessionTimeout`      | `number`                            | `300000`    | The duration of inactivity (in milliseconds) after which the session is considered expired.                   |
| `onInactivityTimeout` | `'login'` \| `'logout'` \| `'none'` | `'logout'`  | Action to take when the session times out due to inactivity.                                                  |
| `logoutOptions`       | `KeycloakLogoutOptions`             | `undefined` | Logout options to pass to keycloak.logout when the user is getting logged out automatically after inactivity. |
| `loginOptions`        | `KeycloakLoginOptions`              | `undefined` | Login options to pass to keycloak.login when the user is getting logged in automatically after inactivity.    |

- **`onInactivityTimeout` Actions**:
  - `'login'`: Executes `keycloak.login()`.
  - `'logout'`: Executes `keycloak.logout`.
  - `'none'`: Takes no action on session timeout.

---

### Usage

To enable the `withAutoRefreshToken` feature, configure it during the Keycloak setup using the `provideKeycloak` function. This feature requires the `AutoRefreshTokenService` and `UserActivityService` to be included in the providers.

#### Example Configuration

```typescript
import { provideKeycloak, withAutoRefreshToken, AutoRefreshTokenService, UserActivityService } from 'keycloak-angular';
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
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`
      },
      features: [
        withAutoRefreshToken({
          sessionTimeout: 600000, // 10 minutes
          onInactivityTimeout: 'logout'
        })
      ],
      providers: [AutoRefreshTokenService, UserActivityService]
    })
  ]
};
```

### Workflow

1. The feature monitors user activity such as mouse movement, key presses, touch start and clicks.
2. When the `KeycloakEventType.TokenExpired` event occurs:
   - If the user is active, the token is refreshed using `Keycloak.updateToken`.
   - If the user is inactive beyond the `sessionTimeout`, the specified `onInactivityTimeout` action is executed.
3. User activity is tracked using the `UserActivityService`.
