/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { KeycloakService } from '../services';

/**
 * This interceptor includes the bearer by default in all HttpClient requests.
 *
 * If you need to exclude some URLs from adding the bearer, please, take a look
 * at the {@link KeycloakOptions} bearerExcludedUrls property.
 */
@Injectable()
export class KeycloakBearerInterceptor implements HttpInterceptor {
  /**
   * KeycloakBearerInterceptor constructor.
   *
   * @param keycloak - Injected KeycloakService instance.
   */
  constructor(private keycloak: KeycloakService) {}

  /**
   * Intercept implementation that checks if the request url matches the excludedUrls.
   * If not, adds the Authorization header to the request.
   *
   * @param req
   * @param next
   */
  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const urlRequest = req.url;
    const excludedUrls: string[] = this.keycloak.getBearerExcludedUrls();
    if (!excludedUrls) {
      return next.handle(req);
    }

    const addHeader: string | undefined = excludedUrls.find(urlPattern =>
      /urlPattern/gi.test(urlRequest)
    );
    if (addHeader) {
      return next.handle(req);
    }

    return this.keycloak.addTokenToHeader(req.headers).mergeMap(headersWithBearer => {
      const kcReq = req.clone({ headers: headersWithBearer });
      return next.handle(kcReq);
    });
  }
}
