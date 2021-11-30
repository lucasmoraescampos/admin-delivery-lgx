import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { WhereIsMyOrderComponent } from './where-is-my-order.component';

const routes: Routes = [
  {
    path: '',
    component: WhereIsMyOrderComponent
  }
];

@NgModule({
  declarations: [WhereIsMyOrderComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule
  ]
})
export class WhereIsMyOrderModule { }
