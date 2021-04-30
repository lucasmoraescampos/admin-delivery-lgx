import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent implements OnInit, OnDestroy {

  public loading: boolean;

  private unsubscribe = new Subject();

  constructor(
    private router: Router,
    private loadingSrv: LoadingService
  ) { }

  title = 'sofbox-dashboard-angular';

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });

    this.loadingSrv.status.pipe(takeUntil(this.unsubscribe))
      .subscribe(status => {
        setTimeout(() => this.loading = status);
      });

  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
