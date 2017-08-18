import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FilmEditComponent } from './film/film-edit/film-edit.component';
import { AppRoutingModule } from './app-routing.module';
import { FilmListComponent } from './film/film-list/film-list.component';
import { HeaderComponent } from './header/header.component';
import { FilmService } from './film/film.service';
import { ExcerptPipe } from './core/pipes/excerpt.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FilmSearchComponent } from './film/film-search/film-search.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CoreService } from './core/core.service';
import { NotificationComponent } from './core/notification/notification.component';
import { RegistrationComponent } from './auth/registration/registration.component';
import { LoginComponent } from './auth/login/login.component';
import { IsLoggedInGuard } from './core/guards/is-logged-in.guard';
import { AuthService } from './auth/auth.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './auth/auth.interceptor';
import { FilmSingleComponent } from './film/film-single/film-single.component';
import { AboutComponent } from './about/about.component';

@NgModule({
  declarations: [
    AppComponent,
    FilmEditComponent,
    FilmListComponent,
    HeaderComponent,
    ExcerptPipe,
    FilmSearchComponent,
    NotificationComponent,
    RegistrationComponent,
    LoginComponent,
    FilmSingleComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    FilmService,
    CoreService,
    IsLoggedInGuard,
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
