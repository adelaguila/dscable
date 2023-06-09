import { EventEmitter, Injectable } from '@angular/core';
import { environment } from 'src/environment/environment';

const apiUrl = environment.api_url;

@Injectable({
  providedIn: 'root'
})
export class ModalImagenService {
  private _ocultarModal: boolean = true;
  tipo?: string;
  id: any;
  img?: string;

  nuevaImagen: EventEmitter<string> = new EventEmitter<string>();

  get ocultarModal(){
    return this._ocultarModal;
  }

  abrirModal(
    tipo: 'usuarios' | 'abonados',
    id: any,
    img: string = ''
  ){
    this._ocultarModal = false;
    this.tipo = tipo;
    this.id = id;
    this.img = img;
    // if (img.length > 3) {
    //   this.img = `${apiUrl}/files/user/${img}`;
    // } else {
    //   this.img = `${apiUrl}/files/user/default.jpg`;
    // }
  }

  cerrarModal(){
    this._ocultarModal = true;
  }

  constructor() { }
}
