import { Component, OnInit, AfterViewInit } from '@angular/core';

import { map } from 'rxjs/operators';

import { pathValues } from '../../utils';
import { HeroesService, Hero } from '../../services';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css']
})
export class HeroesComponent {
  heroes$: Observable<Hero[]>;

  constructor(private heroesService: HeroesService) {
    this.listHeroes();
  }

  listHeroes(): void {
    this.heroes$ = this.heroesService.list();
  }
}
