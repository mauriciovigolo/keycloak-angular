import { Component, OnInit } from '@angular/core';

import { pathValues } from '../../utils';
import { HeroesService, Hero } from '../../services';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css']
})
export class HeroesComponent implements OnInit {
  private heroes: Hero[];

  constructor(private heroesService: HeroesService) {}

  ngOnInit() {
    this.heroes = [];
    this.listHeroes();
  }

  listHeroes(): void {
    this.heroesService.list().subscribe((heroes: Hero[]) => (this.heroes = heroes), err => {});
  }
}
