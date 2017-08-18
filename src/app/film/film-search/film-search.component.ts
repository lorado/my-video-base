import {
  AfterViewInit, Component, ElementRef, HostBinding, OnDestroy, OnInit,
  ViewChild
} from '@angular/core';
import { FilmService } from '../film.service';
import { Subscription } from 'rxjs/Subscription';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { Film } from '../film.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-film-search',
  templateUrl: './film-search.component.html',
  styleUrls: ['./film-search.component.css'],
  animations: [
    trigger('filmElements', [
      transition('* => *', [
        query(':enter', [
          style({transform: 'scale(0.9)', opacity: 0}),
          stagger(80, [
            animate('150ms ease', style({transform: 'scale(1)', opacity: 1}))
          ])
        ], {optional: true}),
        query(':leave', [
          animate('150ms ease', style({transform: 'scale(1.1)', opacity: 0}))
        ], {optional: true})
      ])
    ])
  ]
})
export class FilmSearchComponent implements AfterViewInit, OnDestroy {

  private searchRequest: Subscription;
  private searchTimeout;
  private lastSearchQuery: string;
  private scrollListener;
  @ViewChild('searchInputElement') searchInputElement: ElementRef;
  @ViewChild('searchResults') searchResultsElement: ElementRef;

  films = [];

  isSearching = false;
  searchAnimationState = 'paused';
  isLoadingNextPage = false;

  private currentPage = 1;
  private maxPage = 1;

  totalResults = -1;

  constructor(private filmService: FilmService,
              private router: Router) {
    // lazyload next pages
    this.scrollListener = () => {
      if (!this.isLoadingNextPage && this.totalResults > 0 && this.currentPage < this.maxPage) {
        const bounding = this.searchResultsElement.nativeElement.getBoundingClientRect();
        if (bounding.bottom - window.innerHeight * 1.1 < 0) {
          this.loadNextPage();
        }
      }
    };
    document.addEventListener('scroll', this.scrollListener);
  }

  ngAfterViewInit() {
    this.searchInputElement.nativeElement.focus();
  }

  ngOnDestroy() {
    document.removeEventListener('scroll', this.scrollListener);
  }

  searchForFilm(query: string) {
    if (this.lastSearchQuery === query) {
      return;
    }
    this.lastSearchQuery = query;
    this.films = [];
    clearTimeout(this.searchTimeout);
    if (query.length < 2) {
      this.totalResults = -1;
      this.isSearching = false;
      return;
    }
    this.isSearching = true;
    this.searchAnimationState = 'running';

    this.searchTimeout = setTimeout(() => {
        if (this.searchRequest && !this.searchRequest.closed) {
          this.searchRequest.unsubscribe();
        }

        this.searchRequest = this.filmService.searchForFilmAtTMDB(query)
          .subscribe(
            response => {
              this.films = response.results;
              this.currentPage = response.page;
              this.maxPage = response.total_pages;
              this.totalResults = response.total_results;
              this.isSearching = false;
              setTimeout(() => {
                this.searchAnimationState = 'paused';
              }, 250);
            }
          );
      },
      400
    );
  }

  saveFilm(film) {
    this.filmService.tempFilm = new Film(
      film.title,
      film.original_title,
      film.poster_path ? 'https://image.tmdb.org/t/p/w400_and_h600_bestv2' + film.poster_path : '',
      film.backdrop_path ? 'https://image.tmdb.org/t/p/w1280' + film.backdrop_path : '',
      film.overview,
      film.release_date,
      film.genres,
      ''
    );
    this.router.navigate(['/films/new/form']);
  }

  private loadNextPage() {
    this.isLoadingNextPage = true;

    this.searchRequest = this.filmService.searchForFilmAtTMDB(this.lastSearchQuery, ++this.currentPage)
      .subscribe(
        response => {
          this.films = this.films.concat(response.results);
          this.isLoadingNextPage = false;
        }
      );
  }

}
