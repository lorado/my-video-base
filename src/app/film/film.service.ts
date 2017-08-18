import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Film } from './film.model';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class FilmService {
  private TMDBapi = 'https://api.themoviedb.org/3';
  private TMDBapiKey = '410ce03c5ad56c15340f23ae09ab9370';

  private genres: Map<number, string>;
  tempFilm: Film = null;

  constructor(private http: HttpClient) {
    // try to load genres from localStorage
    const cacheGenres = localStorage.getItem('genres');
    const cacheGenresTime = localStorage.getItem('genresRefreshTime');
    this.genres = <Map<number, string>> new Map(JSON.parse(cacheGenres));
    if (+cacheGenresTime + 1000 * 60 * 60 * 24 * 7 < new Date().getTime()) {
      this.loadGenresFromTMDB();
    }
  }

  getTotalFilmCount() {
    return this.http.get('/api/film/count');
  }

  getFilms(filterByTitle?: string, currentPage?: number) {
    let params = new HttpParams();
    if (filterByTitle) {
      params = params.append('filterByTitle', filterByTitle);
    }
    if (currentPage) {
      params = params.append('currentPage', currentPage.toString());
    }
    return this.http.get('/api/film/fetch', {params});
  }

  getFilmById(id: string) {
    return this.http.get('/api/film/getById/' + id);
  }

  saveFilm(film: Film) {
    return this.http.post('/api/film/save', film);
  }

  removeFilm(_id: string) {
    return this.http.post('/api/film/remove', {_id});
  }

  searchForFilmAtTMDB(query: string, page: number = 1) {
    return this.http.get(this.TMDBapi + '/search/movie?api_key=' + this.TMDBapiKey +
      '&language=de&query=' + encodeURIComponent(query) + '&page=' + page)
      .map((response: any) => {
        // loop through films
        for (const film of response.results) {
          // add genre_titles attribute
          const genres = [];
          for (const genreId of film.genre_ids) {
            const genreName = this.getGenreName(genreId);
            if (genreName !== null) {
              genres.push(genreName);
            }
          }
          film.genres = genres;
        }
        return response;
      });
  }

  getAllGenres(): Promise<Map<number, string>> {
    return new Promise((resolve, reject) => {
      if (this.genres) {
        resolve(this.genres);
      } else {
        const interval = setInterval(() => {
          if (this.genres) {
            clearInterval(interval);
            resolve(this.genres);
          }
        }, 300);
      }
    });
  }

  getGenreName(id: number): string {
    if (this.genres.has(id)) {
      return this.genres.get(id);
    }
    return null;
  }

  private loadGenresFromTMDB() {
    this.http.get(this.TMDBapi + '/genre/movie/list', {
      params: new HttpParams()
        .append('api_key', this.TMDBapiKey)
        .append('language', 'de')
    })
      .subscribe(
        (response: {genres: [{id: number, name: string}]}) => {
          this.genres = new Map();
          for (const genre of response.genres) {
            this.genres.set(genre.id, genre.name);
          }
          // save in localStorage
          localStorage.setItem('genres', JSON.stringify(Array.from(this.genres.entries())));
          localStorage.setItem('genresRefreshTime', new Date().getTime().toString());
        }
      );
  }
}
