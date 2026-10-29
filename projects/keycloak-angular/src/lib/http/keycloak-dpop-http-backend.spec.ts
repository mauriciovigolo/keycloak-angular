/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpRequest,
  HttpResponse,
  httpResource,
  provideHttpClient,
  withInterceptors,
  withNoXsrfProtection
} from '@angular/common/http';
import { ApplicationRef, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import Keycloak from 'keycloak-js';
import { firstValueFrom, Observable, of, toArray } from 'rxjs';
import { provideKeycloakDpopHttpBackend } from './keycloak-dpop-http-backend';
import {
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  includeBearerTokenInterceptor
} from '../interceptors/include-bearer-token.interceptor';

@Injectable()
class DelegateBackend extends HttpBackend {
  handle(request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    return of(new HttpResponse({ body: 'delegate', url: request.urlWithParams }));
  }
}

describe('Keycloak DPoP HTTP backend', () => {
  let keycloak: { authenticated: boolean; token: string; fetch: jasmine.Spy; updateToken: jasmine.Spy };
  let http: HttpClient;

  beforeEach(() => {
    keycloak = {
      authenticated: true,
      token: 'token',
      fetch: jasmine.createSpy('fetch'),
      updateToken: jasmine.createSpy('updateToken').and.resolveTo(true)
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: Keycloak, useValue: keycloak },
        {
          provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
          useValue: [{ urlPattern: /^\/rotate-token$/ }]
        },
        DelegateBackend,
        provideHttpClient(
          withInterceptors([
            includeBearerTokenInterceptor,
            (request, next) => {
              if (request.url === '/rotate-token') keycloak.token = 'rotated-token';
              return next(request.clone({ setHeaders: { 'X-App': 'yes' } }));
            }
          ]),
          withNoXsrfProtection()
        ),
        provideKeycloakDpopHttpBackend({ delegateBackend: DelegateBackend })
      ]
    });
    http = TestBed.inject(HttpClient);
  });

  it('keeps interceptors and translates a Keycloak fetch response', async () => {
    keycloak.fetch.and.resolveTo(
      new Response('{"ok":true}', { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    const result = await firstValueFrom(
      http.post(
        '/api',
        { value: 1 },
        {
          headers: { Authorization: 'Bearer token' },
          params: { q: 'a' },
          observe: 'response'
        }
      )
    );
    expect(result.body).toEqual({ ok: true });
    expect(keycloak.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = keycloak.fetch.calls.mostRecent().args as [string, RequestInit];
    expect(url).toBe('/api?q=a');
    expect(new Headers(init.headers).get('X-App')).toBe('yes');
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer token');
    expect(init.body).toBe('{"value":1}');
    expect(init.method).toBe('POST');
  });

  it('delegates requests without the current Keycloak token', async () => {
    expect(await firstValueFrom(http.get('/public', { responseType: 'text' }))).toBe('delegate');
    expect(
      await firstValueFrom(
        http.get('/other-token', { headers: { Authorization: 'Bearer another-token' }, responseType: 'text' })
      )
    ).toBe('delegate');
    expect(keycloak.fetch).not.toHaveBeenCalled();
  });

  it('returns unsuccessful responses as HttpErrorResponse', async () => {
    keycloak.fetch.and.resolveTo(new Response('{"error":"denied"}', { status: 403 }));
    await expectAsync(
      firstValueFrom(http.get('/api', { headers: { Authorization: 'Bearer token' } }))
    ).toBeRejectedWith(jasmine.objectContaining({ status: 403, error: { error: 'denied' } }));
  });

  it('aborts an in-flight fetch when unsubscribed', () => {
    keycloak.fetch.and.returnValue(new Promise<Response>(() => {}));
    const subscription = http.get('/api', { headers: { Authorization: 'Bearer token' } }).subscribe();
    const signal = keycloak.fetch.calls.mostRecent().args[1].signal as AbortSignal;
    subscription.unsubscribe();
    expect(signal.aborted).toBeTrue();
  });

  it('cancels an in-flight request when its injector is destroyed', () => {
    keycloak.fetch.and.returnValue(new Promise<Response>(() => {}));
    const subscription = http.get('/api', { headers: { Authorization: 'Bearer token' } }).subscribe();
    const signal = keycloak.fetch.calls.mostRecent().args[1].signal as AbortSignal;

    TestBed.resetTestingModule();

    expect(signal.aborted).toBeTrue();
    expect(subscription.closed).toBeTrue();
  });

  it('fails rather than sending a token that changed before subscription', async () => {
    const backend = TestBed.inject(HttpBackend);
    const request = new HttpRequest('GET', '/api', null, {
      headers: new HttpHeaders({ Authorization: 'Bearer token' })
    });
    const response = backend.handle(request);
    keycloak.token = 'new-token';
    await expectAsync(firstValueFrom(response)).toBeRejectedWith(jasmine.any(HttpErrorResponse));
    expect(keycloak.fetch).not.toHaveBeenCalled();
  });

  it('reports unsupported upload progress without sending the request', async () => {
    const request = new HttpRequest('POST', '/api', 'body', {
      headers: new HttpHeaders({ Authorization: 'Bearer token' }),
      reportUploadProgress: true
    });
    await expectAsync(firstValueFrom(TestBed.inject(HttpBackend).handle(request))).toBeRejectedWith(
      jasmine.any(HttpErrorResponse)
    );
    expect(keycloak.fetch).not.toHaveBeenCalled();
  });

  it('fails closed if the token rotates after the Bearer interceptor attaches it', async () => {
    const delegate = spyOn(TestBed.inject(DelegateBackend), 'handle').and.callThrough();
    await expectAsync(firstValueFrom(http.get('/rotate-token'))).toBeRejectedWith(jasmine.any(HttpErrorResponse));
    expect(delegate).not.toHaveBeenCalled();
    expect(keycloak.fetch).not.toHaveBeenCalled();
  });

  it('aborts and reports a request timeout', async () => {
    let signal: AbortSignal;
    keycloak.fetch.and.callFake((_url: string, init: RequestInit) => {
      signal = init.signal!;
      return new Promise<Response>((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
      });
    });

    await expectAsync(
      firstValueFrom(http.get('/api', { headers: { Authorization: 'Bearer token' }, timeout: 10 }))
    ).toBeRejectedWith(jasmine.any(HttpErrorResponse));
    expect(signal!.aborted).toBeTrue();
    expect(signal!.reason.name).toBe('TimeoutError');
  });

  it('reports status zero when a timeout interrupts the response body', async () => {
    keycloak.fetch.and.callFake((_url: string, init: RequestInit) =>
      Promise.resolve(
        new Response(
          new ReadableStream({
            start(controller) {
              init.signal!.addEventListener('abort', () => controller.error(init.signal!.reason), { once: true });
            }
          })
        )
      )
    );

    await expectAsync(
      firstValueFrom(
        http.get('/api', {
          headers: { Authorization: 'Bearer token' },
          timeout: 10
        })
      )
    ).toBeRejectedWith(
      jasmine.objectContaining({
        status: 0,
        error: jasmine.objectContaining({ name: 'TimeoutError' })
      })
    );
  });

  it('supports httpResource text with FetchBackend UTF-8 semantics and download progress', async () => {
    keycloak.fetch.and.resolveTo(
      new Response('olá', {
        headers: { 'Content-Type': 'text/plain; charset=iso-8859-1' }
      })
    );
    const resource = TestBed.runInInjectionContext(() =>
      httpResource.text(() => ({
        url: '/api',
        headers: { Authorization: 'Bearer token' },
        reportProgress: true
      }))
    );

    TestBed.tick();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(resource.value()).toBe('olá');
    expect(resource.error()).toBeUndefined();
    expect(resource.progress()?.loaded).toBe(4);
  });

  it('preserves cumulative text download progress and the final response', async () => {
    const bytes = new TextEncoder().encode('olá mundo');
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes.subarray(0, 3));
        controller.enqueue(bytes.subarray(3));
        controller.close();
      }
    });
    keycloak.fetch.and.resolveTo(new Response(stream));
    const events = await firstValueFrom(
      http
        .get('/api', {
          headers: { Authorization: 'Bearer token' },
          responseType: 'text',
          observe: 'events',
          reportDownloadProgress: true
        })
        .pipe(toArray())
    );

    expect(events[0].type).toBe(HttpEventType.Sent);
    const progress = events.filter((event) => event.type === HttpEventType.DownloadProgress);
    expect(progress.map((event) => event.partialText)).toEqual(['ol', 'olá mundo']);
    expect((events.at(-1) as HttpResponse<string>).body).toBe('olá mundo');
  });

  it('preserves the HTTP status when a successful JSON response is malformed', async () => {
    keycloak.fetch.and.resolveTo(new Response('invalid JSON', { status: 200 }));
    await expectAsync(
      firstValueFrom(http.get('/api', { headers: { Authorization: 'Bearer token' } }))
    ).toBeRejectedWith(jasmine.objectContaining({ status: 200, error: jasmine.any(SyntaxError) }));
  });

  it('preserves download progress for callers using the legacy reportProgress option', async () => {
    keycloak.fetch.and.resolveTo(new Response('hello'));
    const events = await firstValueFrom(
      http
        .get('/api', {
          headers: { Authorization: 'Bearer token' },
          responseType: 'text',
          observe: 'events',
          reportProgress: true
        })
        .pipe(toArray())
    );

    expect(events.some((event) => event.type === HttpEventType.DownloadProgress && event.loaded === 5)).toBeTrue();
    expect((events.at(-1) as HttpResponse<string>).body).toBe('hello');
  });
});
