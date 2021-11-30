import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: 'projects',
                loadChildren: () => import('../projects/projects.module').then(m => m.ProjectsModule)
            },
            {
                path: 'project',
                loadChildren: () => import('../project/project.module').then(m => m.ProjectModule)
            },
            {
                path: 'drivers',
                loadChildren: () => import('../drivers/drivers.module').then(m => m.DriversModule)
            },
            {
                path: 'notifications',
                loadChildren: () => import('../notifications/notifications.module').then(m => m.NotificationsModule)
            },
            {
                path: 'account',
                loadChildren: () => import('../account/account.module').then(m => m.AccountModule)
            },
            {
                path: 'customers',
                loadChildren: () => import('../customers/customers.module').then(m => m.CustomersModule)
            },
            {
                path: 'reports',
                loadChildren: () => import('../reports/reports.module').then( m => m.ReportsModule )
            },
              {
                path: '**',
                redirectTo: '/projects'
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule { }
