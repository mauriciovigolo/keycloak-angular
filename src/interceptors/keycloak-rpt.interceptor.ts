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
  HttpHeaders,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { KeycloakService } from '../services';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/of';
import { Observer } from 'rxjs/Observer';

import * as KeycloakAuthorization from '../keycloak-authz-js/keycloak-authz';

/**
 * This interceptor includes the RPT by default in all HttpClient requests.
 *
 * If you need to exclude some URLs from adding the rpt, please, take a look
 * at the {@link KeycloakOptions} rptExcludedUrls property.
 */
@Injectable()
export class KeycloakRptInterceptor implements HttpInterceptor {
  private excludedUrlsRegex: RegExp[];

  /**
   * KeycloakRptInterceptor constructor.
   *
   * @param keycloak - Injected KeycloakService instance.
   */
  constructor(private keycloak: KeycloakService) {}

  private loadExcludedUrlsRegex() {
    const excludedUrls: string[] = this.keycloak.getRptExcludedUrls();
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
    console.log('KeycloakRptInterceptor');

    // If keycloak service is not initialized yet, or if authorization is not enabled or exclude URLs are not set
    if (
      !this.keycloak ||
      !this.keycloak.isEnabledAuthorization ||
      !this.keycloak.getRptExcludedUrls()
    ) {
      console.log('KeycloakRptInterceptor skip 1');
      return next.handle(req);
    }

    const urlRequest = req.url;

    if (!this.excludedUrlsRegex) {
      this.loadExcludedUrlsRegex();
    }

    const shallPass: boolean = !!this.excludedUrlsRegex.find(regex => regex.test(urlRequest));
    if (shallPass) {
      console.log('KeycloakRptInterceptor skip 2');
      return next.handle(req);
    }

    // requests which have not been excluded will get RPT added or if no RPT was obtained until now, then the Access token is added

    let headersWithRPTorAccessToken$: Observable<HttpHeaders>;

    if (
      this.keycloak.isEnabledAuthorization &&
      this.keycloak.getKeycloakAuthorizationInstance() &&
      this.keycloak.getRPT()
    ) {
      let headersWithRpt: HttpHeaders = this.keycloak.addRPTToHeader(req.headers);
      headersWithRPTorAccessToken$ = Observable.of(headersWithRpt);
    } else {
      headersWithRPTorAccessToken$ = this.keycloak.addTokenToHeader(req.headers);
    }

    return headersWithRPTorAccessToken$.switchMap(headersWithRPTorAccessToken => {
      const kcReq = req.clone({ headers: headersWithRPTorAccessToken });
      return next.handle(kcReq).catch((error, caught) => {
        // if error is with code 401 (Authorization error) and the www-authenticate is present try to get valid RPT
        if (this.isAuthError(error) && this.hasResponseWWWAuthenthicateHeader(error)) {
          //make sure that the access token is fresh, a valid access token is needed to obtain an RPT
          let updateTokenObservable = Observable.fromPromise(this.keycloak.updateToken(10));
          return updateTokenObservable.switchMap(wasRefreshed => {
            let wwwAuthenticateHeader = error.headers.get('www-authenticate');
            let ticket = null;

            // Handle Authorization Responses from a UMA-Protected Resource Server, entitlement api not implemented yet
            if (wwwAuthenticateHeader.indexOf('UMA') != -1) {
              // extract ticket parameter from www-authenticate header
              var params = wwwAuthenticateHeader.split(',');
              for (let i = 0; i < params.length; i++) {
                var param = params[i].split('=');
                if (param[0] == 'ticket') {
                  ticket = param[1].substring(1, param[1].length - 1).trim();
                }
              }
            }
            // if failed to extract the ticket string
            if (ticket == null && this.keycloak.getResourceServerAuthorizationType() == 'uma') {
              return Observable.throw(error);
            }

            //construct authorization request
            let authorizationRequest: KeycloakAuthorization.KeycloakAuthorizationRequest = {
              ...this.keycloak.getKeycloakAuthorizationInstance,
              ticket
            };
            return this.getNewRPT(authorizationRequest)
              .catch(e => {
                return Observable.throw(error);
              })
              .switchMap(rpt => {
                let headersWithRpt: HttpHeaders = this.keycloak.addRPTToHeader(req.headers);
                const kcReq = req.clone({ headers: headersWithRpt });
                return next.handle(kcReq);
              });
          });
          // when entitlement API is to be used try to get valid RPT
        } else if (this.keycloak.getResourceServerAuthorizationType() == 'entitlement') {
          //construct authorization request
          let authorizationRequest: KeycloakAuthorization.KeycloakAuthorizationRequest = this.keycloak.getAuthorizationRequestTemplate;
          return this.getNewRPT(authorizationRequest)
            .catch(e => {
              return Observable.throw(error);
            })
            .switchMap(rpt => {
              let headersWithRpt: HttpHeaders = this.keycloak.addRPTToHeader(req.headers);
              const kcReq = req.clone({ headers: headersWithRpt });
              return next.handle(kcReq);
            });
        } else {
          return Observable.throw(error);
        }
      });
    });
  }

  /**
   * Wrapper for KeycloakAuhtorization.authrize() fucntion. Handles UMA authorization.
   *
   * @param req
   * @param next
   */
  private getNewRPT(
    authorizationRequest: KeycloakAuthorization.KeycloakAuthorizationRequest
  ): Observable<string> {
    var authz = this.keycloak.getKeycloakAuthorizationInstance();

    return Observable.create(async (observer: Observer<any>) => {
      try {
        if (this.keycloak.getResourceServerAuthorizationType() == 'entitlement') {
          authz.entitlement(this.keycloak.getResourceServerID(), authorizationRequest).then(
            rpt => {
              observer.next(rpt);
              observer.complete();
            },
            () => {
              observer.error('Authorization request was denied by the server.');
            },
            () => {
              observer.error('Could not obtain authorization data from server.');
            }
          );
        } else {
          if (this.keycloak.getResourceServerAuthorizationType() == 'uma') {
            authz.authorize(authorizationRequest).then(
              rpt => {
                observer.next(rpt);
                observer.complete();
              },
              () => {
                observer.error('Authorization request was denied by the server.');
              },
              () => {
                observer.error('Could not obtain authorization data from server.');
              }
            );
          }
        }
      } catch (error) {
        observer.error(error);
      }
    });
  }

  private isAuthError(error: any): boolean {
    return error instanceof HttpErrorResponse && error.status === 401;
  }

  private hasResponseWWWAuthenthicateHeader(error: any): boolean {
    return error instanceof HttpErrorResponse && error.headers.has('www-authenticate');
  }

  private getAndApplyRPTToken(error: any): boolean {
    return error instanceof HttpErrorResponse && error.status === 401;
  }
}
