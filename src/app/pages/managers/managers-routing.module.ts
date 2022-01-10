import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManagersComponent } from './managers.component';

const routes: Routes = [
  {
    path: '',
    component: ManagersComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManagersRoutingModule {}