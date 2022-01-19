import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { SofboxModule } from 'src/app/components/sofbox/sofbox.module';
import { NgxViewerModule } from 'ngx-viewer';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SofboxModule,
    NgxViewerModule
  ]
})
export class HomeModule { }
