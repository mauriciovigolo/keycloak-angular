# DPoP with Angular HttpClient

Keycloak JS creates the DPoP proof and handles nonce challenges. `provideKeycloakDpopHttpBackend()` sends matching Angular `HttpClient` requests through Keycloak JS and converts its responses for Angular. Angular interceptors still run.

Use Keycloak JS 26.2.5 or later, which provides `dpopConfig` and its DPoP-aware `fetch` method. The browser app must run in a secure context (HTTPS, or localhost) for Web Crypto. The API must also validate DPoP-bound tokens and proofs; enabling DPoP in the client alone does not protect the API. See [Keycloak's DPoP guide](https://www.keycloak.org/securing-apps/dpop) for the server side.

## Setup

Enable DPoP in Keycloak JS and use the Bearer interceptor to limit token attachment to trusted API URLs. Register the DPoP backend after `provideHttpClient()`:

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import {
  createInterceptorCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  includeBearerTokenInterceptor,
  provideKeycloak,
  provideKeycloakDpopHttpBackend,
  type IncludeBearerTokenCondition
} from 'keycloak-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloak({
      config: {
        url: 'https://keycloak.example.com',
        realm: 'my-realm',
        clientId: 'my-client'
      },
      initOptions: {
        dpopConfig: { mode: 'auto' }
      }
    }),
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [
        createInterceptorCondition<IncludeBearerTokenCondition>({
          urlPattern: /^https:\/\/api\.example\.com\//
        })
      ]
    },
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor])),
    provideKeycloakDpopHttpBackend()
  ]
};
```

With `mode: 'auto'`, Keycloak JS uses DPoP when Keycloak advertises support and falls back to Bearer otherwise. `mode: 'strict'` requires DPoP support.

## Requests

The Bearer interceptor refreshes the token and adds `Authorization: Bearer <token>` to matching URLs. The DPoP backend routes requests through Keycloak JS only when that header matches the current Keycloak token; all other requests use the delegate backend. Use the default `Authorization` header and `Bearer` prefix. Custom header names or prefixes do not match.

When DPoP is active, Keycloak JS sends `Authorization: DPoP <token>` and a signed proof in the `DPoP` header. It also handles nonce challenges and retries. If a Keycloak Angular Bearer interceptor attaches the token and it changes before the request is sent, the request fails rather than being sent without a DPoP proof.

Requests routed through Keycloak JS use Fetch, even if DPoP is in `auto` mode and Keycloak falls back to Bearer. Fetch cannot report upload progress, so requests with `reportUploadProgress: true` fail. Download progress is supported through `reportDownloadProgress: true`. The deprecated `reportProgress` option still reports download progress for existing callers.

## Backend options

The default delegate is Angular's `FetchBackend`. If your app uses `withXhr()`, use this HTTP provider setup instead of the two HTTP providers in the first example:

```typescript
import { HttpXhrBackend, provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { includeBearerTokenInterceptor, provideKeycloakDpopHttpBackend } from 'keycloak-angular';

const httpProviders = [
  provideHttpClient(withXhr(), withInterceptors([includeBearerTokenInterceptor])),
  provideKeycloakDpopHttpBackend({ delegateBackend: HttpXhrBackend })
];
```

For another custom backend, pass its `HttpBackend` class as `delegateBackend`. Install this provider where the final backend is configured. If a child `HttpClient` uses `withRequestsMadeViaParent()`, register the DPoP backend on the parent; the child forwards requests there, so a DPoP backend registered only on the child is bypassed.

For cross-origin APIs, allow the `Authorization` and `DPoP` request headers in CORS. Expose `DPoP-Nonce` and `WWW-Authenticate` so Keycloak JS can read nonce challenges.
