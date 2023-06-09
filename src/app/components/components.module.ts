import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModalImagenComponent } from './modal-imagen/modal-imagen.component';

@NgModule({
  declarations: [
    ModalImagenComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    ModalImagenComponent
  ]
})
export class ComponentsModule { }
