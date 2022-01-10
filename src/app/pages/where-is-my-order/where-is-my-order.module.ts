import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WhereIsMyOrderComponent } from './where-is-my-order.component';
import { WhereIsMyOrderRoutingModule } from './where-is-my-order-routing.module';

@NgModule({
  declarations: [WhereIsMyOrderComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    WhereIsMyOrderRoutingModule
  ]
})
export class WhereIsMyOrderModule { }
