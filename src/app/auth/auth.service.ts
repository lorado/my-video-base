import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AuthService {

  constructor(private http: HttpClient) {
  }

  isLoggedIn() {
    return localStorage.getItem('token') !== null;
  }

  storeToken(token: string) {
    localStorage.setItem('token', token);
  }

  removeToken() {
    localStorage.removeItem('token');
  }

  login(requestData: {email: string, password: string}) {
    return this.http.post('/api/account/login', requestData);
  }

  registration(requestData: {email: string, password: string}) {
    return this.http.post('/api/account/registration', requestData);
  }
}
