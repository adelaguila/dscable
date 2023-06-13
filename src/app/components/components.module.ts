import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DialogModule } from '@angular/cdk/dialog';

import { ModalImagenComponent } from './modal-imagen/modal-imagen.component';
import { DialogComponent } from './dialog/dialog.component';

@NgModule({
  declarations: [ModalImagenComponent, DialogComponent],
  imports: [CommonModule, DialogModule],
  exports: [ModalImagenComponent, DialogComponent],
})
export class ComponentsModule {}
