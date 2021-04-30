import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'jquery';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ConfigHelper } from '../helpers/config.helper';
import { HttpResult } from '../models/http-result';

interface CurrentProject {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  public getCurrentProject(): CurrentProject {
    return JSON.parse(localStorage.getItem(ConfigHelper.Storage.CurrentProject));
  }

  public setCurrentProject(project: CurrentProject) {
    localStorage.setItem(ConfigHelper.Storage.CurrentProject, JSON.stringify(project));
  }

  public getAll() {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/project`);
  }

  public downloadSummary(id: number) {
    return this.http.get(`${this.apiUrl}/user/project/${id}/download/summary`, { responseType: 'blob' });
  }

  public downloadSolution(id: number) {
    return this.http.get(`${this.apiUrl}/user/project/${id}/download/solution`, { responseType: 'blob' });
  }

  public getById(id: number) {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/project/${id}`);
  }

  public optimize(id: number) {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/project/${id}/optimize`);
  }

  public reorder(id: number, data: any) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/project/${id}/reorder`, data);
  }

  public create(data: any) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/project`, data);
  }
  
  public delete(id: number) {
    return this.http.delete<HttpResult>(`${this.apiUrl}/user/project/${id}`);
  }

  public deleteProjectDriver(project_id: number, driver_id: number) {
    return this.http.delete<HttpResult>(`${this.apiUrl}/user/project/${project_id}/driver/${driver_id}`);
  }

  public addProjectDriver(project_id: number, driver_id: number) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/project/${project_id}/driver/${driver_id}`, null);
  }
}
