import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  displayMenu = false;

  constructor() {
  }

  ngOnInit() {
  }

  hideMenuOnMobile() {
    if (window.innerWidth < 550) {
      this.displayMenu = false;
    }
  }
}
