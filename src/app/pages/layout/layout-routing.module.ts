import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from 'src/guards/admin.guard';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: 'home',
                loadChildren: () => import('../home/home.module').then(m => m.HomeModule)
            },
            {
                path: 'teams',
                loadChildren: () => import('../teams/teams.module').then(m => m.TeamsModule),
                canActivate: [AdminGuard]
            },
            {
                path: 'projects',
                loadChildren: () => import('../projects/projects.module').then(m => m.ProjectsModule)
            },
            {
                path: 'project/:id',
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
                path: 'managers',
                loadChildren: () => import('../managers/managers.module').then(m => m.ManagersModule),
                canActivate: [AdminGuard]
            },
            {
                path: 'customers',
                loadChildren: () => import('../customers/customers.module').then(m => m.CustomersModule)
            },
            {
                path: 'reports',
                loadChildren: () => import('../reports/reports.module').then(m => m.ReportsModule)
            },
            {
                path: 'deliveries',
                loadChildren: () => import('../deliveries/deliveries.module').then(m => m.DeliveriesModule)
            },
            {
                path: '**',
                redirectTo: '/home'
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule { }
