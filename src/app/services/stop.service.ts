import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpResult } from '../models/http-result';

@Injectable({
  providedIn: 'root'
})
export class StopService {

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  public create(data: any) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/stop`, data);
  }

  public update(id: number, data: any) {
    return this.http.put<HttpResult>(`${this.apiUrl}/user/stop/${id}`, data);
  }
  
  public columnNames(data: FormData) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/stop/import/columnNames`, data);
  }

  public import(data: FormData) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/stop/import`, data);
  }
}
