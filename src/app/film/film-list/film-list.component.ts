import { AfterViewInit, Component, ElementRef, HostBinding, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Film } from '../film.model';
import { FilmService } from '../film.service';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { CoreService } from '../../core/core.service';

@Component({
  selector: 'app-film-list',
  templateUrl: './film-list.component.html',
  styleUrls: ['./film-list.component.scss'],
  animations: [
    trigger('revealTotalCount', [
      transition(':enter', [
        style({transform: 'translateX(-100%)', opacity: 0}),
        animate('300ms ease-out', style({transform: 'translateX(0)', opacity: 1}))
      ])
    ]),
    trigger('filmElements', [
      transition('* => *', [
        query(':enter', [
          style({transform: 'scale(0.9)', opacity: 0}),
          stagger(80, [
            animate('150ms ease', style({transform: 'scale(1)', opacity: 1}))
          ])
        ], {optional: true}),
        query(':leave', [
          animate('250ms ease', style({transform: 'scale(1.1)', opacity: 0}))
        ], {optional: true})
      ])
    ])
  ]
})
export class FilmListComponent implements AfterViewInit, OnDestroy {

  totalFilmCount = -1;
  films: Film[] = [];

  private searchTimeout;
  private lastSearchQuery = '';
  private scrollListener;
  @ViewChild('searchInputElement') searchInputElement: ElementRef;
  @ViewChild('searchResults') searchResultsElement: ElementRef;

  isSearching = true;
  searchAnimationState = 'running';
  isLoadingNextPage = false;

  private currentPage = 1;
  private maxPage = 1;

  totalFound = -1;

  constructor(private filmService: FilmService,
              private coreService: CoreService) {
    // lazyload next pages
    this.scrollListener = () => {
      if (!this.isLoadingNextPage && this.totalFound > 0 && this.currentPage < this.maxPage) {
        const bounding = this.searchResultsElement.nativeElement.getBoundingClientRect();
        if (bounding.bottom - window.innerHeight * 1.1 < 0) {
          this.loadNextPage();
        }
      }
    };
    document.addEventListener('scroll', this.scrollListener);

    // get data
    this.filmService.getTotalFilmCount()
      .subscribe((response: any) => {
        this.totalFilmCount = +response;
      });
    this.getFilms();
  }

  filterFilms(query: string) {
    if (this.lastSearchQuery === query) {
      return;
    }

    this.lastSearchQuery = query;
    clearTimeout(this.searchTimeout);

    if (query.length < 2) {
      if (this.totalFound === -1 && !this.isSearching) {
        return;
      }
      query = '';
    }

    this.isSearching = true;
    this.searchAnimationState = 'running';

    this.films = [];
    this.searchTimeout = setTimeout(() => {
        this.getFilms(query);
      },
      400
    );
  }

  getFilms(query?: string, page?: number) {
    this.filmService.getFilms(query, page)
      .subscribe((data: {films: Film[], maxPage: number, totalFound: number}) => {
        this.films = data.films;
        this.currentPage = 1;
        this.maxPage = data.maxPage;
        this.totalFound = data.totalFound;

        this.isSearching = false;
        setTimeout(() => {
          this.searchAnimationState = 'paused';
        }, 250);
      }, (error) => {
        this.isSearching = false;
        setTimeout(() => {
          this.searchAnimationState = 'paused';
        }, 250);
        this.coreService.createNotification({
          type: 'danger',
          text: error.error.errorMessage,
          closeAfter: null
        });
      });
  }


  ngAfterViewInit() {
    this.searchInputElement.nativeElement.focus();
  }

  ngOnDestroy() {
    document.removeEventListener('scroll', this.scrollListener);
  }

  private loadNextPage() {
    console.log('loading next')
    this.isLoadingNextPage = true;

    this.filmService.getFilms(this.lastSearchQuery, ++this.currentPage)
      .subscribe((response: {films: Film[], maxPage: number, totalFound: number}) => {
        this.films = this.films.concat(response.films);
        this.isLoadingNextPage = false;
      }, (error) => {
        this.isLoadingNextPage = false;
        this.coreService.createNotification({
          type: 'danger',
          text: error.error.errorMessage,
          closeAfter: null
        });
      });
  }
}
