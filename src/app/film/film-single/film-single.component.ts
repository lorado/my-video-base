import { Component, OnInit } from '@angular/core';
import { Film } from '../film.model';
import { FilmService } from '../film.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '../../core/core.service';

@Component({
  selector: 'app-film-single',
  templateUrl: './film-single.component.html',
  styleUrls: ['./film-single.component.scss']
})
export class FilmSingleComponent implements OnInit {

  film: Film;

  constructor(private filmService: FilmService,
              private coreService: CoreService,
              private route: ActivatedRoute,
              private router: Router) {
    this.film = new Film('Laden...', '', '', '', '', '', [], '');
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.filmService.getFilmById(params['id'])
        .subscribe(
          (response: any) => {
            this.film = response;
          },
          () => {
            this.coreService.createNotification({
              text: 'Der Film konnte nicht gefunden werden!',
              type: 'danger',
              closeAfter: 6000
            });
            this.router.navigate(['/films']);
          }
        );
    });
  }

  deleteFilm() {
    if (confirm('Soll dieser Film gelöscht werden?')) {
      this.filmService.removeFilm(this.film._id)
        .subscribe(() => {
          this.coreService.createNotification({
            text: 'Der Film wurde erfolgreich gelöscht',
            type: 'success',
            closeAfter: 6000
          });
          this.router.navigate(['/films']);
        }, () => {
          this.coreService.createNotification({
            text: 'Der Film konnte nicht gelöscht werden!',
            type: 'danger',
            closeAfter: 6000
          });
        });
    }
  }
}
