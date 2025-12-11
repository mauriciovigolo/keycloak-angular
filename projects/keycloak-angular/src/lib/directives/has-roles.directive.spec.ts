/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */

import { TemplateRef, ViewContainerRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import Keycloak from 'keycloak-js';

import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from '../signals/keycloak-events-signal';
import { HasRolesDirective } from './has-roles.directive';

describe('HasRolesDirective', () => {
  let mockTemplateRef: jasmine.SpyObj<TemplateRef<unknown>>;
  let mockViewContainerRef: jasmine.SpyObj<ViewContainerRef>;
  let mockKeycloak: jasmine.SpyObj<Keycloak>;
  let keycloakSignal: jasmine.Spy & (() => { type: KeycloakEventType });

  beforeEach(() => {
    mockTemplateRef = jasmine.createSpyObj('TemplateRef', ['']);
    mockViewContainerRef = jasmine.createSpyObj('ViewContainerRef', ['createEmbeddedView', 'clear']);
    mockKeycloak = jasmine.createSpyObj<Keycloak>('Keycloak', ['hasResourceRole', 'hasRealmRole']);
    keycloakSignal = jasmine.createSpy('Signal').and.returnValue({
      type: KeycloakEventType.Ready,
      args: true
    });

    TestBed.configureTestingModule({
      providers: [
        HasRolesDirective,
        { provide: TemplateRef, useValue: mockTemplateRef },
        { provide: ViewContainerRef, useValue: mockViewContainerRef },
        { provide: Keycloak, useValue: mockKeycloak },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: keycloakSignal }
      ]
    });
  });

  it('should create an embedded view when user has a resource role', () => {
    mockKeycloak.hasResourceRole.and.returnValue(true);

    TestBed.runInInjectionContext(() => {
      const directive = TestBed.inject(HasRolesDirective);
      directive.roles = ['admin'];
      directive.resource = 'my-client';

      directive['render']();

      expect(mockKeycloak.hasResourceRole).toHaveBeenCalledWith('admin', 'my-client');
      expect(mockViewContainerRef.createEmbeddedView).toHaveBeenCalledWith(mockTemplateRef);
    });
  });

  it('should clear the view when user does not have a resource role', () => {
    mockKeycloak.hasResourceRole.and.returnValue(false);

    TestBed.runInInjectionContext(() => {
      const directive = TestBed.inject(HasRolesDirective);
      directive.roles = ['admin'];
      directive.resource = 'my-client';

      directive['render']();

      expect(mockKeycloak.hasResourceRole).toHaveBeenCalledWith('admin', 'my-client');
      expect(mockViewContainerRef.clear).toHaveBeenCalled();
    });
  });

  it('should create an embedded view when user has a realm role', () => {
    mockKeycloak.hasRealmRole.and.returnValue(true);

    TestBed.runInInjectionContext(() => {
      const directive = TestBed.inject(HasRolesDirective);
      directive.roles = ['editor'];
      directive.checkRealm = true;

      directive['render']();

      expect(mockKeycloak.hasRealmRole).toHaveBeenCalledWith('editor');
      expect(mockViewContainerRef.createEmbeddedView).toHaveBeenCalledWith(mockTemplateRef);
    });
  });

  it('should clear the view when user does not have a realm role', () => {
    mockKeycloak.hasRealmRole.and.returnValue(false);

    TestBed.runInInjectionContext(() => {
      const directive = TestBed.inject(HasRolesDirective);
      directive.roles = ['editor'];
      directive.checkRealm = true;

      directive['render']();

      expect(mockKeycloak.hasRealmRole).toHaveBeenCalledWith('editor');
      expect(mockViewContainerRef.clear).toHaveBeenCalled();
    });
  });

  it('should clear the view when Keycloak is not ready', () => {
    keycloakSignal.and.returnValue({ type: KeycloakEventType.AuthError });

    TestBed.runInInjectionContext(() => {
      const directive = TestBed.inject(HasRolesDirective);

      directive['render']();

      expect(mockViewContainerRef.clear).toHaveBeenCalled();
      expect(mockKeycloak.hasResourceRole).not.toHaveBeenCalled();
      expect(mockKeycloak.hasRealmRole).not.toHaveBeenCalled();
    });
  });

  it('should clear the view on Keycloak logOut', () => {
    keycloakSignal.and.returnValue({ type: KeycloakEventType.AuthLogout });

    TestBed.runInInjectionContext(() => {
      const directive = TestBed.inject(HasRolesDirective);
      directive['render']();

      expect(mockViewContainerRef.clear).toHaveBeenCalled();
    });
  });

  it('should re-render on TokenExpired', () => {
    keycloakSignal.and.returnValue({ type: KeycloakEventType.TokenExpired });

    mockKeycloak.hasRealmRole.and.returnValue(true);

    TestBed.runInInjectionContext(() => {
      const directive = TestBed.inject(HasRolesDirective);
      directive.roles = ['editor'];
      directive.checkRealm = true;

      directive['render']();

      expect(mockViewContainerRef.createEmbeddedView).toHaveBeenCalledWith(mockTemplateRef);
    });
  });
});
