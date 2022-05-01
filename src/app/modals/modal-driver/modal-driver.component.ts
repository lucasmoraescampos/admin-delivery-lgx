import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UtilsHelper } from 'src/app/helpers/utils.helper';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-modal-driver',
  templateUrl: './modal-driver.component.html',
  styleUrls: ['./modal-driver.component.scss']
})
export class ModalDriverComponent implements OnInit, OnDestroy {

  @Input() driver: any;

  public activeIndex: string = 'profile';

  public teams: any[];

  public selectedTeams: any[];

  public formGroup: FormGroup;

  public onClose = new Subject();

  private unsubscribe = new Subject();

  constructor(
    private apiSrv: ApiService,
    private formBuilder: FormBuilder,
    private bsModalRef: BsModalRef,
    private alertSrv: AlertService,
    private loadingSrv: LoadingService
  ) { }

  ngOnInit() {

    this.formGroup = this.formBuilder.group({
      name: [this.driver?.name ?? '', Validators.required],
      email: [this.driver?.email ?? '', Validators.required],
      phone: [this.driver?.phone ?? '', Validators.required],
      start_address: [this.driver?.start_address ?? '', Validators.required],
      start_lat: [this.driver?.start_lat ?? '', Validators.required],
      start_lng: [this.driver?.start_lng ?? '', Validators.required],
      start_time: [this.driver?.start_time ?? '08:00', Validators.required],
      end_time: [this.driver ? this.driver.end_time : '16:00', Validators.required],
      status: [''],
      password: [''],
      confirm_password: ['']
    });

    this.initTeams();

    this.initSelectedTeams();

  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public dismiss() {
    this.bsModalRef.hide();
  }

  public get formControl() {
    return this.formGroup.controls;
  }

  public tabChanged(activeIndex: string) {
    this.activeIndex = activeIndex;
  }

  public changeStartAddress(event: any) {
    this.formGroup.patchValue({
      start_address: event.address,
      start_lat: String(event.latLng.lat),
      start_lng: String(event.latLng.lng),
    });
  }

  public toggleTeam(teamId: number) {
    if (this.selectedTeams.indexOf(teamId) == -1) {
      this.selectedTeams.push(teamId);
    }
    else {
      this.selectedTeams = this.selectedTeams.filter(x => x != teamId);
    }
  }

  public statusChanged(ev: any) {
    this.formGroup.patchValue({ status: ev.target.value });
  }

  public save() {

    const data = { ...this.formGroup.value };

    if (data.email == '') {

      this.activeIndex = 'profile';

      this.alertSrv.toast({
        icon: 'error',
        message: 'The field email is required'
      });

    }

    else if (!UtilsHelper.validateEmail(data.email)) {

      this.activeIndex = 'profile';

      this.alertSrv.toast({
        icon: 'error',
        message: 'Invalid email'
      });

    }

    else if (this.selectedTeams.length == 0) {

      this.activeIndex = 'teams';

      this.alertSrv.toast({
        icon: 'error',
        message: 'Select driver teams!'
      });

    }

    else if (!this.driver && data.password == '') {

      this.activeIndex = 'password';

      this.alertSrv.toast({
        icon: 'error',
        message: 'Create a password'
      });

    }

    else if (data.password && data.confirm_password == '') {

      this.activeIndex = 'password';

      this.alertSrv.toast({
        icon: 'error',
        message: 'Confirm the new password'
      });

    }

    else if (data.password && data.password != data.confirm_password) {

      this.activeIndex = 'password';

      this.alertSrv.toast({
        icon: 'error',
        message: 'The passwords are different!'
      });

    }

    else {

      this.loadingSrv.show();

      data.start_time = data.start_time.slice(0, 5);

      data.end_time = data.end_time.slice(0, 5);

      data.teams = this.selectedTeams;

      delete data.confirm_password;

      if (this.driver) {

        this.apiSrv.updateDriver(this.driver.id, data)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            this.loadingSrv.hide();

            if (res.success) {

              this.alertSrv.toast({
                icon: 'success',
                message: res.message
              });

              this.onClose.next(res.data);

              this.bsModalRef.hide();

            }

            else {

              this.alertSrv.toast({
                icon: 'error',
                message: res.message
              });

            }

          });
      
      }

      else {

        this.apiSrv.createDriver(data)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            this.loadingSrv.hide();

            if (res.success) {

              this.alertSrv.toast({
                icon: 'success',
                message: res.message
              });

              this.onClose.next(res.data);

              this.bsModalRef.hide();

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

  private initSelectedTeams() {
    this.selectedTeams = [];
    this.driver?.teams.forEach((team: any) => {
      this.selectedTeams.push(team.id);
    });
  }

}
