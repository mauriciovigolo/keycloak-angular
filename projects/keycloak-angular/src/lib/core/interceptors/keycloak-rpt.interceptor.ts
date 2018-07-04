/**
 * @license
 * Copyright Swisscom (Schweiz) AG and contributors.
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
  HttpHeaders,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable, from as fromPromise, Observer, of } from 'rxjs';
import { mergeMap, switchMap, catchError } from 'rxjs/operators';

import { KeycloakService } from '../services/keycloak.service';

/**
 * This interceptor includes the bearer by default in all HttpClient requests.
 *
 * If you need to exclude some URLs from adding the bearer, please, take a look
 * at the {@link KeycloakOptions} bearerExcludedUrls property.
 */
@Injectable()
export class KeycloakRptInterceptor implements HttpInterceptor {
  private excludedUrlsRegex: RegExp[];

  /**
   * KeycloakBearerInterceptor constructor.
   *
   * @param keycloak - Injected KeycloakService instance.
   */
  constructor(private keycloak: KeycloakService) {}

  private loadExcludedUrlsRegex() {
    const excludedUrls: string[] = this.keycloak.rptExcludedUrls;
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
    // If keycloak service is not initialized yet, or if authorization is not enabled or exclude URLs are not set
    if (!this.keycloak || !this.keycloak.isEnableRPTInterceptor || !this.keycloak.rptExcludedUrls) {
      return next.handle(req);
    }

    const urlRequest = req.url;
    if (!this.excludedUrlsRegex) {
      this.loadExcludedUrlsRegex();
    }

    const shallPass: boolean = !!this.excludedUrlsRegex.find(regex => regex.test(urlRequest));
    if (shallPass) {
      return next.handle(req);
    }

    let headersWithRPTorAccessToken$: Observable<HttpHeaders>;

    // requests which have not been excluded will get RPT added or if no RPT was obtained until now, then the Access token is added
    if (
      this.keycloak.isEnableRPTInterceptor &&
      this.keycloak.keycloakAuthorizationInstance &&
      this.keycloak.RPT
    ) {
      //if RPT already was loaded, then add RPT
      let headersWithRpt: HttpHeaders = this.keycloak.addRPTToHeader(req.headers);
      // make an observable out of headersWithRpt, this is just for convenience:
      // addTokenToHeader() returns observable but addRPTToHeader() is a simple function,
      // making result of addRPTToHeader() to an observable allows me to have the same flow
      // after this if-else regardless if RPT or access token was added to headers
      headersWithRPTorAccessToken$ = of(headersWithRpt);
    } else {
      //if there is no RPT yet, then add the access token
      headersWithRPTorAccessToken$ = this.keycloak.addTokenToHeader(req.headers);
    }

    return headersWithRPTorAccessToken$.pipe(
      switchMap(headersWithRPTorAccessToken => {
        // send out the request with added RPT or Access Token
        const kcReq = req.clone({ headers: headersWithRPTorAccessToken });
        return next.handle(kcReq);
      }),
      catchError((error, caught) => {
        // if error is with code 401 (Authorization error), the www-authenticate is present, and
        // resourceServerAuthorizationType is 'uma'
        // we can try to get valid RPT based on the authorization ticket which we received in the
        // response (it is inside www-authenticate response header)
        if (
          this.isAuthError(error) &&
          this.hasResponseWWWAuthenthicateHeader(error) &&
          this.keycloak.resourceServerAuthorizationType == 'uma'
        ) {
          //make sure that the access token is fresh, a valid access token is needed to obtain an RPT
          let updateTokenObservable = fromPromise(this.keycloak.updateToken(10));
          return updateTokenObservable.pipe(
            switchMap(wasRefreshed => {
              let wwwAuthenticateHeader = error.headers.get('www-authenticate');
              let ticket = null;

              // Handle Authorization Responses from a UMA-Protected Resource Server
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
              if (ticket == null) {
                return Observable.throw(error);
              }
              //construct authorization request
              let authorizationRequest: KeycloakAuthorization.AuthorizationRequest = {
                ...this.keycloak.authorizationRequestTemplate,
                ticket
              };
              return this.getNewRPT(authorizationRequest).pipe(
                catchError(e => {
                  return Observable.throw(error);
                }),
                switchMap(rpt => {
                  let headersWithRpt: HttpHeaders = this.keycloak.addRPTToHeader(req.headers);
                  const kcReq: HttpRequest<any> = req.clone({ headers: headersWithRpt });
                  return next.handle(kcReq);
                })
              );
            })
          );
          // when entitlement API is to be used try to get valid RPT
        } else if (this.keycloak.resourceServerAuthorizationType == 'entitlement') {
          //construct authorization request
          let authorizationRequest: KeycloakAuthorization.AuthorizationRequest = this.keycloak
            .authorizationRequestTemplate;
          return this.getNewRPT(authorizationRequest).pipe(
            catchError(e => {
              return Observable.throw(error);
            }),
            switchMap(rpt => {
              let headersWithRpt: HttpHeaders = this.keycloak.addRPTToHeader(req.headers);
              const kcReq: HttpRequest<any> = req.clone({ headers: headersWithRpt });
              return next.handle(kcReq);
            })
          );
        } else {
          return Observable.throw(error);
        }
      })
    );
  }

  /**
   * Wrapper for KeycloakAuhtorization.authrize() fucntion. Handles UMA and entitlement API authorization.
   *
   * @param req
   * @param next
   */
  private getNewRPT(
    authorizationRequest: KeycloakAuthorization.AuthorizationRequest
  ): Observable<string> {
    var authz = this.keycloak.keycloakAuthorizationInstance;

    return Observable.create(async (observer: Observer<any>) => {
      try {
        if (this.keycloak.resourceServerAuthorizationType == 'entitlement') {
          authz.entitlement(this.keycloak.resourceServerID, authorizationRequest).then(
            rpt => {
              this.keycloak.RPTupdateEmitter.next(rpt);
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
          if (this.keycloak.resourceServerAuthorizationType == 'uma') {
            authz.authorize(authorizationRequest).then(
              rpt => {
                this.keycloak.RPTupdateEmitter.next(rpt);
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
