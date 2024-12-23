/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import { TestBed } from '@angular/core/testing';
import Keycloak, { KeycloakError } from 'keycloak-js';
import {
  KeycloakEventType,
  typeEventArgs,
  createKeycloakSignal,
  KEYCLOAK_EVENT_SIGNAL,
  ActionUpdateArgs,
  AuthErrorArgs
} from './keycloak-events-signal';

describe('Keycloak Events', () => {
  describe('typeEventArgs', () => {
    it('should typecast arguments to the specified type', () => {
      const inputArgs = { status: 'success', action: 'updateProfile' };
      const result = typeEventArgs<ActionUpdateArgs>(inputArgs);
      expect(result).toEqual(inputArgs as ActionUpdateArgs);
    });

    it('should not modify the input object during typecasting', () => {
      const inputArgs = {
        error: 'SOME ERROR',
        error_description: 'This is a critical error'
      };
      const result = typeEventArgs<AuthErrorArgs>(inputArgs);
      expect(result).toBe(inputArgs);
    });
  });

  describe('createKeycloakSignal', () => {
    let keycloakMock: jasmine.SpyObj<Keycloak>;

    beforeEach(() => {
      keycloakMock = jasmine.createSpyObj<Keycloak>('Keycloak', [
        'onReady',
        'onAuthError',
        'onAuthLogout',
        'onActionUpdate',
        'onAuthRefreshError',
        'onAuthRefreshSuccess',
        'onAuthSuccess',
        'onTokenExpired'
      ]);
    });

    it('should initialize with KeycloakAngularNotInitialized if no Keycloak instance is provided', () => {
      const signal = createKeycloakSignal();
      const currentSignalValue = signal();
      expect(currentSignalValue.type).toBe(KeycloakEventType.KeycloakAngularNotInitialized);
    });

    it('should initialize with KeycloakAngularInit when a Keycloak instance is provided', () => {
      const signal = createKeycloakSignal(keycloakMock);
      const currentSignalValue = signal();
      expect(currentSignalValue.type).toBe(KeycloakEventType.KeycloakAngularInit);
    });

    it('should update the signal on Keycloak onReady event', () => {
      const signal = createKeycloakSignal(keycloakMock);
      const mockAuthenticated = true;

      keycloakMock.onReady?.(mockAuthenticated);
      const currentSignalValue = signal();
      expect(currentSignalValue.type).toBe(KeycloakEventType.Ready);
      expect(currentSignalValue.args).toBe(mockAuthenticated);
    });

    it('should update the signal on Keycloak onAuthError event', () => {
      const signal = createKeycloakSignal(keycloakMock);
      const mockError: KeycloakError = {
        error: 'test-error',
        error_description: 'test-description'
      };

      keycloakMock.onAuthError?.(mockError);
      const currentSignalValue = signal();
      expect(currentSignalValue.type).toBe(KeycloakEventType.AuthError);
      expect(currentSignalValue.args).toBe(mockError);
    });

    it('should update the signal on Keycloak onAuthLogout event', () => {
      const signal = createKeycloakSignal(keycloakMock);

      keycloakMock.onAuthLogout?.();
      const currentSignalValue = signal();
      expect(currentSignalValue.type).toBe(KeycloakEventType.AuthLogout);
    });

    it('should update the signal on Keycloak onActionUpdate event', () => {
      const signal = createKeycloakSignal(keycloakMock);
      const mockStatus = 'success';
      const mockAction = 'test-action';

      keycloakMock.onActionUpdate?.(mockStatus, mockAction);
      const currentSignalValue = signal();
      expect(currentSignalValue.type).toBe(KeycloakEventType.ActionUpdate);
      expect(currentSignalValue.args).toEqual({
        status: mockStatus,
        action: mockAction
      });
    });

    it('should update the signal on Keycloak onAuthRefreshError event', () => {
      const signal = createKeycloakSignal(keycloakMock);

      keycloakMock.onAuthRefreshError?.();
      const currentSignalValue = signal();
      expect(currentSignalValue.type).toBe(KeycloakEventType.AuthRefreshError);
    });

    it('should update the signal on Keycloak onAuthRefreshSuccess event', () => {
      const signal = createKeycloakSignal(keycloakMock);

      keycloakMock.onAuthRefreshSuccess?.();
      const currentSignalValue = signal();
      expect(currentSignalValue.type).toBe(KeycloakEventType.AuthRefreshSuccess);
    });

    it('should update the signal on Keycloak onAuthSuccess event', () => {
      const signal = createKeycloakSignal(keycloakMock);

      keycloakMock.onAuthSuccess?.();
      const currentSignalValue = signal();
      expect(currentSignalValue.type).toBe(KeycloakEventType.AuthSuccess);
    });

    it('should update the signal on Keycloak onTokenExpired event', () => {
      const signal = createKeycloakSignal(keycloakMock);

      keycloakMock.onTokenExpired?.();
      const currentSignalValue = signal();
      expect(currentSignalValue.type).toBe(KeycloakEventType.TokenExpired);
    });
  });

  describe('KEYCLOAK_EVENT_SIGNAL InjectionToken', () => {
    it('should provide an InjectionToken for Keycloak signal', () => {
      TestBed.configureTestingModule({
        providers: [{ provide: KEYCLOAK_EVENT_SIGNAL, useValue: createKeycloakSignal() }]
      });

      const signal = TestBed.inject(KEYCLOAK_EVENT_SIGNAL);
      expect(signal).toBeTruthy();
      expect(signal()).toEqual({
        type: KeycloakEventType.KeycloakAngularNotInitialized
      });
    });
  });
});
