import { Component } from '@angular/core';
import { animate, animateChild, group, query, style, transition, trigger } from '@angular/animations';
import { AuthService } from './auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('routerEnterAnimation', [
      transition('* => *', [
        query(':enter', style({
          position: 'absolute', left: 0, right: 0, transform: 'translateY(30px)', opacity: 0
        }), {optional: true}),
        query(':enter', group([
          animate('250ms 250ms ease-out', style({transform: 'translateY(0)', opacity: 1})),
          animateChild()
        ]), {optional: true})
      ])
    ]),
    trigger('routerLeaveAnimation', [
      transition('* => *', [
        query(':leave', style({
          transform: 'translateY(0px)', opacity: 1
        }), {optional: true}),
        query(':leave', group([
          animate('250ms ease-in', style({transform: 'translateY(-30px)', opacity: 0})),
          animateChild()
        ]), {optional: true})
      ])
    ])
  ]
})
export class AppComponent {

  isRouterAnimating = false;

  constructor(public authService: AuthService,
              private router: Router) {
    // add simple support for background images:
    document.addEventListener('lazybeforeunveil', (e: any) => {
      const bg = e.target.getAttribute('data-bg');
      if (bg) {
        e.detail.firesLoad = true;
        let img = document.createElement('img');
        img.onload = function () {
          img.onload = null;
          img.onerror = null;
          img = null;

          e.target.style.backgroundImage = 'url(' + bg + ')';
          e.detail.firesLoad = false;
          e.detail.instance.fire(e.target, '_lazyloaded', {}, true, true);
        };
        img.onerror = img.onload;
        img.src = bg;
      }
    });
  }

  routerLeaveAnimationStart() {
    this.isRouterAnimating = true;
  }

  routerLeaveAnimationDone() {
    document.body.scrollTop = 0;
  }

  routerEnterAnimationDone() {
    this.isRouterAnimating = false;
  }

  logout() {
    if (this.router.url.indexOf('/films') === 0) {
      this.router.navigateByUrl('/login');
    }
    this.authService.removeToken();
  }

}
