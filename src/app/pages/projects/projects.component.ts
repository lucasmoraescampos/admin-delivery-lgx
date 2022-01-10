import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArrayHelper } from 'src/app/helpers/array.helper';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit, OnDestroy {

  public date = new Date();

  public perPage: number;

  public total: number;

  public totalSearched: number;

  public projects: any[];

  public projectsSearched: any[];

  public name: string;

  public from: string;

  public to: string;

  public teams: any[];

  public customers: any[];

  public timezones: any[];

  public selectedUpdateIndex: number;

  public selectedCloneIndex: number;

  public formGroup: FormGroup;

  private pages: any = {};

  private pagesSearched: any = {};

  private modalRef: BsModalRef;

  private searchTimeout: NodeJS.Timeout;

  private unsubscribe = new Subject();

  constructor(
    private apiSrv: ApiService,
    private modalSrv: BsModalService,
    private formBuilder: FormBuilder,
    private alertSrv: AlertService
  ) { }

  ngOnInit() {

    this.initProjects();

    this.initTeams();

    this.initCustomers();

    this.initTimezones(this.date);

  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public modalDismiss() {

    this.modalRef.hide();

    setTimeout(() => {

      this.selectedUpdateIndex = undefined;

      this.selectedCloneIndex = undefined;

    }, 1000);

  }

  public toggleSearch() {

    if (!this.from && !this.to && !this.name) {

      this.totalSearched = null;

      this.projectsSearched = null;

      this.pagesSearched = null;

    }

    else {

      this.pageSearchedChanged();

    }

  }

  public changeDateFilter(date: Date, type: 'from' | 'to') {

    const day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();

    const month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : '0' + String(date.getMonth() + 1);

    if (type == 'from') {
      this.from = `${date.getFullYear()}-${month}-${day}`;
    }

    else {
      this.to = `${date.getFullYear()}-${month}-${day}`;
    }

    this.pageSearchedChanged();

  }

  public searchChanged() {

    if (this.name.length > 1) {

      clearTimeout(this.searchTimeout);

      this.searchTimeout = setTimeout(() => {

        this.pageSearchedChanged();

      }, 500);

    }

  }

  public pageChanged(page: number) {

    if (this.pages[page]?.length > 0) {

      this.projects = this.pages[page];

    }

    else {

      this.apiSrv.getAllProjects({ page: page })
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {

          this.perPage = res.data.per_page;

          this.total = res.data.total;

          this.projects = res.data.projects;

          this.pages[page] = this.projects;

        });

    }

  }

  public pageSearchedChanged(page?: number) {

    if (page && this.pagesSearched[page]?.length > 0) {

      this.projectsSearched = this.pagesSearched[page];

    }

    else {

      const params: any = {};

      if (page) {
        params.page = page;
      }

      if (this.from) {
        params.from = this.from;
      }

      if (this.to) {
        params.to = this.to;
      }

      if (this.name) {
        params.name = this.name;
      }

      this.apiSrv.getAllProjects(params)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {

          this.perPage = res.data.per_page;

          this.totalSearched = res.data.total;

          this.projectsSearched = res.data.projects;

          this.pagesSearched[page] = this.projectsSearched;

        });

    }

  }

  public numberStops(project: any) {

    let stops = 0;

    project.drivers.forEach((driver: any) => {

      if (driver.pivot.routes) {
        stops += driver.pivot.routes.length;
      }

    });

    return stops;

  }

  public totalDistance(project: any) {

    let distance = 0;

    project.drivers.forEach((driver: any) => {

      if (driver.pivot.routes) {

        driver.pivot.routes.forEach((route: any) => {

          distance += route.distance;

        });

      }

    });

    return distance / 1000;

  }

  public totalTime(project: any) {

    let time = 0;

    project.drivers.forEach((driver: any) => {

      if (driver.pivot.routes) {

        driver.pivot.routes.forEach((route: any) => {

          time += route.duration;

        });

      }

    });

    return time / 60;

  }

  public changeDate(date: Date) {

    const day = (`0${date.getDate()}`).slice(-2);

    const month = (`0${date.getMonth() + 1}`).slice(-2);

    const year = date.getFullYear();
    
    this.formGroup.patchValue({ date: `${year}-${month}-${day}` });

    this.initTimezones(date);

  }

  public create(template: TemplateRef<any>) {

    this.date = new Date();

    this.formGroup = this.formBuilder.group({
      team_id: ['', Validators.required],
      name: ['', Validators.required],
      date: [this.date, Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      utc_offset: ['', Validators.required],
      customer_id: ['']
    });

    this.modalRef = this.modalSrv.show(template, {
      class: 'modal-dialog-centered modal-lg',
      keyboard: false,
      backdrop: 'static'
    });

  }

  public edit(template: TemplateRef<any>, index: number) {

    this.selectedUpdateIndex = index;

    const project = this.getProject(index);

    this.date = new Date(`${project.date} 00:00:00`);

    this.formGroup = this.formBuilder.group({
      team_id: [project.team_id, Validators.required],
      name: [project.name, Validators.required],
      date: [this.date, Validators.required],
      start_time: [new Date(`${project.date} ${project.start_time}`), Validators.required],
      end_time: [new Date(`${project.date} ${project.end_time}`), Validators.required],
      utc_offset: [project.utc_offset, Validators.required],
      customer_id: [project.customer_id ?? '']
    });

    this.modalRef = this.modalSrv.show(template, {
      class: 'modal-dialog-centered modal-lg',
      keyboard: false,
      backdrop: 'static'
    });

  }

  public clone(template: TemplateRef<any>, index: number) {

    this.selectedCloneIndex = index;

    this.date = new Date();

    const project = this.getProject(index);

    this.formGroup = this.formBuilder.group({
      team_id: [project.team_id, Validators.required],
      name: [project.name, Validators.required],
      date: [this.date, Validators.required],
      start_time: [new Date(`${project.date} ${project.start_time}`), Validators.required],
      end_time: [new Date(`${project.date} ${project.end_time}`), Validators.required],
      utc_offset: [project.utc_offset, Validators.required],
      customer_id: [project.customer_id ?? '']
    });

    this.modalRef = this.modalSrv.show(template, {
      class: 'modal-dialog-centered modal-lg',
      keyboard: false,
      backdrop: 'static'
    });

  }

  public save() {

    if (this.formGroup.valid) {

      const data = this.formGroup.value;

      data.start_time = new Date(data.start_time).toTimeString().slice(0, 8);

      data.end_time = new Date(data.end_time).toTimeString().slice(0, 8);

      if (this.selectedUpdateIndex !== undefined) {

        const project = this.getProject(this.selectedUpdateIndex);

        this.apiSrv.updateProject(project.id, data)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            if (res.success) {

              this.setProject(res.data, this.selectedUpdateIndex);

              this.alertSrv.toast({
                icon: 'success',
                message: res.message
              });

              this.modalDismiss();

            }

          });

      }

      else if (this.selectedCloneIndex !== undefined) {
        
        let project: any;

        if (this.projectsSearched) {
          project = this.projectsSearched[this.selectedCloneIndex];
        }

        else {
          project = this.projects[this.selectedCloneIndex];
        }

        this.apiSrv.cloneProject(project.id, this.formGroup.value)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe((res: any) => {

            if (res.success) {
              
              this.projects.unshift(res.data);

              this.projects = ArrayHelper.orderbyDesc(this.projects, 'date');

              this.alertSrv.toast({
                icon: 'success',
                message: res.message
              });

              this.modalDismiss();

            }

          });

      }

      else {

        this.apiSrv.createProject(data)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            if (res.success) {

              this.projects.unshift(res.data);

              this.projects = ArrayHelper.orderbyDesc(this.projects, 'date');

              this.alertSrv.toast({
                icon: 'success',
                message: res.message
              });

              this.modalDismiss();

            }

          });

      }

    }

  }

  public delete(index: number) {

    const project = this.getProject(index);

    this.alertSrv.show({
      icon: 'warning',
      message: `This will permanently delete the project "${project.name}". Continue?`,
      onConfirm: () => {

        this.apiSrv.deleteProject(project.id)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            if (res.success) {

              this.removeProject(index);

              this.alertSrv.toast({
                icon: 'success',
                message: res.message
              });

            }

            else {

              this.alertSrv.toast({
                icon: 'error',
                message: res.message
              });

            }

          });
      }
    });

  }

  private getProject(index: number) {
    if (this.projectsSearched) {
      return this.projectsSearched[index];
    }
    else {
      return this.projects[index];
    }
  }

  private setProject(project: any, index?: number) {
    if (this.projectsSearched) {
      if (index === undefined) {
        this.projectsSearched.unshift(project);
        this.projectsSearched = ArrayHelper.orderbyDesc(this.projectsSearched, 'date');
      }
      else {
        this.projectsSearched[index] = project;
      }
    }
    else {
      if (index === undefined) {
        this.projects.unshift(project);
        this.projects = ArrayHelper.orderbyDesc(this.projects, 'date');
      }
      else {
        this.projects[index] = project;
      }
    }
  }

  private removeProject(index: number) {
    if (this.projectsSearched) {
      this.projectsSearched[index] = ArrayHelper.removeItem(this.projectsSearched, index);
    }
    else {
      this.projects = ArrayHelper.removeItem(this.projects, index);
    }
  }

  private initProjects() {

    this.apiSrv.getAllProjects()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {

        this.perPage = res.data.per_page;

        this.total = res.data.total;

        this.projects = res.data.projects;

        this.pages[1] = this.projects;

      });

  }

  private initTeams() {
    this.apiSrv.getAllTeams()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {
        if (res.success) {
          this.teams = res.data;
        }
      });
  }

  private initCustomers() {
    this.apiSrv.getAllCustomers()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {
        if (res.success) {
          this.customers = res.data;
        }
      });
  }

  private initTimezones(date: any) {
    this.apiSrv.getTimezones({ date: formatDate(date, 'yyyy-MM-dd', 'en-US') })
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {
        if (res.success) {
          this.timezones = res.data;
        }
      });
  }

}
