import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroDetailsComponent } from './hero-details.component';

describe('HeroDetailsComponent', () => {
  let component: HeroDetailsComponent;
  let fixture: ComponentFixture<HeroDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeroDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
