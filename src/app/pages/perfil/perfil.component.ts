import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Usuario } from 'src/app/models/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FileUploadService } from '../../services/file-upload.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  perfilForm!: FormGroup;
  usuario!: Usuario;
  imagenSubir!: File;
  imgTemp: any;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private fileUploadService: FileUploadService
  ) {
    this.usuario = usuarioService.usuario;
  }
  ngOnInit(): void {
    this.perfilForm = this.fb.group({
      fullName: [this.usuario.fullName, Validators.required],
      email: [this.usuario.email, [Validators.required, Validators.email]],
    });
  }

  actualizarPerfil() {
    this.usuarioService.actualizarPerfil(this.perfilForm.value).subscribe(
      (resp: any) => {
        if (resp.status === 'error') {
          Swal.fire('Atención', resp.message, 'info');
        } else {
          const { fullName, email } = this.perfilForm.value;
          this.usuario.fullName = fullName;
          this.usuario.email = email;
          Swal.fire('Guardado', 'Datos guardados con éxito', 'success');
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  cambiarImagen(file: File) {
    this.imagenSubir = file;
    if (!file) {
      return (this.imgTemp = null);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      this.imgTemp = reader.result;
    };
    return false;
  }

  subirImagen() {
    this.fileUploadService
      .actualizarFotoPerfil(this.imagenSubir)
      .then(img => {
        if(img.statusCode && img.statusCode === 400){
          Swal.fire('Error', img.message, 'error');
        }else{
          this.usuario.imagen = img
          Swal.fire('Guardado', 'Imagen subida con éxito', 'success');
        }
      }).catch(error => {
        console.error(error);
        Swal.fire('Error', error.message, 'error');
      });
  }
}
