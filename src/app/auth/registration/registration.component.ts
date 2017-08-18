import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { CoreService } from '../../core/core.service';
import { AuthService } from '../auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  processingForm = false;
  form: FormGroup;

  constructor(private authService: AuthService,
              private coreService: CoreService,
              private router: Router) {
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, this.validEmail()]),
      passwords: new FormGroup(
        {
          password: new FormControl(null, Validators.required),
          passwordRepeat: new FormControl(null)
        },
        this.passwordEquals()
      ),
    })
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
      this.form.get('passwords.password').markAsTouched();
      this.form.get('passwords.passwordRepeat').markAsTouched();
      return;
    }
    this.processingForm = true;
    this.authService.registration({
      email: this.form.value.email,
      password: this.form.value.passwords.password
    })
      .subscribe((response: any) => {
        this.processingForm = false;
        this.authService.storeToken(response.token);
        this.router.navigate(['/films']);
        this.coreService.createNotification({
          type: 'success',
          text: 'Die Registrierung war erfolgreich!<br>Nun kannst du deine eigene Film-Kollektion erstellen.',
          closeAfter: 6000
        });
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

  passwordEquals(): ValidatorFn {
    return (group: FormGroup) => {
      return group.get('password').value !== group.get('passwordRepeat').value ? {'mismatch': true} : null;
    };
  }
}
