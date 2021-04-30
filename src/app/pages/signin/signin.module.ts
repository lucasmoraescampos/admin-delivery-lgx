import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SigninRoutingModule } from './signin-routing.module';
import { SigninComponent } from './signin.component';
import { SofboxModule } from 'src/app/components/sofbox/sofbox.module';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [SigninComponent],
  imports: [
    CommonModule,
    SigninRoutingModule,
    SofboxModule,
    CarouselModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SigninModule { }
