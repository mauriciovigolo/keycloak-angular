# Keycloak-Angular HTTP Interceptors

Keycloak-Angular provides two types of HTTP interceptors to securely manage authentication tokens in outgoing HTTP requests:

1. **Bearer Token Interceptor**
2. **Custom Bearer Token Interceptor**

These interceptors include authentication tokens in the `Authorization` header based on configurable conditions, ensuring secure integration with backend APIs.

---

## **1. Bearer Token Interceptor**

### Purpose

The Bearer Token Interceptor conditionally adds a Bearer token to the `Authorization` header of outgoing HTTP requests based on defined URL patterns and HTTP methods.

### Key Features

- **Explicit URL Matching**: Adds the token only for requests that match specified URL patterns.
- **HTTP Method Filtering**: Restricts token inclusion to specific HTTP methods (e.g., `GET`, `POST`).
- **Token Refresh**: Ensures tokens are updated before being added to the request.
- **Controlled Authorization**: Only includes the Bearer token for authenticated requests.

### Configuration

#### Injection Token

The `INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG` injection token is used to configure this interceptor. It accepts an array of `IncludeBearerTokenCondition` objects.

#### Type: `IncludeBearerTokenCondition`

```typescript
type IncludeBearerTokenCondition = Partial<BearerTokenCondition> & {
  urlPattern: RegExp; // URL pattern to match
  httpMethods?: HttpMethod[]; // Optional HTTP methods to match
};
```

#### Example Configuration

```typescript
import { INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG, includeBearerTokenInterceptor } from './keycloak.interceptor';
import { ApplicationConfig, provideHttpClient, withInterceptors } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor])),
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [
        {
          urlPattern: /^https:\/\/api\.myapp\.com\/.*$/,
          httpMethods: ['GET', 'POST'] // Token added only for GET and POST
        }
      ]
    }
  ]
};
```

### Workflow

1. Matches the request URL and method against the conditions provided in the configuration.
2. If a match is found:
   - Updates the Keycloak token if required.
   - Adds the Bearer token to the Authorization header of the request.
3. If no match is found, the request is passed unchanged.

---

## **Custom Bearer Token Interceptor**

### Purpose

The Custom Bearer Token Interceptor provides dynamic control over token inclusion. The decision to include a Bearer token is determined by a custom function (`shouldAddToken`), offering granular control based on request properties or Keycloak state.

### Key Features

- **Dynamic Token Inclusion**: Uses a function to determine token inclusion for each request.
- **Flexible Configuration**: Allows complex logic to define token inclusion conditions.
- **Token Management**: Ensures tokens are refreshed before being added to the request.
- **Granular Authorization**: Supports dynamic checks for request-specific conditions.

### Configuration

#### Injection Token

The `CUSTOM_BEARER_TOKEN_INTERCEPTOR_CONFIG` injection token is used to configure this interceptor. It accepts an array of `CustomBearerTokenCondition` objects.

Type: `CustomBearerTokenCondition`

```typescript
type CustomBearerTokenCondition = Partial<BearerTokenCondition> & {
  shouldAddToken: (req: HttpRequest<unknown>, next: HttpHandlerFn, keycloak: Keycloak) => Promise<boolean>; // Custom function to determine token inclusion
};
```

#### Example Configuration

```typescript
import { ApplicationConfig, provideHttpClient, withInterceptors } from '@angular/core';
import { CUSTOM_BEARER_TOKEN_INTERCEPTOR_CONFIG, customBearerTokenInterceptor } from './keycloak.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([customBearerTokenInterceptor])),
    {
      provide: CUSTOM_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [
        {
          shouldAddToken: async (req, _, keycloak) => {
            return req.url.startsWith('/secure') && keycloak.authenticated;
          }
        }
      ]
    }
  ]
};
```

### Workflow

1. Evaluates each request against the shouldAddToken function in the configuration.
2. If `shouldAddToken` returns true:
   - Updates the Keycloak token if required.
   - Adds the Bearer token to the Authorization header of the request.
3. If no condition matches, the request proceeds unchanged.

## Shared Types

### BearerTokenCondition

```typescript
type BearerTokenCondition = {
  bearerPrefix?: string; // Prefix for the token, default is "Bearer"
  authorizationHeaderName?: string; // Header name, default is "Authorization"
  shouldUpdateToken?: (req: HttpRequest<unknown>) => boolean; // Determines if the token should be refreshed
};
```

- `bearerPrefix`: Customizes the prefix for the Bearer token.
- `authorizationHeaderName`: Allows the use of a custom header name.
- `shouldUpdateToken`: Controls token refresh logic per request.

---

## Usage Guidelines

### When to Use Each Interceptor

- Use the **Bearer Token** Interceptor for simple, declarative configurations based on URL patterns and HTTP methods.
- Use the **Custom Bearer Token** Interceptor for advanced, dynamic scenarios requiring custom logic for token inclusion.
