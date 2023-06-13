import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Cajanap } from 'src/app/models/cajanap.model';

@Component({
  selector: 'app-cajasnap-form',
  templateUrl: './cajasnap-form.component.html',
  styleUrls: ['./cajasnap-form.component.css']
})
export class CajasnapFormComponent {

  cajanap: Cajanap = new Cajanap();
  titulo = '';

  cajanapForm!: FormGroup;

  constructor(
    private dialogRef: DialogRef<any>,
    @Inject(DIALOG_DATA) public data: any
  ) {
    if (data) {
      this.titulo = 'EDITAR CAJANAP';
      this.cajanap = data;
    }else{
      this.titulo = 'AGREGAR CAJANAP';
    }
  }
  ngOnInit(): void {
    this.cargarFormulario();
  }

  cargarFormulario() {
    this.cajanapForm = new FormGroup({
      id: new FormControl(this.cajanap.id),
      nombrecajanap: new FormControl(this.cajanap.nombrecajanap, Validators.required),
      ubicacion: new FormControl(this.cajanap.ubicacion),
      referencia: new FormControl(this.cajanap.referencia),
      puertos: new FormControl(this.cajanap.puertos, Validators.required),
    });
  }

  guardar(){
    this.cajanap = this.cajanapForm.value; // {id:1, nombre:"", segundo_nombre: "", ...}
    this.dialogRef.close(this.cajanap);
  }

  close() {
    this.dialogRef.close();
  }

}
