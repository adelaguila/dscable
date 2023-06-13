import { Injectable } from '@angular/core';
import { environment } from 'src/environment/environment';
import { Plan } from '../models/plan.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  public plan!: Plan;

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
      .get<any[]>(`${base_url}/planes?${filters}`, {
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

  crearPlan(plan: Plan) {
    return this.http.post(
      `${base_url}/planes`,
      plan,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }
    );
  }

  actualizarPlan(plan: Plan) {
    return this.http.patch(
      `${base_url}/planes/${plan.id}`,
      plan,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }
    );
  }

  eliminarPlan(id:number){
    return this.http.delete(
      `${base_url}/planes/${id}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }
    );
  }

  cambiarEstado(plan: Plan){
    return this.http.patch(`${base_url}/planes/cambiar-estado/${plan.id}`, '', {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }
}
