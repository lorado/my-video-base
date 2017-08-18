import { Component, OnInit } from '@angular/core';
import { FilmService } from '../film.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Film } from '../film.model';
import { DatePipe } from '@angular/common';
import { CoreService } from '../../core/core.service';
import { Notification } from '../../core/notification/notification.model';

declare const Choices: any;

@Component({
  selector: 'app-film-edit',
  templateUrl: './film-edit.component.html',
  styleUrls: [
    './film-edit.component.css'
  ],
  providers: [DatePipe]
})
export class FilmEditComponent implements OnInit {

  savingForm = false;
  dragCounter = 0;
  isDragging = false;

  film: Film;
  form: FormGroup;
  id: string;
  editMode: boolean;
  posterPreviewSrc: string;
  posterErrorNotification: Notification;
  posterIsUploaded = false;
  choices;
  genreChoicesAreLoaded = false;
  formIsLoaded = false;

  constructor(private filmService: FilmService,
              private route: ActivatedRoute,
              private router: Router,
              private coreService: CoreService,
              private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, Validators.required),
      originalTitle: new FormControl(null),
      posterPath: new FormControl(null),
      backdropPath: new FormControl(null),
      overview: new FormControl(null),
      releaseDate: new FormControl(null),
      genres: new FormControl(null),

      placeToFind: new FormControl(null)
    });

    // init choices object
    this.choices = new Choices('#genres', {
      duplicateItems: true,
      searchFields: ['label'],
      searchResultLimit: 6,
      noResultsText: 'Keine Genre gefunden',
      noChoicesText: 'Es gibt keine Genres mehr',
      itemSelectText: 'Drücken zur Auswahl'
    });

    this.filmService.getAllGenres()
      .then((genres: Map<number, string>) => {
        const genresChoice = [];
        genres.forEach((genreName: string, genreId: number) => {
          genresChoice.push({
            value: genreName,
            label: genreName
          });
        });

        // set choices
        this.choices.setChoices(genresChoice, 'value', 'label', true);

        this.genreChoicesAreLoaded = true;

        // select items, if film exist (means film object was loaded earlier)
        if (this.film) {
          this.choices.setValueByChoice(this.film.genres);
        }
      });

    this.route.params.subscribe(
      (params: Params) => {
        this.id = params['id'];
        this.editMode = params['id'] != null;

        if (this.editMode) {
          // this is an :id/edit route. Load film with :id
          this.filmService.getFilmById(this.id)
            .subscribe(
              (response: any) => {
                this.film = response;
              }
            );
        } else if (this.filmService.tempFilm != null) {
          // we came from search, so load film-data from search
          this.film = this.filmService.tempFilm;
          this.filmService.tempFilm = null;
        }
        if (!this.film && !this.editMode) {
          // otherwise create new instance
          this.film = new Film('', '', '', '', '', null, [], '');
        }

        // wait till film is loaded
        new Promise((resolve, reject) => {
          if (this.film) {
            resolve();
          }
          const interval = setInterval(() => {
            if (this.film) {
              clearInterval(interval);
              resolve();
            }
          }, 500);
        }).then(() => {
          this.posterPreviewSrc = this.film.posterPath;

          this.form.setValue({
            title: this.film.title,
            originalTitle: this.film.originalTitle,
            posterPath: this.film.posterPath,
            backdropPath: this.film.backdropPath,
            overview: this.film.overview,
            releaseDate: this.datePipe.transform(this.film.releaseDate, 'dd.MM.y'),
            genres: this.film.genres,
            placeToFind: this.film.placeToFind
          });

          // select genre items, if choices was initiated earlier
          if (this.genreChoicesAreLoaded && this.choices.getValue().length !== this.film.genres.length) {
            this.choices.setValueByChoice(this.film.genres);
          }
          this.formIsLoaded = true;
        });
      }
    );
  }

  posterPathChanged() {
    this.coreService.closeNotification(this.posterErrorNotification);
    const img = new Image();
    img.onload = () => {
      if (img.width / img.height !== 2 / 3 || img.width > 400 || img.height > 600) {
        this.posterErrorNotification = this.coreService.createNotification({
          text: 'Das eingegebene Bild wurde abgelehnt!<br>' +
          'Das Bild soll die Seiten-Proportion 2 zu 3 haben!<br>' +
          'Das Bild darf nicht größer als 400x600 sein!',
          type: 'danger',
          closeAfter: null
        });
        this.form.patchValue({
          posterPath: ''
        });
        this.posterPreviewSrc = '';
      } else {
        this.posterPreviewSrc = img.src;
      }
    };
    img.onerror = () => {
      this.posterErrorNotification = this.coreService.createNotification({
        text: 'Das Bild konnte nicht geladen werden!',
        type: 'danger',
        closeAfter: null
      });
      this.form.patchValue({
        posterPath: ''
      });
      this.posterPreviewSrc = '';
    };
    img.src = this.form.value.posterPath;
  }

  onSubmit() {
    this.coreService.closeAllNotifications();
    if (!this.form.valid) {
      this.coreService.createNotification({
        text: 'Mindestens der Titel muss eingegeben werden!',
        type: 'danger',
        closeAfter: 6000
      });
      this.form.get('title').markAsTouched();
      return;
    }
    this.savingForm = true;
    let day,
      month,
      year,
      releaseDate;
    if (this.form.value.releaseDate) {
      [day, month, year] = this.form.value.releaseDate.split('.');
    }
    if (day && month && year) {
      releaseDate = `${year}-${month}-${day}`;
    } else {
      releaseDate = null;
    }
    // store new values to object
    this.film.title = this.form.value.title;
    this.film.originalTitle = this.form.value.originalTitle;
    this.film.posterPath = this.posterPreviewSrc;
    this.film.backdropPath = this.form.value.backdropPath;
    this.film.overview = this.form.value.overview;
    this.film.releaseDate = releaseDate;
    this.film.genres = this.form.value.genres;
    this.film.placeToFind = this.form.value.placeToFind;

    // save film
    this.filmService.saveFilm(this.film)
      .subscribe(() => {
        this.savingForm = false;
        this.coreService.createNotification({
          text: 'Der Film wurde erfolgreich gespeichert!',
          type: 'success',
          closeAfter: 4000
        });
        if (this.editMode) {
          this.router.navigate(['/films', this.film._id]);
        } else {
          this.router.navigate(['/films']);
        }
      }, () => {
        this.savingForm = false;
        this.coreService.createNotification({
          text: 'Der Film konnte nicht gespeichert werden!',
          type: 'danger'
        });
      });
  }

  onCancel() {
    if (this.editMode) {
      this.router.navigate(['/films', this.film._id]);
    } else {
      this.router.navigate(['/films/new/search']);
    }
  }

  // Drag'n'Drop events
  onDragover(e: DragEvent) {
    e.preventDefault();
  }

  onDragenter(e: DragEvent) {
    this.dragCounter++;
    if (e.dataTransfer.types.indexOf('Files') !== -1 && this.dragCounter > 0) {
      this.isDragging = true;
    }
  }

  onDragleave(e: DragEvent) {
    this.dragCounter--;
    if (this.dragCounter === 0) {
      this.isDragging = false;
    }
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragCounter = 0;
    this.isDragging = false;
    if (e.dataTransfer.files[0].type.indexOf('image/') === 0) {
      // operate with image
      this.uploadProcessImage(e.dataTransfer.files[0]);
    }
  }

  fileInputChanged(fileInput) {
    if (fileInput.files && fileInput.files[0] && fileInput.files[0].type.indexOf('image/') === 0) {
      this.uploadProcessImage(fileInput.files[0]);
    }
  }

  private uploadProcessImage(file) {
    const reader = new FileReader();
    const img = new Image();
    const canvas = document.createElement('canvas');
    const dstWidth = 400;
    const dstHeight = 600;
    canvas.width = dstWidth;
    canvas.height = dstHeight;

    img.onload = () => {
      let width = img.width;
      let height = img.height;
      let dstX = 0;
      let dstY = 0;
      if (width / height > 2 / 3) {
        width *= dstHeight / height;
        height = dstHeight;
        dstX = -(width - dstWidth) / 2;
      } else {
        height *= dstWidth / width;
        width = dstWidth;
        dstY = -(height - dstHeight) / 2;
      }
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, dstX, dstY, width, height);

      // update poster image
      this.form.patchValue({
        posterPath: 'Das hochgeladene Bild wird verwendet...'
      });
      this.form.get('posterPath').disable();
      this.posterPreviewSrc = canvas.toDataURL('image/jpeg', 0.75);
      this.posterIsUploaded = true;
    };

    reader.onload = (readerEvent: any) => {
      img.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeUploadedImage() {
    this.posterPreviewSrc = '';
    this.form.patchValue({
      posterPath: ''
    });
    this.form.get('posterPath').enable();
    this.posterIsUploaded = false;
  }

}
