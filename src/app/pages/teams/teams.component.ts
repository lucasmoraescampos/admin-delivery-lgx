import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArrayHelper } from 'src/app/helpers/array.helper';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss']
})
export class TeamsComponent implements OnInit, OnDestroy {

  public search: string;

  public teamName: string;

  public teamIndex: number;

  public teams: any[];

  public managers: any[];

  private modalRef: BsModalRef;

  private unsubscribe = new Subject();

  constructor(
    private apiSrv: ApiService,
    private modalSrv: BsModalService,
    private alertSrv: AlertService
  ) { }

  ngOnInit() {

    this.initTeams();

    this.initManagers();

  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public modalDismiss() {

    this.modalRef.hide();

    setTimeout(() => {

      this.teamIndex = undefined;

      this.teamName = undefined;

    }, 1000);

  }

  public isManagerChecked(id: number) {
    if (ArrayHelper.exist(this.teams[this.teamIndex].managers, 'id', id)) {
      return true;
    }
    else {
      return false;
    }
  }

  public openManagers(template: TemplateRef<any>, index: number) {

    this.teamIndex = index;

    this.modalRef = this.modalSrv.show(template, {
      class: 'modal-dialog-centered'
    });

  }

  public toggleManager(id: number, event: any) {

    const team_id = this.teams[this.teamIndex].id;

    if (event.target.checked) {

      this.apiSrv.attachTeamManager(team_id, { manager_id: id })
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {

          this.teams[this.teamIndex] = res.data;

          this.alertSrv.toast({
            icon: 'success',
            message: res.message
          });
        
        }, err => {

          event.target.checked = false;
          
        });

    }

    else {

      this.apiSrv.detachTeamManager(team_id, id)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {

          this.teams[this.teamIndex] = res.data;

          this.alertSrv.toast({
            icon: 'success',
            message: res.message
          });
        
        }, err => {

          event.target.checked = true;

        });

    }

  }

  public openModal(template: TemplateRef<any>, index?: number) {

    this.teamIndex = index;

    this.modalRef = this.modalSrv.show(template, {
      class: 'modal-dialog-centered',
      keyboard: false,
      backdrop: 'static'
    });

  }

  public save() {

    if (!this.teamName) return;

    if (this.teamIndex === undefined) {

      this.apiSrv.createTeam({ name: this.teamName })
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {

          if (res.success) {

            this.teams.unshift(res.data);

            this.alertSrv.toast({
              icon: 'success',
              message: res.message
            });

            this.modalDismiss();

          }

        });

    }

    else {

      const id = this.teams[this.teamIndex].id;

      this.apiSrv.updateTeam(id, { name: this.teamName })
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {

          if (res.success) {

            this.teams[this.teamIndex] = res.data;

            this.alertSrv.toast({
              icon: 'success',
              message: res.message
            });

            this.modalDismiss();

          }

        });

    }

  }

  public delete(index: number) {

    const team = this.teams[index];

    this.alertSrv.show({
      icon: 'warning',
      message: `This will permanently delete the driver "${team.name}". Continue?`,
      onConfirm: () => {

        this.apiSrv.deleteTeam(team.id)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(res => {

            if (res.success) {

              this.teams = ArrayHelper.removeItem(this.teams, index);

              this.alertSrv.toast({
                icon: 'success',
                message: res.message
              });

            }

          });
      }
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

  private initManagers() {
    this.apiSrv.getAllManagers()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(res => {
        this.managers = res.data;
      });
  }

}
