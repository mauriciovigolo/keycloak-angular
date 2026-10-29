/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import {
  FetchBackend,
  HttpBackend,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaderResponse,
  HttpHeaders,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import {
  EnvironmentProviders,
  inject,
  Injectable,
  InjectionToken,
  makeEnvironmentProviders,
  Type
} from '@angular/core';
import Keycloak from 'keycloak-js';
import { Observable, Observer } from 'rxjs';
import { KEYCLOAK_TOKEN_ATTACHED } from './keycloak-http-context';

type KeycloakDpopClient = Keycloak & {
  fetch?: (url: URL | RequestInfo, init?: RequestInit) => Promise<Response>;
};

/** Options for requests that do not carry the current Keycloak token. */
export type KeycloakDpopHttpBackendOptions = {
  /** Defaults to FetchBackend. Use HttpXhrBackend with `provideHttpClient(withXhr())`. */
  delegateBackend?: Type<HttpBackend>;
};

const DELEGATE_BACKEND = new InjectionToken<HttpBackend>('Keycloak DPoP delegate backend');
const XSSI_PREFIX = /^\)\]\}',?\n/;

@Injectable()
class KeycloakDpopHttpBackend extends HttpBackend {
  private readonly keycloak = inject(Keycloak) as KeycloakDpopClient;
  private readonly delegate = inject(DELEGATE_BACKEND);

  override handle(request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    const token = this.keycloak.token;
    const authorization = request.headers.get('Authorization');
    const matchesToken = this.keycloak.authenticated && token && authorization === `Bearer ${token}`;
    if (!matchesToken && !request.context.get(KEYCLOAK_TOKEN_ATTACHED)) {
      return this.delegate.handle(request);
    }

    return new Observable((observer) => {
      if (!matchesToken || !this.keycloak.authenticated || this.keycloak.token !== token) {
        observer.error(
          new HttpErrorResponse({
            error: new Error('Keycloak authentication changed before the request was sent.'),
            url: request.urlWithParams
          })
        );
        return;
      }
      const abort = new AbortController();
      let finished = false;
      const timeout = request.timeout
        ? setTimeout(() => abort.abort(new DOMException('Request timed out', 'TimeoutError')), request.timeout)
        : undefined;

      this.send(request, abort.signal, observer).then(
        (response) => {
          finished = true;
          observer.next(response);
          observer.complete();
        },
        (error: unknown) => {
          finished = true;
          observer.error(
            error instanceof HttpErrorResponse ? error : new HttpErrorResponse({ error, url: request.urlWithParams })
          );
        }
      );

      return () => {
        if (timeout !== undefined) clearTimeout(timeout);
        if (!finished) abort.abort();
      };
    });
  }

  private async send(
    request: HttpRequest<unknown>,
    signal: AbortSignal,
    observer: Observer<HttpEvent<unknown>>
  ): Promise<HttpResponse<unknown>> {
    if (request.reportUploadProgress) {
      throw new Error('Keycloak DPoP requests use Fetch, which does not support upload progress.');
    }
    const fetch = this.keycloak.fetch;
    if (typeof fetch !== 'function') {
      throw new Error('The installed keycloak-js client does not provide the DPoP-aware fetch method.');
    }

    const headers = new Headers();
    for (const name of request.headers.keys()) {
      headers.set(name, (request.headers.getAll(name) ?? []).join(','));
    }
    if (!headers.has('Accept')) headers.set('Accept', 'application/json, text/plain, */*');
    const contentType = request.detectContentTypeHeader();
    if (!headers.has('Content-Type') && contentType !== null) headers.set('Content-Type', contentType);

    const responsePromise = fetch.call(this.keycloak, request.urlWithParams, {
      method: request.method,
      headers,
      body: request.serializeBody(),
      credentials: request.withCredentials ? 'include' : request.credentials,
      keepalive: request.keepalive,
      cache: request.cache,
      priority: request.priority,
      mode: request.mode,
      redirect: request.redirect,
      referrer: request.referrer,
      integrity: request.integrity,
      referrerPolicy: request.referrerPolicy,
      signal
    });
    observer.next({ type: HttpEventType.Sent });

    const response = await responsePromise;
    const responseHeaders = new HttpHeaders(response.headers);
    const url = response.url || request.urlWithParams;
    const responseInfo = {
      headers: responseHeaders,
      status: response.status,
      statusText: response.statusText,
      url,
      redirected: response.redirected,
      responseType: response.type
    };
    const reportProgress = request.reportProgress || request.reportDownloadProgress;
    if (reportProgress) observer.next(new HttpHeaderResponse(responseInfo));

    let body: unknown = null;
    try {
      if (response.body) {
        const bytes = reportProgress ? await readBody(response, request, observer) : await response.arrayBuffer();
        body = parseBody(bytes, request.responseType, response.headers.get('Content-Type') ?? '', response.status);
      }
    } catch (error) {
      throw new HttpErrorResponse({ ...responseInfo, error });
    }

    const status = response.status === 0 && body ? 200 : response.status;
    if (status < 200 || status >= 300) {
      throw new HttpErrorResponse({ ...responseInfo, status, error: body });
    }
    return new HttpResponse({ ...responseInfo, status, body });
  }
}

async function readBody(
  response: Response,
  request: HttpRequest<unknown>,
  observer: Observer<HttpEvent<unknown>>
): Promise<ArrayBuffer> {
  const reader = response.body!.getReader();
  const chunks: Uint8Array[] = [];
  const length = response.headers.get('Content-Length');
  const total = length === null ? undefined : Number(length);
  const decoder = request.responseType === 'text' ? textDecoder(response.headers.get('Content-Type') ?? '') : undefined;
  let loaded = 0;
  let partialText = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.byteLength;
      if (decoder) partialText += decoder.decode(value, { stream: true });
      observer.next({
        type: HttpEventType.DownloadProgress,
        loaded,
        total: total !== undefined && Number.isFinite(total) ? total : undefined,
        partialText: decoder ? partialText : undefined
      });
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes.buffer;
}

function parseBody(
  bytes: ArrayBuffer,
  responseType: HttpRequest<unknown>['responseType'],
  contentType: string,
  status: number
): unknown {
  switch (responseType) {
    case 'arraybuffer':
      return bytes;
    case 'blob':
      return new Blob([bytes], { type: contentType });
    case 'text':
      return textDecoder(contentType).decode(bytes);
    case 'json': {
      const text = new TextDecoder().decode(bytes).replace(XSSI_PREFIX, '');
      if (!text) return null;
      try {
        return JSON.parse(text) as unknown;
      } catch (error) {
        if (status < 200 || status >= 300) return text;
        throw error;
      }
    }
  }
}

function textDecoder(contentType: string): TextDecoder {
  const charset = /charset\s*=\s*["']?([^;"'\s]+)/i.exec(contentType)?.[1];
  try {
    return new TextDecoder(charset);
  } catch {
    return new TextDecoder();
  }
}

/**
 * Routes requests carrying the current Keycloak Bearer token through Keycloak JS.
 * Register after `provideHttpClient(...)` and use a Bearer interceptor to select
 * trusted URLs and refresh the token.
 */
export function provideKeycloakDpopHttpBackend(options: KeycloakDpopHttpBackendOptions = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: DELEGATE_BACKEND, useExisting: options.delegateBackend ?? FetchBackend },
    KeycloakDpopHttpBackend,
    { provide: HttpBackend, useExisting: KeycloakDpopHttpBackend }
  ]);
}
