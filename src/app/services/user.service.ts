import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ConfigHelper } from '../helpers/config.helper';
import { HttpResult } from '../models/http-result';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = environment.apiUrl;

  private currentUserSubject: BehaviorSubject<any>;

  public currentUser: Observable<any>;

  constructor(
    private http: HttpClient
  ) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem(ConfigHelper.Storage.CurrentUser)));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public getCurrentUser() {
    return this.currentUserSubject.value;
  }

  public authenticate(data: any) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/login`, data)
      .pipe(map(res => {
        if (res.success) {
          localStorage.setItem(ConfigHelper.Storage.AccessToken, res.token);
          localStorage.setItem(ConfigHelper.Storage.CurrentUser, JSON.stringify(res.data));
          this.currentUserSubject.next(res.data);
        }
        return res;
      }));
  }

  public create(data: any) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/register`, data)
      .pipe(map(res => {
        if (res.success) {
          localStorage.setItem(ConfigHelper.Storage.AccessToken, res.token);
          localStorage.setItem(ConfigHelper.Storage.CurrentUser, JSON.stringify(res.data));
          this.currentUserSubject.next(res.data);
        }
        return res;
      }));
  }

  public logout() {
    const token = localStorage.getItem(ConfigHelper.Storage.AccessToken);
    return this.http.post<HttpResult>(`${this.apiUrl}/user/logout`, { token })
      .pipe(map(res => {
        if (res.success) {
          localStorage.clear();
        }
        return res;
      }));
  }

}
