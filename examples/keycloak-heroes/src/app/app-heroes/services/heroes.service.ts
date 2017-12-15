import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Hero } from '../resources/index';
import { pathValues } from './heroes-path-values';

@Injectable()
export class HeroesService {
  constructor(private http: HttpClient) {}

  list(): Observable<Hero[]> {
    return this.http.get<Hero[]>(pathValues.heroesApi);
  }
}
