/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { combineLatest, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { UrlRegex } from '../interfaces/keycloak-options';

import { KeycloakService } from '../services/keycloak.service';

/**
 * This interceptor includes the bearer by default in all HttpClient requests.
 *
 * If you need to exclude some URLs from adding the bearer, please, take a look
 * at the {@link KeycloakOptions} bearerExcludedUrls property.
 */
@Injectable()
export class KeycloakBearerInterceptor implements HttpInterceptor {
  constructor(private keycloak: KeycloakService) {}

  /**
   * Calls to update the keycloak token if the request should update the token.
   *
   * @param req http request from @angular http module.
   * @returns
   * A promise boolean for the token update or noop result.
   */
  private async conditionallyUpdateToken(
    req: HttpRequest<unknown>
  ): Promise<boolean> {
    if (this.keycloak.shouldUpdateToken(req)) {
      return await this.keycloak.updateToken();
    }

    return true;
  }

  /**
   * Intercept implementation that checks if the request url matches the excludedUrls.
   * If not, adds the Authorization header to the request if the user is logged in.
   *
   * @param req
   * @param next
   */
  public intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const { enableBearerInterceptor, excludedUrls, includedUrls } =
      this.keycloak;
    const skipInterceptor = shouldSkipInterceptor(
      req,
      this.keycloak.shouldAddToken(req),
      enableBearerInterceptor,
      excludedUrls,
      includedUrls
    );

    if (skipInterceptor) {
      return next.handle(req);
    }

    return combineLatest([
      this.conditionallyUpdateToken(req),
      this.keycloak.isLoggedIn()
    ]).pipe(
      mergeMap(([_, isLoggedIn]) =>
        isLoggedIn
          ? this.handleRequestWithTokenHeader(req, next)
          : next.handle(req)
      )
    );
  }

  /**
   * Adds the token of the current user to the Authorization header
   *
   * @param req
   * @param next
   */
  private handleRequestWithTokenHeader(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return this.keycloak.addTokenToHeader(req.headers).pipe(
      mergeMap((headersWithBearer) => {
        const kcReq = req.clone({ headers: headersWithBearer });
        return next.handle(kcReq);
      })
    );
  }
}

/**
 *
 * @param req http request from @angular http module.
 * @param shouldAddToken boolean signaling whether we should add a bearer token
 * @param enableBearerInterceptor boolean signaling whether the interceptor is enabled
 * @param excludedUrls list of excluded URLs for which the interceptor should be skipped
 * @param includedUrls list of included URLs for which the interceptor should be enabled
 */
function shouldSkipInterceptor(
  req: HttpRequest<unknown>,
  shouldAddToken: boolean,
  enableBearerInterceptor: boolean,
  excludedUrls: UrlRegex[],
  includedUrls: UrlRegex[]
) {
  const excludedUrlMatch =
    !excludedUrls ||
    excludedUrls.findIndex((urlRegex) => urlMatches(req, urlRegex)) > -1;
  const includedUrlMatch =
    !includedUrls ||
    includedUrls.findIndex((urlRegex) => urlMatches(req, urlRegex)) > -1;

  return (
    !enableBearerInterceptor ||
    !shouldAddToken ||
    excludedUrlMatch ||
    !includedUrlMatch
  );
}

/**
 * Checks if the url matched the UrlRegex
 *
 * @param req http request from @angular http module.
 * @param UrlRegex contains the url pattern and the http methods
 */
function urlMatches(
  { method, url }: HttpRequest<unknown>,
  { urlPattern, httpMethods }: UrlRegex
): boolean {
  const httpTest =
    !httpMethods ||
    httpMethods.length === 0 ||
    httpMethods.join().indexOf(method.toUpperCase()) > -1;

  const urlTest = urlPattern.test(url);
  return httpTest && urlTest;
}
