import { Component } from '@angular/core';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { ModalImagenService } from 'src/app/services/modal-imagen.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-imagen',
  templateUrl: './modal-imagen.component.html',
  styleUrls: ['./modal-imagen.component.css'],
})
export class ModalImagenComponent {
  imagenSubir!: File;
  imgTemp: any;

  constructor(
    public modalImagenService: ModalImagenService,
    public fileUploadService: FileUploadService,
  ){}

  cerrarModal() {
    this.imgTemp = null;
    this.modalImagenService.cerrarModal();
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
    const id = this.modalImagenService.id;
    this.fileUploadService
      .cambiarFotoUsuario(this.imagenSubir, id)
      .then(img => {
        if(img.statusCode && img.statusCode === 400){
          Swal.fire('Error', img.message, 'error');
        }else{
          Swal.fire('Guardado', 'Imagen subida con éxito', 'success');

          this.modalImagenService.nuevaImagen.emit(img);

          this.cerrarModal();
        }
      }).catch(error => {
        console.error(error);
        Swal.fire('Error', error.message, 'error');
      });
  }
}
