import { environment } from 'src/environment/environment';

const apiUrl = environment.api_url;
const frontUrl = environment.front_url;

export class Usuario {
  constructor(
    public email: string,
    public fullName: string,
    public password?: string,
    public google?: boolean,
    public roles?: string,
    public imagen?: string,
    public id?: string
  ) {}

  get imagenUrl() {
    if (this.imagen) {
      return `${apiUrl}/files/user/${this.imagen}`;
    } else {
      return `${apiUrl}/files/user/default.jpg`;
    }
  }
}
