import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ConfigHelper } from '../helpers/config.helper';
import { CurrentProject } from '../models/current-project';
import { HttpResult } from '../models/http-result';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiUrl = environment.apiUrl;

  private currentProjectSubject: BehaviorSubject<CurrentProject>;

  public currentProject: Observable<CurrentProject>;

  constructor(
    private http: HttpClient
  ) {
    this.currentProjectSubject = new BehaviorSubject<CurrentProject>(JSON.parse(localStorage.getItem(ConfigHelper.Storage.CurrentProject)));
    this.currentProject = this.currentProjectSubject.asObservable();
  }

  public getCurrentProject(): CurrentProject {
    return this.currentProjectSubject.value;
  }

  public setCurrentProject(project: CurrentProject) {
    localStorage.setItem(ConfigHelper.Storage.CurrentProject, JSON.stringify(project));
    this.currentProjectSubject.next(project);
  }

  public getAll() {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/project`);
  }

  public create(data: any) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/project`, data);
  }
  
  public delete(id: number) {
    return this.http.delete<HttpResult>(`${this.apiUrl}/user/project/${id}`);
  }

  public deleteProjectDriver(project_id: number, driver_id: number) {
    return this.http.delete<HttpResult>(`${this.apiUrl}/user/project/${project_id}/driver/${driver_id}`)
      .pipe(map(res => {
        if (res.success) {
          localStorage.setItem(ConfigHelper.Storage.CurrentProject, JSON.stringify(res.data));
          this.currentProjectSubject.next(res.data);
        }
        return res;
      }));
  }

  public editProjectDriver(project_id: number, driver_id: number, post: any) {
    return this.http.put<HttpResult>(`${this.apiUrl}/user/project/${project_id}/driver/${driver_id}`, post)
      .pipe(map(res => {
        if (res.success) {
          localStorage.setItem(ConfigHelper.Storage.CurrentProject, JSON.stringify(res.data));
          this.currentProjectSubject.next(res.data);
        }
        return res;
      }));
  }

  public deleteProjectStop(id: number, stop_id: number) {
    return this.http.delete<HttpResult>(`${this.apiUrl}/user/project/${id}/stop/${stop_id}`)
      .pipe(map(res => {
        if (res.success) {
          localStorage.setItem(ConfigHelper.Storage.CurrentProject, JSON.stringify(res.data));
          this.currentProjectSubject.next(res.data);
        }
        return res;
      }));
  }

  public addProjectDriver(project_id: number, driver_id: number, post: any)
  {
    post.timezone = String(new Date().getTimezoneOffset() / 60);

    return this.http.post<HttpResult>(`${this.apiUrl}/user/project/${project_id}/driver/${driver_id}`, post )
      .pipe(map(res => {
        if (res.success) {
          localStorage.setItem(ConfigHelper.Storage.CurrentProject, JSON.stringify(res.data));
          this.currentProjectSubject.next(res.data);
        }
        return res;
      }));
  }

  public downloadSummary(id: number) {
    return this.http.get(`${this.apiUrl}/user/project/${id}/download/summary`, { responseType: 'blob' });
  }

  public downloadSolution(id: number) {
    return this.http.get(`${this.apiUrl}/user/project/${id}/download/solution`, { responseType: 'blob' });
  }

  public downloadRoute(id: number) {
    return this.http.get(`${this.apiUrl}/user/project/${id}/download/route`, { responseType: 'blob' });
  }

  public getById(id: number) {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/project/${id}`)
      .pipe(map(res => {
        if (res.success) {
          localStorage.setItem(ConfigHelper.Storage.CurrentProject, JSON.stringify(res.data));
          this.currentProjectSubject.next(res.data);
        }
        return res;
      }));
  }

  public optimize(id: number) {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/project/${id}/optimize`)
      .pipe(map(res => {
        if (res.success) {
          localStorage.setItem(ConfigHelper.Storage.CurrentProject, JSON.stringify(res.data));
          this.currentProjectSubject.next(res.data);
        }
        return res;
      }));
  }

  public reorder(id: number, data: any) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/project/${id}/reorder`, data)
      .pipe(map(res => {
        if (res.success) {
          localStorage.setItem(ConfigHelper.Storage.CurrentProject, JSON.stringify(res.data));
          this.currentProjectSubject.next(res.data);
        }
        return res;
      }));
  }

  public dispatch(id: number) {
    return this.http.put<HttpResult>(`${this.apiUrl}/user/project/${id}/dispatch`, null)
      .pipe(map(res => {
        if (res.success) {
          localStorage.setItem(ConfigHelper.Storage.CurrentProject, JSON.stringify(res.data));
          this.currentProjectSubject.next(res.data);
        }
        return res;
      }));
  }

  public swapRoute(id: number, data: any) {
    return this.http.put<HttpResult>(`${this.apiUrl}/user/project/${id}/swapRoute`, data)
      .pipe(map(res => {
        if (res.success) {
          localStorage.setItem(ConfigHelper.Storage.CurrentProject, JSON.stringify(res.data));
          this.currentProjectSubject.next(res.data);
        }
        return res;
      }));
  }

  public reverseRoute(id: number, data: any) {
    return this.http.put<HttpResult>(`${this.apiUrl}/user/project/${id}/reverseRoute`, data)
      .pipe(map(res => {
        if (res.success) {
          localStorage.setItem(ConfigHelper.Storage.CurrentProject, JSON.stringify(res.data));
          this.currentProjectSubject.next(res.data);
        }
        return res;
      }));
  }


  public sendSms(id: number, driver:number) {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/project/${id}/sms/${driver}`);
  }


  public sendSms2All(id: number, drivers:string) {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/project/${id}/sms-all/${drivers}`);
  }


  public cloneProject(id: number, data:any) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/project/${id}/clone`, data);
  }

  public updateProject(id: number, data:any) {
    return this.http.put<HttpResult>(`${this.apiUrl}/user/project/${id}`, data);
  }


}
