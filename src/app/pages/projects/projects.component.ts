import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArrayHelper } from 'src/app/helpers/array.helper';
import { AlertService } from 'src/app/services/alert.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit, OnDestroy {

  public today = new Date();

  public per_page: number;

  public total: number;

  public total_searched: number;

  public projects: any[];

  public projects_searched: any[];

  public customers: any[] = [];

  public name: string;

  public from: string;

  public to: string;

  public formGroup: FormGroup;

  private modalRef: BsModalRef;

  public cloneTarget: any;

  public updateTarget: any;

  public updateIndex: number;

  private pages: any = {};

  private pages_searched: any = {};

  private searchTimeout: NodeJS.Timeout;

  private unsubscribe = new Subject();

  constructor(
    private modalSrv: BsModalService,
    private formBuilder: FormBuilder,
    private projectSrv: ProjectService,
    private loadingSrv: LoadingService,
    private alertSrv: AlertService,
    private router: Router
  ) { }

  ngOnInit() {

    this.formGroup = this.formBuilder.group({
      name: ['', Validators.required],
      date: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      customers_id: ['']
    });

    this.initProjects();

  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public modalDismiss() {

    this.today = new Date();

    this.updateIndex = null;

    this.cloneTarget = null;

    this.updateTarget = null;

    this.formGroup.reset();

    this.modalRef.hide();

  }

  public toggleSearch() {
    
    if (!this.from && !this.to && !this.name) {
      this.total_searched = null;
      this.projects_searched = null;
      this.pages_searched = null;
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

      this.loadingSrv.show();

      this.projectSrv.getAll({ page: page })
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {

          this.loadingSrv.hide();

          this.per_page = res.data.per_page;

          this.total = res.data.total;

          this.projects = res.data.projects;

          this.pages[page] = this.projects;

          this.customers = res.customers;

        });

    }

  }

  public pageSearchedChanged(page?: number) {

    if (page && this.pages_searched[page]?.length > 0) {

      this.projects_searched = this.pages_searched[page];

    }

    else {

      this.loadingSrv.show();

      const params: any = { };

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

      this.projectSrv.getAll(params)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {

          this.loadingSrv.hide();

          this.per_page = res.data.per_page;

          this.total_searched = res.data.total;

          this.projects_searched = res.data.projects;

          this.pages_searched[page] = this.projects_searched;

        });

    }

  }

  
  public openModal(template: TemplateRef<any>, i = null) {
    this.cloneTarget = (i !== null) ? this.projects[i] : null;

    this.modalRef = this.modalSrv.show(template, {
      class: 'modal-dialog-centered',
      keyboard: false,
      backdrop: 'static'
    });
  }



  public changeDate(date: Date) {
    const day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
    const month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : '0' + String(date.getMonth() + 1);

    this.formGroup.patchValue({ date: `${date.getFullYear()}-${month}-${day}` });
  }



  public openProject(project: any) {

    this.projectSrv.setCurrentProject({
      id: project.id,
      name: project.name,
      status: project.status
    });

    this.router.navigateByUrl('/project');
  }




  public save() {

    if (this.formGroup.valid) {

      this.loadingSrv.show();

      this.projectSrv.create(this.formGroup.value)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {

          this.loadingSrv.hide();

          if (res.success) {

            this.modalDismiss();
            this.projects.unshift(res.data);

            this.projects = ArrayHelper.orderbyDesc(this.projects, 'date');

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

        }, err => {

          this.alertSrv.toast({
            icon: 'error',
            message: err.error.message
          });

        });

    }

  }

  public delete(index: number) {

    const project = this.projects[index];

    this.alertSrv.show({
      icon: 'warning',
      message: `This will permanently delete the project "${project.name}". Continue?`,
      onConfirm: () => {
        this.loadingSrv.show();
        this.projectSrv.delete(project.id)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            this.loadingSrv.hide();

            if (res.success) {

              this.projects = ArrayHelper.removeItem(this.projects, index);

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

  public stops(project: any) {

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



  private initProjects() {

    this.loadingSrv.show();

    this.projectSrv.getAll()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {

        this.loadingSrv.hide();

        this.per_page = res.data.per_page;

        this.total = res.data.total;

        this.projects = res.data.projects;

        this.pages[1] = this.projects;

        this.customers = res.customers;

      });

  }


  post() {
    if (this.cloneTarget) {
      this.clone(this.cloneTarget);
    }
    else if (this.updateTarget) {
      this.update(this.updateTarget)
    }
    else {
      this.save();
    }
  }


  public clone(project) {
    if (this.formGroup.valid) {
      this.loadingSrv.show();

      this.projectSrv.cloneProject(project.id, this.formGroup.value)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((res: any) => {

          this.loadingSrv.hide();

          if (res.success) {
            this.modalDismiss();
            this.projects.unshift(res.data);
            this.projects = ArrayHelper.orderbyDesc(this.projects, 'date');

            this.alertSrv.toast({
              icon: 'success',
              message: res.message
            });
          }

        }, (res: any) => {

          this.loadingSrv.hide();

          this.alertSrv.toast({
            icon: 'error',
            message: res.error.message
          });

        });
    }
  }


  public update(project) {
    if (this.formGroup.valid) {
      this.loadingSrv.show();

      this.projectSrv.updateProject(project.id, this.formGroup.value)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((res: any) => {

          this.loadingSrv.hide();

          if (res.success) {
            this.projects[this.updateIndex].name = res.data.name;
            this.projects[this.updateIndex].start_time = res.data.start_time;
            this.projects[this.updateIndex].end_time = res.data.end_time;
            this.projects[this.updateIndex].date = res.data.date;
            this.projects[this.updateIndex].customers_id = res.data.customers_id;

            this.modalDismiss();

            this.alertSrv.toast({
              icon: 'success',
              message: res.message
            });
          }

        }, (res: any) => {

          this.loadingSrv.hide();

          this.alertSrv.toast({
            icon: 'error',
            message: res.error.message
          });

        });
    }
  }



  edit(template: TemplateRef<any>, i = null) {
    this.updateTarget = (i !== null) ? this.projects[i] : null;
    this.updateIndex = i;
    let customer_id = parseInt(this.updateTarget.customers_id);

    this.formGroup.controls['name'].setValue(this.updateTarget.name);
    this.formGroup.controls['date'].setValue(this.updateTarget.date);
    this.formGroup.controls['start_time'].setValue(this.updateTarget.start_time);
    this.formGroup.controls['end_time'].setValue(this.updateTarget.end_time);
    this.formGroup.controls['customers_id'].setValue(customer_id);

    this.today = new Date(this.updateTarget.date + ' 00:00');

    this.modalRef = this.modalSrv.show(template, {
      class: 'modal-dialog-centered',
      keyboard: false,
      backdrop: 'static'
    });
  }


}
