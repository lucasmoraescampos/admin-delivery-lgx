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

  readonly today = new Date();

  public projects: any[] = [];

  public name: string;

  public from: string;

  public to: string;

  public formGroup: FormGroup;

  private modalRef: BsModalRef;

  private unsubscribe = new Subject();

  constructor(
    private modalSrv: BsModalService,
    private formBuilder: FormBuilder,
    private projectSrv: ProjectService,
    private loadingSrv: LoadingService,
    private alertSrv: AlertService,
    private router: Router
  ) {}

  ngOnInit() {

    this.formGroup = this.formBuilder.group({
      name: ['', Validators.required],
      date: ['', Validators.required]
    });

    this.initProjects();

  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public modalDismiss() {
    this.formGroup.reset();
    this.modalRef.hide();
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

  }
 
  public openModal(template: TemplateRef<any>) {

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
      name: project.name
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

  private initProjects() {
    this.loadingSrv.show();
    this.projectSrv.getAll()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {
        this.loadingSrv.hide();
        this.projects = res.data;
      });
  }
}
