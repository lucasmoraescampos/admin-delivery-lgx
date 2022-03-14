import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ConfigHelper } from '../helpers/config.helper';
import { HttpResult } from '../models/http-result';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  /*
   * Api Requests
   */
  public findMyOrder(phone: any, order: any) {
    return this.http.get<any>(`${this.apiUrl}/find-my-order/${phone}/${order}`);
  }

  public getTimezones(params: any) {
    return this.http.get<HttpResult>(`${this.apiUrl}/timezones`, { params: params });
  }

  public sendFeedback(data: any) {
    return this.http.post<HttpResult>(`${this.apiUrl}/feedback`, data);
  }

  /*
   * User Requests
   */
  public authenticate(data: any) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/login`, data);
  }

  public logout() {
    const token = localStorage.getItem(ConfigHelper.Storage.AccessToken);
    return this.http.post<HttpResult>(`${this.apiUrl}/user/logout`, { token });
  }

  public resume() {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/resume`);
  }

  /*
   * Team Requests
   */
  public getAllTeams() {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/team`);
  }

  public createTeam(data: any) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/team`, data);
  }

  public updateTeam(id: number, data: any) {
    return this.http.put<HttpResult>(`${this.apiUrl}/user/team/${id}`, data);
  }

  public deleteTeam(id: number) {
    return this.http.delete<HttpResult>(`${this.apiUrl}/user/team/${id}`);
  }

  public attachTeamManager(team_id: number, data: any) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/team/${team_id}/manager`, data);
  }

  public detachTeamManager(team_id: number, manager_id: number) {
    return this.http.delete<HttpResult>(`${this.apiUrl}/user/team/${team_id}/manager/${manager_id}`);
  }

  /*
   * Customer Requests
   */
  public getAllCustomers() {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/customer`);
  }

  public createCustomer(data: any) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/customer`, data);
  }

  public updateCustomer(id: number, data: any) {
    return this.http.put<HttpResult>(`${this.apiUrl}/user/customer/${id}`, data);
  }

  public deleteCustomer(id: number) {
    return this.http.delete<HttpResult>(`${this.apiUrl}/user/customer/${id}`);
  }

  /*
   * Manager Requests
   */
  public getAllManagers() {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/manager`);
  }

  public createManager(data: any) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/manager`, data);
  }

  public updateManager(id: number, data: any) {
    return this.http.put<HttpResult>(`${this.apiUrl}/user/manager/${id}`, data);
  }

  public deleteManager(id: number) {
    return this.http.delete<HttpResult>(`${this.apiUrl}/user/manager/${id}`);
  }

  public attachManagerTeam(manager_id: number, data: any) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/manager/${manager_id}/team`, data);
  }

  public detachManagerTeam(manager_id: number, team_id: number) {
    return this.http.delete<HttpResult>(`${this.apiUrl}/user/manager/${manager_id}/team/${team_id}`);
  }

  /*
   * Project Requests
   */
  public getAllProjects(params?: any) { //
    return this.http.get<HttpResult>(`${this.apiUrl}/user/project`, { params: params });
  }

  public getProjectById(id: number) { //
    return this.http.get<HttpResult>(`${this.apiUrl}/user/project/${id}`);
  }

  public createProject(data: any) { //
    return this.http.post<HttpResult>(`${this.apiUrl}/user/project`, data);
  }

  public updateProject(id: number, data: any) { //
    return this.http.put<HttpResult>(`${this.apiUrl}/user/project/${id}`, data);
  }

  public cloneProject(id: number, data: any) { //
    return this.http.post<HttpResult>(`${this.apiUrl}/user/project/${id}/clone`, data);
  }

  public deleteProject(id: number) { //
    return this.http.delete<HttpResult>(`${this.apiUrl}/user/project/${id}`);
  }

  public getFullListProjects() { //
    return this.http.get<HttpResult>(`${this.apiUrl}/user/project/list/full`);
  }

  public addProjectDriver(project_id: number, driver_id: number, data: any) { //
    return this.http.post<HttpResult>(`${this.apiUrl}/user/project/${project_id}/driver/${driver_id}`, data);
  }

  public updateProjectDriver(project_id: number, driver_id: number, data: any) { //
    return this.http.put<HttpResult>(`${this.apiUrl}/user/project/${project_id}/driver/${driver_id}`, data);
  }

  public deleteProjectDriver(project_id: number, driver_id: number) { //
    return this.http.delete<HttpResult>(`${this.apiUrl}/user/project/${project_id}/driver/${driver_id}`);
  }

  public deleteProjectStop(id: number, stop_id: number) { //
    return this.http.delete<HttpResult>(`${this.apiUrl}/user/project/${id}/stop/${stop_id}`);
  }

  public optimize(id: number) { //
    return this.http.get<HttpResult>(`${this.apiUrl}/user/project/${id}/optimize`);
  }

  public dispatch(id: number) { //
    return this.http.put<HttpResult>(`${this.apiUrl}/user/project/${id}/dispatch`, {});
  }

  public reverseRoute(id: number, data: any) {
    return this.http.put<HttpResult>(`${this.apiUrl}/user/project/${id}/reverseRoute`, data);
  }

  public reorder(id: number, data: any) { //
    return this.http.post<HttpResult>(`${this.apiUrl}/user/project/${id}/reorder`, data);
  }

  public swapRoute(id: number, data: any) {
    return this.http.put<HttpResult>(`${this.apiUrl}/user/project/${id}/swapRoute`, data);
  }

  public sendSms(id: number, driver:number) {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/project/${id}/sms/${driver}`);
  }

  public sendSmsAll(id: number) {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/project/${id}/sms-all`);
  }

  public projectDownloadSummary(id: number) {
    return this.http.get(`${this.apiUrl}/user/project/${id}/download/summary`, { responseType: 'blob' });
  }

  public projectDownloadSolution(id: number) {
    return this.http.get(`${this.apiUrl}/user/project/${id}/download/solution`, { responseType: 'blob' });
  }

  public projectDownloadRoute(id: number) {
    return this.http.get(`${this.apiUrl}/user/project/${id}/download/route`, { responseType: 'blob' });
  }

  public report(params: any) {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/projects/report`, { params: params });
  }

  public reportDownload(params: any) {
    return this.http.get(`${this.apiUrl}/user/projects/report/download`, { params: params, responseType: 'blob' });
  }

  public reportDrivers(params: any) {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/projects/report/drivers`, { params: params });
  }

  public reportDriversDownload(params: any) {
    return this.http.get(`${this.apiUrl}/user/projects/report/drivers/download`, { params: params, responseType: 'blob' });
  }

  public reportBags(params: any) {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/projects/report/bags`, { params: params });
  }

  public reportBagsDownload(params: any) {
    return this.http.get(`${this.apiUrl}/user/projects/report/bags/download`, { params: params, responseType: 'blob' });
  }

  public deliveries(params?: any) {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/projects/deliveries`, { params: params });
  }


  /*
   * Stop Requests
   */
  public createStop(data: any) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/stop`, data);
  }

  public updateStop(id: number, data: any) {
    return this.http.put<HttpResult>(`${this.apiUrl}/user/stop/${id}`, data);
  }

  public columnNamesImport(data: FormData) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/stop/import/columnNames`, data);
  }

  public importStops(data: FormData) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/stop/import`, data);
  }

  /*
   * Driver Requests
   */
  public getAllDrivers() {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/driver`);
  }

  public getDriversByTeam(team_id: number) {
    return this.http.get<HttpResult>(`${this.apiUrl}/user/driver/team/${team_id}`);
  }

  public createDriver(data: any) {
    return this.http.post<HttpResult>(`${this.apiUrl}/user/driver`, data);
  }

  public updateDriver(id: number, data: any) {
    return this.http.put<HttpResult>(`${this.apiUrl}/user/driver/${id}`, data);
  }

  public deleteDriver(id: number) {
    return this.http.delete<HttpResult>(`${this.apiUrl}/user/driver/${id}`);
  }  
  
}
