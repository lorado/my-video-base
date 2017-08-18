export class Film {
  _id: string = null;
  constructor(public title: string,
              public originalTitle: string,
              public posterPath: string,
              public backdropPath: string,
              public overview: string,
              public releaseDate: string,
              public genres: string[],
              public placeToFind: string) {
  }
}
