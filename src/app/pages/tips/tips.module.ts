import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TipsComponent } from './tips.component';
import { TipsRoutingModule } from './teams-routing.module';
import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { BrMaskerModule } from 'br-mask';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [TipsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbRatingModule,
    BrMaskerModule,
    TipsRoutingModule
  ]
})
export class TipsModule { }
