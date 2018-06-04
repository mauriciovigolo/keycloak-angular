import { fakeAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule, MatIconModule, MatCardModule } from '@angular/material';

import { AppComponent } from './app.component';
import { KeycloakService } from 'keycloak-angular';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(
    fakeAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AppComponent],
        imports: [MatButtonModule, MatIconModule, MatCardModule],
        providers: [KeycloakService]
      }).compileComponents();

      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
