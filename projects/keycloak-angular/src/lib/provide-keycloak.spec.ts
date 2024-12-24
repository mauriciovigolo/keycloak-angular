/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import Keycloak, { KeycloakConfig, KeycloakInitOptions } from 'keycloak-js';
import { TestBed } from '@angular/core/testing';

import { provideKeycloak } from './provide-keycloak';
import { KeycloakFeature } from './features/keycloak.feature';
import { createInterceptorCondition } from './interceptors/keycloak.interceptor';
import {
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  IncludeBearerTokenCondition
} from './interceptors/include-bearer-token.interceptor';

describe('provideKeycloak', () => {
  it('should instantiate keycloak and initialize it if initOptions is provided', () => {
    const config: KeycloakConfig = {
      url: 'kc-server-url',
      realm: 'realm-name',
      clientId: 'client-id'
    };

    const initOptions: KeycloakInitOptions = {
      onLoad: 'login-required'
    };

    TestBed.configureTestingModule({
      providers: [provideKeycloak({ config, initOptions })]
    });

    const keycloak = TestBed.inject(Keycloak);

    expect(keycloak).toBeDefined();
    expect(keycloak.didInitialize).toBeTrue();
  });

  it('should instantiate keycloak but not initialize it if initConfig is not provided', () => {
    const config: KeycloakConfig = {
      url: 'kc-server-url',
      realm: 'realm-name',
      clientId: 'client-id'
    };

    TestBed.configureTestingModule({
      providers: [provideKeycloak({ config })]
    });

    const keycloak = TestBed.inject(Keycloak);

    expect(keycloak).toBeDefined();
    expect(keycloak.didInitialize).toBeFalse();
  });

  it('should instantiate keycloak and be able to initialize the instance later', () => {
    const config: KeycloakConfig = {
      url: 'kc-server-url',
      realm: 'realm-name',
      clientId: 'client-id'
    };

    const initOptions: KeycloakInitOptions = {
      onLoad: 'login-required'
    };

    TestBed.configureTestingModule({
      providers: [provideKeycloak({ config })]
    });

    const keycloak = TestBed.inject(Keycloak);

    expect(keycloak).toBeDefined();
    expect(keycloak.didInitialize).toBeFalse();

    keycloak.init(initOptions);

    expect(keycloak.didInitialize).toBeTrue();
  });

  it('should be able to add providers during the initialization', () => {
    const config: KeycloakConfig = {
      url: 'kc-server-url',
      realm: 'realm-name',
      clientId: 'client-id'
    };

    const initOptions: KeycloakInitOptions = {
      onLoad: 'login-required'
    };

    const provideKeycloakAngular = provideKeycloak({
      config,
      initOptions,
      providers: [
        {
          provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
          useValue: [
            createInterceptorCondition<IncludeBearerTokenCondition>({
              urlPattern: /localhost:8181/gi,
              httpMethods: ['GET', 'POST']
            })
          ]
        }
      ]
    });

    TestBed.configureTestingModule({
      providers: [provideKeycloakAngular]
    });

    const keycloak = TestBed.inject(Keycloak);
    const interceptorIT = TestBed.inject(INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG);

    expect(keycloak).toBeDefined();
    expect(interceptorIT).toBeDefined();
  });

  it('should be able to add keycloak features during the initialization', () => {
    const config: KeycloakConfig = {
      url: 'kc-server-url',
      realm: 'realm-name',
      clientId: 'client-id'
    };

    const initOptions: KeycloakInitOptions = {
      onLoad: 'check-sso'
    };

    const withCustomFeature: KeycloakFeature = {
      configure: () => {}
    };
    const withCustomFeatureSpy = spyOn(withCustomFeature, 'configure');

    const provideKeycloakAngular = provideKeycloak({
      config,
      initOptions,
      features: [withCustomFeature]
    });

    TestBed.configureTestingModule({
      providers: [provideKeycloakAngular]
    });
    const keycloak = TestBed.inject(Keycloak);

    expect(keycloak).toBeDefined();
    expect(withCustomFeatureSpy).toHaveBeenCalled();
  });
});
