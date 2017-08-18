import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'excerpt'
})
export class ExcerptPipe implements PipeTransform {

  transform(text: string, length: number = 140): string {
    if (text && text.length > length) {
      let excerpt = text.substr(0, length);
      const lastSpacePosition = excerpt.lastIndexOf(' ');
      excerpt = excerpt.substr(0, lastSpacePosition);
      if (excerpt[lastSpacePosition - 1] === '.') {
        excerpt += '..';
      } else {
        excerpt += ' ...';
      }
      return excerpt;
    }
    return text;
  }

}
