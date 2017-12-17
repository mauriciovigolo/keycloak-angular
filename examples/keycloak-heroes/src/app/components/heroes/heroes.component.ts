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
    this.heroesService.list().subscribe((heroes: Hero[]) => {
      heroes.map(hero => {
        let heroName = hero.localized_name.toLocaleLowerCase();
        if (heroName.search(/(\s)|(\-)/ig) > 0) {
          heroName = heroName.replace(' ', '_').replace('-', '');
        }
        hero.image_url = `url(${pathValues.heroesImages}/${heroName}_full.png)`;
      });
      this.heroes = heroes;
    }, err => {});
  }
}
