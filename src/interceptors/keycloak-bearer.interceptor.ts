/**
* @license
* Copyright Mauricio Gemelli Vigolo.
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

@Injectable()
export class KeycloakBearerInterceptor implements HttpInterceptor {
  constructor(private keycloak: KeycloakService) {}

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
