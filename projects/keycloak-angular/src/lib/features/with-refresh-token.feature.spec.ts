/**
 * @license
 * Copyright Mauricio Gemelli Vigolo All Rights Reserved.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/blob/main/LICENSE.md
 */
import { TestBed } from '@angular/core/testing';

import { AutoRefreshTokenService } from '../services/auto-refresh-token.service';
import { withAutoRefreshToken } from './with-refresh-token.feature';

describe('withAutoRefreshToken', () => {
  let mockAutoRefreshTokenService: jasmine.SpyObj<AutoRefreshTokenService>;

  beforeEach(() => {
    mockAutoRefreshTokenService = jasmine.createSpyObj<AutoRefreshTokenService>('AutoRefreshTokenService', ['start']);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AutoRefreshTokenService,
          useValue: mockAutoRefreshTokenService
        }
      ]
    });
  });

  it('should call start on AutoRefreshTokenService with default options', () => {
    TestBed.runInInjectionContext(() => {
      const feature = withAutoRefreshToken();
      feature.configure();

      expect(mockAutoRefreshTokenService.start).toHaveBeenCalledWith(undefined);
    });
  });

  it('should call start on AutoRefreshTokenService with provided options', () => {
    TestBed.runInInjectionContext(() => {
      const feature = withAutoRefreshToken({
        sessionTimeout: 30000,
        onInactivityTimeout: 'logout'
      });
      feature.configure();

      expect(mockAutoRefreshTokenService.start).toHaveBeenCalledWith({
        sessionTimeout: 30000,
        onInactivityTimeout: 'logout'
      });
    });
  });
});
