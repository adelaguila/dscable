import { Injectable } from '@angular/core';
import { Cajanap } from '../models/cajanap.model';
import { environment } from 'src/environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class CajanapService {

  public cajanap!: Cajanap;

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
      .get<any[]>(`${base_url}/cajanap?${filters}`, {
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

  crearCajanap(cajanap: Cajanap) {
    return this.http.post(
      `${base_url}/cajanap`,
      cajanap,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }
    );
  }

  actualizarCajanap(cajanap: Cajanap) {
    return this.http.patch(
      `${base_url}/cajanap/${cajanap.id}`,
      cajanap,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }
    );
  }

  eliminarCajanap(id:number){
    return this.http.delete(
      `${base_url}/cajanap/${id}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }
    );
  }
}
