import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from '../services/keycloak.service';
import { ExcludedUrlRegex } from '../interfaces/keycloak-options';
import { Observable, combineLatest, from, mergeMap, of } from 'rxjs';

export const keycloakBearerFnInterceptor: HttpInterceptorFn = (req, next) => {
  return intercept(req, next);
};

/**
 * Calls to update the keycloak token if the request should update the token.
 *
 * @param req http request from @angular http module.
 * @returns
 * A promise boolean for the token update or noop result.
 */
const conditionallyUpdateToken = async (
  req: HttpRequest<unknown>
): Promise<boolean> => {
  const keycloak = inject(KeycloakService);

  if (keycloak.shouldUpdateToken(req)) {
    return await keycloak.updateToken();
  }

  return true;
};

/**
 * @deprecated
 * Checks if the url is excluded from having the Bearer Authorization
 * header added.
 *
 * @param req http request from @angular http module.
 * @param excludedUrlRegex contains the url pattern and the http methods,
 * excluded from adding the bearer at the Http Request.
 */
const isUrlExcluded = (
  { method, url }: HttpRequest<unknown>,
  { urlPattern, httpMethods }: ExcludedUrlRegex
): boolean => {
  const httpTest =
    (httpMethods ?? []).length === 0 ||
    (httpMethods ?? []).join().indexOf(method.toUpperCase()) > -1;

  const urlTest = urlPattern.test(url);

  return httpTest && urlTest;
};

/**
 * Adds the token of the current user to the Authorization header
 *
 * @param req
 * @param next
 */
const handleRequestWithTokenHeader = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const keycloak = inject(KeycloakService);

  return keycloak.addTokenToHeader(req.headers).pipe(
    mergeMap((headersWithBearer) => {
      const kcReq = req.clone({ headers: headersWithBearer });
      return next(kcReq);
    })
  );
};

/**
 * Intercept implementation that checks if the request url matches the excludedUrls.
 * If not, adds the Authorization header to the request if the user is logged in.
 *
 * @param req
 * @param next
 */
const intercept = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const keycloak = inject(KeycloakService);
  const { enableBearerInterceptor, excludedUrls } = keycloak;
  if (!enableBearerInterceptor) {
    return next(req);
  }

  const shallPass: boolean =
    !keycloak.shouldAddToken(req) ||
    excludedUrls.findIndex((item) => isUrlExcluded(req, item)) > -1;
  if (shallPass) {
    return next(req);
  }

  return combineLatest([
    from(conditionallyUpdateToken(req)),
    of(keycloak.isLoggedIn())
  ]).pipe(
    mergeMap(([_, isLoggedIn]) =>
      isLoggedIn ? handleRequestWithTokenHeader(req, next) : next(req)
    )
  );
};
