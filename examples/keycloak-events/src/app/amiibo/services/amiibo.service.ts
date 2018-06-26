import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { AmiiboModel } from '../models/amiibo.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AmiiboService {
  constructor(private http: HttpClient) {}

  list(
    name?: string,
    type?: string,
    character?: string,
    amiiboSeries?: string
  ): Observable<AmiiboModel[]> {
    let amiiboUrl = environment.apis.amiiboApi;

    let params = new HttpParams();
    if (name) {
      params.set('name', name);
    }
    if (type) {
      params.set('type', type);
    }
    if (character) {
      params.set('character', character);
    }
    if (amiiboSeries) {
      params.set('amiiboSeries', amiiboSeries);
    }

    return this.http.get<AmiiboModel[]>(amiiboUrl, { params });
  }
}
