import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:8181/api/books';

  constructor(private http: HttpClient) {}

  listBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl);
  }
}
