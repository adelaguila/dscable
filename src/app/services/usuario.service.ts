import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegisterForm, LoginForm } from '../interfaces';
import { environment } from 'src/environment/environment';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario.model';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  public usuario!: Usuario;

  constructor(private http: HttpClient, private router: Router) {}

  get token(): string{
    return localStorage.getItem('token') || '';
  }

  logout(){
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }

  validarToken(): Observable<boolean> {
    return this.http.get(`${base_url}/auth/check-status`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    }).pipe(
      map((resp: any) =>{
        const {id, email, fullName, image, roles, google} = resp.usuario;
        this.usuario = new Usuario(email, fullName, '', google, roles, image, id );
        localStorage.setItem('token', resp.token);
        return true;
      }),
      catchError(error => of(false))
    )
  }

  registrarUsuario(formData: RegisterForm) {
    return this.http.post(`${base_url}/auth/register`, formData).pipe(
      tap((resp: any) => {
        localStorage.setItem('token', resp.token);
      })
    );
  }

  actualizarPerfil(data: {email: string, fullName: string}){
    return this.http.patch(`${base_url}/auth/`, data, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })
  }

  loginForm(formData: LoginForm) {
    return this.http.post(`${base_url}/auth/login`, formData).pipe(
      tap((resp: any) => {
        localStorage.setItem('token', resp.token);
      })
    );
  }
}
