import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Plan } from 'src/app/models/plan.model';

@Component({
  selector: 'app-planes-form',
  templateUrl: './planes-form.component.html',
  styleUrls: ['./planes-form.component.css'],
})
export class PlanesFormComponent implements OnInit {
  plan: Plan = new Plan();
  titulo = '';

  planForm!: FormGroup;

  constructor(
    private dialogRef: DialogRef<any>,
    @Inject(DIALOG_DATA) public data: any
  ) {
    if (data) {
      this.titulo = 'EDITAR PLAN';
      this.plan = data;
    }else{
      this.titulo = 'AGREGAR PLAN';
    }
  }
  ngOnInit(): void {
    this.cargarFormulario();
  }

  cargarFormulario() {
    this.planForm = new FormGroup({
      id: new FormControl(this.plan.id),
      nombreplan: new FormControl(this.plan.nombreplan, Validators.required),
      preciodia: new FormControl(this.plan.preciodia, Validators.required),
      precioperiodo: new FormControl(this.plan.precioperiodo, Validators.required),
    });
  }

  guardar(){
    this.plan = this.planForm.value; // {id:1, nombre:"", segundo_nombre: "", ...}
    this.dialogRef.close(this.plan);
  }

  close() {
    this.dialogRef.close();
  }

}
