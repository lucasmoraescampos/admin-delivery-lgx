import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArrayHelper } from 'src/app/helpers/array.helper';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-managers',
  templateUrl: './managers.component.html',
  styleUrls: ['./managers.component.scss']
})
export class ManagersComponent implements OnInit {

  public search: string;

  public togglePassword: boolean;

  public managerIndex: number;

  public managers: any[];

  public teams: any[];

  public modalRef: BsModalRef;

  public formGroup: FormGroup;

  private unsubscribe = new Subject();

  constructor(
    private apiSrv: ApiService,
    private formBuilder: FormBuilder,
    private modalSrv: BsModalService,
    private alertSrv: AlertService
  ) { }

  ngOnInit() {

    this.initManagers();

    this.initTeams();

  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public isTeamChecked(id: number) {
    if (ArrayHelper.exist(this.managers[this.managerIndex].teams, 'id', id)) {
      return true;
    }
    else {
      return false;
    }
  }

  public changeEnabled(event: any, index: number) {
    
    this.apiSrv.updateManager(this.managers[index].id, { enabled: event.target.checked })
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {

        this.managers[this.managerIndex] = res.data;

        this.alertSrv.toast({
          icon: 'success',
          message: res.message
        });

      });

  }

  public openTeams(template: TemplateRef<any>, index: number) {

    this.managerIndex = index;

    this.modalRef = this.modalSrv.show(template, {
      class: 'modal-dialog-centered'
    });

  }

  public toggleTeam(id: number, event: any) {

    const manager_id = this.managers[this.managerIndex].id;

    if (event.target.checked) {

      this.apiSrv.attachManagerTeam(manager_id, { team_id: id })
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {

          this.managers[this.managerIndex] = res.data;

          this.alertSrv.toast({
            icon: 'success',
            message: res.message
          });
        
        }, err => {

          event.target.checked = false;
          
        });

    }

    else {

      this.apiSrv.detachManagerTeam(manager_id, id )
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {

          this.managers[this.managerIndex] = res.data;

          this.alertSrv.toast({
            icon: 'success',
            message: res.message
          });
        
        }, err => {

          event.target.checked = true;

        });

    }

  }

  public create(template: TemplateRef<any>) {

    this.managerIndex = undefined;

    this.formGroup = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.modalRef = this.modalSrv.show(template, {
      class: 'modal-dialog-centered'
    });

  }

  public edit(template: TemplateRef<any>, index: number) {

    this.togglePassword = false;

    this.managerIndex = index;

    this.formGroup = this.formBuilder.group({
      name: [this.managers[index].name, Validators.required],
      email: [this.managers[index].email, [Validators.required, Validators.email]],
      password: ['']
    });

    this.modalRef = this.modalSrv.show(template, {
      class: 'modal-dialog-centered'
    });

  }

  public delete(index: number) {

    const manager = this.managers[index];

    this.alertSrv.show({
      icon: 'warning',
      message: `This will permanently delete the manager "${manager.name}". Continue?`,
      onConfirm: () => {

        this.apiSrv.deleteManager(manager.id)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            this.managers = ArrayHelper.removeItem(this.managers, index);

            this.alertSrv.toast({
              icon: 'success',
              message: res.message
            });

          });

      }
    });

  }

  public save() {

    if (this.managerIndex >= 0) {

      const id = this.managers[this.managerIndex].id;

      this.apiSrv.updateManager(id, this.formGroup.value)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {

          this.managers[this.managerIndex] = res.data;

          this.modalRef.hide();

          this.alertSrv.toast({
            icon: 'success',
            message: res.message
          });

        });

    }

    else {

      this.apiSrv.createManager(this.formGroup.value)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {

          this.managers.unshift(res.data);

          this.modalRef.hide();

          this.alertSrv.toast({
            icon: 'success',
            message: res.message
          });

        });

    }

  }

  private initManagers() {
    this.apiSrv.getAllManagers()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {
        this.managers = res.data;
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

}
