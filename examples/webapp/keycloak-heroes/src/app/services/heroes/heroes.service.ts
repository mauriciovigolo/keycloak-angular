import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Hero } from './hero';
import { pathValues } from '../../utils';

type PagedHero = {
  list: Hero[];
  total: number;
};

@Injectable()
export class HeroesService {
  constructor(private http: HttpClient) {}

  list(): Observable<Hero[]> {
    return this.http
      .get<PagedHero>(pathValues.heroesApi)
      .pipe(map(({ list }) => this.heroImageUrl(list)));
  }

  private heroImageUrl(heroes: Hero[]): Hero[] {
    heroes.map(hero => {
      const heroName = hero.name.substring(14, hero.name.length);
      hero.image_url = `url(${pathValues.heroesImages}/${heroName}_full.png)`;
    });
    return heroes;
  }
}
