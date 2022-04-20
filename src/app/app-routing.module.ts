import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { AuthGuard } from 'src/guards/auth.guard';

const routes: Routes = [
  {
    path: 'signin',
    loadChildren: () => import('./pages/signin/signin.module').then(m => m.SigninModule)
  },
  {
    path: 'where-is-my-order',
    loadChildren: () => import('./pages/where-is-my-order/where-is-my-order.module').then(m => m.WhereIsMyOrderModule)
  },
  {
    path: 'wimo/:id/:phone',
    loadChildren: () => import('./pages/where-is-my-order/where-is-my-order.module').then(m => m.WhereIsMyOrderModule)
  },
  {
    path: 'tips/:id/:phone',
    loadChildren: () => import('./pages/tips/tips.module').then(m => m.TipsModule)
  },
  // {
  //   path: 'feedback/',
  //   loadChildren: () => import('./pages/feedback/feedback.module').then(m => m.FeedbackModule)
  // },
  {
    path: '',
    loadChildren: () => import('./pages/layout/layout.module').then(m => m.LayoutModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
