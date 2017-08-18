import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { CoreService } from '../../core/core.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  processingForm = false;
  form: FormGroup;

  constructor(private authService: AuthService,
              private coreService: CoreService,
              private router: Router) {
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, this.validEmail()]),
      password: new FormControl(null, Validators.required)
    })
  }

  ngOnInit() {
  }

  onSubmit() {
    this.coreService.closeAllNotifications();
    if (!this.form.valid) {
      this.coreService.createNotification({
        text: 'Alle Felder müssen korrekt ausgefüllt sein!',
        type: 'danger',
        closeAfter: 6000
      });
      this.form.get('email').markAsTouched();
      this.form.get('password').markAsTouched();
      return;
    }
    this.processingForm = true;
    this.authService.login(this.form.value)
      .subscribe((response: any) => {
        this.processingForm = false;
        this.authService.storeToken(response.token);
        this.router.navigate(['/films']);
      }, (response) => {
        this.coreService.createNotification({
          type: 'danger',
          text: response.error.errorMessage,
          closeAfter: null
        });
        this.processingForm = false;
      })
  }

  // Validators
  validEmail(): ValidatorFn {
    const EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return (control: AbstractControl) => {
      return EMAIL_REGEXP.test(control.value) ? null : {'email': true};
    };
  }
}
