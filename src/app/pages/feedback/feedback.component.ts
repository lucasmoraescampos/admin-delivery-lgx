import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UtilsHelper } from 'src/app/helpers/utils.helper';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {

  public stop: any;

  public formGroup: FormGroup;

  private unsubscribe$ = new Subject();

  constructor(
    private apiSrv: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {

    this.formGroup = this.formBuilder.group({
      stop_id: [null, Validators.required],
      evaluation: [0, Validators.required],
      note: ['']
    });

    this.loadStop();

  }

  public send() {
    this.apiSrv.sendFeedback(this.formGroup.value)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        if (res.success) {
          this.stop.feedback = res.data;
        }
      });
  }

  private loadStop() {

    const order_id = this.route.snapshot.paramMap.get('order_id');

    const phone = this.route.snapshot.paramMap.get('phone');

    this.apiSrv.getOrder({ order_id, phone })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {

        if (res.data.status == 2) {

          this.stop = res.data;

          this.stop.arrived_at = formatDate(this.stop.timestamp, 'MMM d, y — h:mm a', 'en-US', UtilsHelper.utcOffsetString(this.stop.utc_offset));
      
          this.formGroup.patchValue({
            stop_id: this.stop.id,
            evaluation: this.stop.feedback?.evaluation,
            note: this.stop.feedback?.note
          });

        }

        else {
          this.router.navigateByUrl('/home');
        }

      }, () => {
        this.router.navigateByUrl('/home');
      });

  }

}
