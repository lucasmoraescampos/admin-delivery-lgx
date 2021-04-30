import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout.component';
import { SofboxModule } from 'src/app/components/sofbox/sofbox.module';
import { LayoutRoutingModule } from './layout-routing.module';



@NgModule({
  declarations: [LayoutComponent],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    SofboxModule
  ]
})
export class LayoutModule { }
