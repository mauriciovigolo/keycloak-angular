/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { mergeMap } from 'rxjs/operators/mergeMap';

import { KeycloakService } from '../services/keycloak.service';

/**
 * This interceptor includes the bearer by default in all HttpClient requests.
 *
 * If you need to exclude some URLs from adding the bearer, please, take a look
 * at the {@link KeycloakOptions} bearerExcludedUrls property.
 */
@Injectable()
export class KeycloakBearerInterceptor implements HttpInterceptor {
  private excludedUrlsRegex: RegExp[];

  /**
   * KeycloakBearerInterceptor constructor.
   *
   * @param keycloak - Injected KeycloakService instance.
   */
  constructor(private keycloak: KeycloakService) {}

  private loadExcludedUrlsRegex() {
    const excludedUrls: string[] = this.keycloak.bearerExcludedUrls;
    this.excludedUrlsRegex = excludedUrls.map(urlPattern => new RegExp(urlPattern, 'i')) || [];
  }

  /**
   * Intercept implementation that checks if the request url matches the excludedUrls.
   * If not, adds the Authorization header to the request.
   *
   * @param req
   * @param next
   */
  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // If keycloak service is not initialized yet, or the interceptor should not be execute
    if (!this.keycloak || !this.keycloak.enableBearerInterceptor) {
      return next.handle(req);
    }

    if (!this.excludedUrlsRegex) {
      this.loadExcludedUrlsRegex();
    }

    const urlRequest = req.url;
    const shallPass: boolean = !!this.excludedUrlsRegex.find(regex => regex.test(urlRequest));
    if (shallPass) {
      return next.handle(req);
    }

    return this.keycloak.addTokenToHeader(req.headers).pipe(
      mergeMap(headersWithBearer => {
        const kcReq = req.clone({ headers: headersWithBearer });
        return next.handle(kcReq);
      })
    );
  }
}
