import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TercerosComponent } from './terceros/terceros.component';
import { PagesComponent } from './pages.component';
import { PlanesComponent } from './planes/planes.component';
import { ViasComponent } from './vias/vias.component';
import { AuthGuard } from '../guards/auth.guard';
import { PerfilComponent } from './perfil/perfil.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { CajasnapComponent } from './cajasnap/cajasnap.component';

const routes: Routes = [
  {
    path: 'admin',
    component: PagesComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: DashboardComponent, data: { titulo: 'Dashboard'}
      },
      {
        path: 'terceros',
        component: TercerosComponent, data: { titulo: 'Terceros'}
      },
      {
        path: 'cajasnap',
        component: CajasnapComponent, data: { titulo: 'Cajas Nap'}
      },
      {
        path: 'planes',
        component: PlanesComponent, data: { titulo: 'Planes'}
      },
      {
        path: 'vias',
        component: ViasComponent, data: { titulo: 'Vias'}
      },
      {
        path: 'perfil',
        component: PerfilComponent, data: { titulo: 'Perfil'}
      },
      {
        path: 'usuarios',
        component: UsuariosComponent, data: { titulo: 'Usuarios'}
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
