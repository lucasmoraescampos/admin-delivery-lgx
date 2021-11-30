import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpResult } from '../models/http-result';

@Injectable({
  providedIn: 'root'
})
export class ReportsService
{

  private apiUrl = environment.apiUrl;


  constructor(
    private http: HttpClient
  )
  {
  }


  public get( arr )
  {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/projects/report?from=${arr.from}&to=${arr.to}`);
  }

  public getDownload( arr )
  {
    return this.http.get(`${this.apiUrl}/user/projects/report/download?from=${arr.from}&to=${arr.to}`, { responseType: 'blob' });
  }


  public getBags( arr )
  {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/projects/report/bags?from=${arr.from}&to=${arr.to}`);
  }

  public getDownloadBags( arr )
  {
    return this.http.get(`${this.apiUrl}/user/projects/report/bags/download?from=${arr.from}&to=${arr.to}`, { responseType: 'blob' });
  }


  public getDrivers( arr )
  {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/projects/report/drivers?from=${arr.from}&to=${arr.to}`);
  }

  public getDownloadDrivers( arr )
  {
    return this.http.get(`${this.apiUrl}/user/projects/report/drivers/download?from=${arr.from}&to=${arr.to}`, { responseType: 'blob' });
  }


}
