import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TercerosComponent } from './terceros/terceros.component';
import { PagesComponent } from './pages.component';

const routes: Routes = [
  {
    path: 'admin',
    component: PagesComponent,
    children: [
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: 'terceros',
        component: TercerosComponent,
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
