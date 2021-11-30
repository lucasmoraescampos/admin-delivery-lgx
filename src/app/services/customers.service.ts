import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpResult } from '../models/http-result';

@Injectable({
  providedIn: 'root'
})
export class CustomersService
{
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  )
  {
  }

  public getAll()
  {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/customers`);
  }

  public create(data: any)
  {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/customers`, data);
  }

  public update(id: number, data: any)
  {
    return this.http.put<HttpResult>(`${this.apiUrl}/user/customers/${id}`, data);
  }

  public delete(id: number)
  {
    return this.http.delete<HttpResult>(`${this.apiUrl}/user/customers/${id}`);
  }

}
