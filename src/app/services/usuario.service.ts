import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegisterForm, LoginForm } from '../interfaces';
import { environment } from 'src/environment/environment';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { Router } from '@angular/router';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  constructor(private http: HttpClient, private router: Router) {}

  logout(){
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }

  validarToken(): Observable<boolean> {
    const token = localStorage.getItem('token') || '';

    return this.http.get(`${base_url}/auth/check-status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).pipe(
      tap((resp: any) =>{
        localStorage.setItem('token', resp.token);
      }),
      map( resp => true),
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

  loginForm(formData: LoginForm) {
    return this.http.post(`${base_url}/auth/login`, formData).pipe(
      tap((resp: any) => {
        localStorage.setItem('token', resp.token);
      })
    );
  }
}
