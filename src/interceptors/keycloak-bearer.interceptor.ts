/**
* @license
* Copyright Mauricio Gemelli Vigolo. All Rights Reserved.
*
* Use of this source code is governed by a MIT-style license that can be
* found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
*/
import { Observer } from 'rxjs/Rx';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpHeaders
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { KeycloakService } from '../services';

@Injectable()
export class KeycloakBearerInterceptor implements HttpInterceptor {
  constructor(private keycloak: KeycloakService) {}

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const urlRequest = req.url;
    const excludedUrls: string[] = this.keycloak.getBearerExcludedUrls();

    const addHeader: string | undefined = excludedUrls.find(urlPattern =>
      /urlPattern/gi.test(urlRequest)
    );
    if (addHeader) {
      return next.handle(req);
    }

    return Observable.create(async (observer: Observer<any>) => {
      try {
        const headersWithBearer: HttpHeaders = await this.keycloak.addTokenToHeader(req.headers);
        const kcReq = req.clone({ headers: headersWithBearer });
        return next.handle(kcReq);
      } catch (error) {
        observer.error(error);
      }
    });
  }
}
