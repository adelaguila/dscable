import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegisterForm, LoginForm } from '../interfaces';
import { environment } from 'src/environment/environment';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario.model';
import { Links, Meta } from '../interfaces/getall-paginate.interface';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  public usuario!: Usuario;

  constructor(private http: HttpClient, private router: Router) {}

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }

  validarToken(): Observable<boolean> {
    return this.http
      .get(`${base_url}/auth/check-status`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(
        map((resp: any) => {
          const { id, email, fullName, isActive, image, roles, google } = resp.usuario;
          this.usuario = new Usuario(
            email,
            fullName,
            isActive,
            '',
            google,
            roles,
            image,
            id
          );
          localStorage.setItem('token', resp.token);
          return true;
        }),
        catchError((error) => of(false))
      );
  }

  registrarUsuario(formData: RegisterForm) {
    return this.http.post(`${base_url}/auth/register`, formData).pipe(
      tap((resp: any) => {
        localStorage.setItem('token', resp.token);
      })
    );
  }

  actualizarPerfil(data: { email: string; fullName: string }) {
    return this.http.patch(`${base_url}/auth/`, data, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  loginForm(formData: LoginForm) {
    return this.http.post(`${base_url}/auth/login`, formData).pipe(
      tap((resp: any) => {
        localStorage.setItem('token', resp.token);
      })
    );
  }

  getPagination(
    pagenumber: number,
    rows: number,
    sortdireccion: string,
    sortcolumn: string,
    filters: any
  ): Observable<any> {
    const params = new HttpParams()
      .set('page', pagenumber + 1)
      .set('limit', rows)
      .set('sortBy', `${sortcolumn}:${sortdireccion.toUpperCase()}`);

    return this.http
      .get<{ data: Usuario[]; meta: Meta; links: Links }>(
        `${base_url}/auth/usuarios?${filters}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          params,
        }
      )
      .pipe(
        map((response) => {
          let usuarios = response.data as Usuario[];
          return {
            data: usuarios.map((usuario) => {
              if (usuario.image == null) {
                usuario.image = `${base_url}/files/user/default.jpg`;
              } else {
                usuario.image = `${base_url}/files/user/${usuario.image}`;
              }
              return usuario;
            }),
            meta: response.meta,
            links: response.links,
          };
        }),
        catchError((e) => {
          console.error(e.error.mensaje);
          return throwError(e);
        })
      );
  }

  cambiarEstado(usuario: Usuario){
    return this.http.patch(`${base_url}/auth/cambiar-estado/${usuario.id}`, '', {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  cambiarRole(usuario: Usuario) {
    let id = usuario.id;
    delete usuario.id;

    return this.http.patch(`${base_url}/auth/cambiar-role/${id}`, usuario, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }
}
