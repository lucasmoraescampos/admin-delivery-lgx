import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WhereIsMyOrderComponent } from './where-is-my-order.component';

const routes: Routes = [
  {
    path: '',
    component: WhereIsMyOrderComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WhereIsMyOrderRoutingModule {}