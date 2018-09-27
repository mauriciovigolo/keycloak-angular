import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AmiiboSearchComponent } from './amiibo-search.component';

describe('AmiiboSearchComponent', () => {
  let component: AmiiboSearchComponent;
  let fixture: ComponentFixture<AmiiboSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AmiiboSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AmiiboSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
