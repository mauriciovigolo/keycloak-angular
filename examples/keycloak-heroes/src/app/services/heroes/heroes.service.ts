import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Hero } from './hero';
import { pathValues } from '../../utils';

@Injectable()
export class HeroesService {
  constructor(private http: HttpClient) {}

  list(): Observable<Hero[]> {
    return this.http.get<Hero[]>(pathValues.heroesApi);
  }
}
