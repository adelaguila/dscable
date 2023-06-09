import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ComponentsModule } from '../components/components.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { TercerosComponent } from './terceros/terceros.component';
import { PagesComponent } from './pages.component';
import { ViasComponent } from './vias/vias.component';
import { PlanesComponent } from './planes/planes.component';
import { PerfilComponent } from './perfil/perfil.component';
import { UsuariosComponent } from './usuarios/usuarios.component';



@NgModule({
  declarations: [
    DashboardComponent,
    TercerosComponent,
    PagesComponent,
    ViasComponent,
    PlanesComponent,
    PerfilComponent,
    UsuariosComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    ComponentsModule
  ],
  exports: [
    DashboardComponent,
    TercerosComponent,
    PagesComponent
  ]
})
export class PagesModule { }

