import { Injectable } from '@angular/core';
import {catchError, mapTo, Observable, of, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {config} from '../../config';
import {Tokens} from '../models/token';
import {Login, LogResponse} from '../models/login';
import {User} from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly JWT_TOKEN = 'JWT_TOKEN';
  private readonly REFRESH_TOKEN = 'REFRESH_TOKEN';
  loggedUser: User | undefined;

  constructor(private http: HttpClient) {}

  login(loginData:Login) {
    return this.http.post(`${config.apiUrl}/login`, loginData);
  }

  logout() {
    return this.http.post(`${config.apiUrl}/logout`, {
      'refreshToken': this.getRefreshToken()
    }).pipe(
      tap(() => this.doLogoutUser()),
      mapTo(true),
      catchError(error => {
        alert(error.error);
        return of(false);
      }));
  }

  isLoggedIn() {
    return !!this.getJwtToken();
  }

  refreshToken() {
    return this.http.post<any>(`${config.apiUrl}/refresh`, {
      'refreshToken': this.getRefreshToken()
    }).pipe(tap((tokens: Tokens) => {
      this.storeJwtToken(tokens.jwt);
    }));
  }

  getJwtToken() {
    return localStorage.getItem(this.JWT_TOKEN);
  }

  public doLoginUser(logResponse : LogResponse) {
    this.loggedUser = logResponse.user;
    const tokens: Tokens={
      jwt:logResponse.token,
      refreshToken:logResponse.refreshToken
    }
    this.storeTokens(tokens);
  }

  public doLogoutUser() {
    this.loggedUser = undefined;
    this.removeTokens();
  }

  private getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  private storeJwtToken(jwt: string) {
    localStorage.setItem(this.JWT_TOKEN, jwt);
  }

  private storeTokens(tokens: Tokens) {
    localStorage.setItem(this.JWT_TOKEN, tokens.jwt);
    localStorage.setItem(this.REFRESH_TOKEN, tokens.refreshToken);
  }

  private removeTokens() {
    localStorage.removeItem(this.JWT_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
  }
}
