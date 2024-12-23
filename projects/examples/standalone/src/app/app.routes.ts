import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { BooksComponent } from './components/books/books.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { canActivateAuthRole } from './guards/auth-role.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'books',
    component: BooksComponent,
    canActivate: [canActivateAuthRole],
    data: { role: 'view-books' }
  },
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [canActivateAuthRole],
    data: { role: 'view-profile' }
  },
  { path: 'forbidden', component: ForbiddenComponent },
  { path: '**', component: NotFoundComponent }
];
