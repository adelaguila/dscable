import { Injectable } from '@angular/core';
import { Via } from '../models/via.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environment/environment';
import { Observable, catchError, map, throwError } from 'rxjs';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root',
})
export class ViaService {
  public via!: Via;

  constructor(private http: HttpClient, private router: Router) {}

  get token(): string {
    return localStorage.getItem('token') || '';
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
      .get<any[]>(`${base_url}/vias?${filters}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        params,
      })
      .pipe(
        catchError((e) => {
          console.error(e.error.mensaje);
          return throwError(e);
        })
      );
  }

  crearVia(nombrevia: string) {
    return this.http.post(
      `${base_url}/vias`,
      { nombrevia },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }
    );
  }

  actualizarVia(id:number, nombrevia: string){
    return this.http.patch(
      `${base_url}/vias/${id}`,
      { nombrevia },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }
    );
  }

  eliminarVia(id:number){
    return this.http.delete(
      `${base_url}/vias/${id}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }
    );
  }
}
