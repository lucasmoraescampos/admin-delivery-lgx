import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpResult } from '../../models/http-result';

@Injectable({
  providedIn: 'root'
})
export class WhereIsMyOrderService
{

  private apiUrl = environment.apiUrl;


  constructor(
    private http: HttpClient
  )
  {
  }


  public get(phone: any, order: any)
  {
    return this.http.get<any>(`${this.apiUrl}/find-my-order/${phone}/${order}`);
  }


}
