import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpResult } from '../models/http-result';

@Injectable({
  providedIn: 'root'
})
export class DriverService {

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  public getAll() {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/driver`);
  }

  public create(data: any) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/driver`, data);
  }

  public update(id: number, data: any) {
    return this.http.put<HttpResult>(`${this.apiUrl}/user/driver/${id}`, data);
  }

  public delete(id: number) {
    return this.http.delete<HttpResult>(`${this.apiUrl}/user/driver/${id}`);
  }

}
