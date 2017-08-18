import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FilmEditComponent } from './film/film-edit/film-edit.component';
import { FilmListComponent } from './film/film-list/film-list.component';
import { FilmSearchComponent } from './film/film-search/film-search.component';
import { RegistrationComponent } from './auth/registration/registration.component';
import { LoginComponent } from './auth/login/login.component';
import { IsLoggedInGuard } from './core/guards/is-logged-in.guard';
import { FilmSingleComponent } from './film/film-single/film-single.component';
import { AboutComponent } from './about/about.component';

export const routes: Routes = [
  {
    path: '',
    component: AboutComponent,
    data: {
      animation: 'home'
    }
  },
  {
    path: 'registration',
    component: RegistrationComponent,
    data: {
      animation: '/registration'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      animation: '/login'
    }
  },
  {
    path: 'films',
    canActivateChild: [IsLoggedInGuard],
    children: [
      {
        path: '',
        component: FilmListComponent,
        data: {
          animation: '/films'
        }
      },
      {
        path: 'new',
        children: [
          {
            path: '',
            redirectTo: 'search',
            pathMatch: 'full'
          },
          {
            path: 'form',
            component: FilmEditComponent,
            data: {
              animation: '/films/new/form'
            }
          },
          {
            path: 'search',
            component: FilmSearchComponent,
            data: {
              animation: '/films/new/search'
            }
          },
        ]
      },
      {
        path: ':id',
        component: FilmSingleComponent,
        data: {
          animation: '/films/:id'
        }
      },
      {
        path: ':id/edit',
        component: FilmEditComponent,
        data: {
          animation: '/films/:id/edit'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
