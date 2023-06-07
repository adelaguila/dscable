import { Injectable } from '@angular/core';
import { environment } from 'src/environment/environment';

const apiUrl = environment.api_url;

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  constructor() {}

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  async actualizarFotoPerfil(archivo: File) {
    try {
      const url = `${apiUrl}/files/user`;
      const formData = new FormData();
      formData.append('file', archivo);

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        body: formData,
      });

      const data = await resp.json();
      if(data.userActualizado){
        return data.userActualizado.image;
      }else{
        return data;
      }

    } catch (error) {
      console.log('Servicio ',error);
      return false;
    }
  }
}
