import { Dialog } from '@angular/cdk/dialog';
import { Component, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  merge,
  startWith,
  switchMap,
  of as observableOf,
} from 'rxjs';
import { ArchivoExcelInterface } from 'src/app/interfaces/excel.interface';
import {
  CampoTable,
  PdfTableInterface,
} from 'src/app/interfaces/pdf.interface';
import { FilterModel } from 'src/app/models/filter-model';
import { Plan } from 'src/app/models/plan.model';
import { ExcelService } from 'src/app/services/excel.service';
import { PdfService } from 'src/app/services/pdf.service';
import { PlanService } from 'src/app/services/plan.service';
import { Util } from 'src/app/shared/util';
import Swal from 'sweetalert2';
import { PlanesFormComponent } from './planes-form/planes-form.component';

@Component({
  selector: 'app-planes',
  templateUrl: './planes.component.html',
  styleUrls: ['./planes.component.css'],
})
export class PlanesComponent {
  displayedColumns: string[] = [
    'id',
    'nombreplan',
    'preciodia',
    'precioperiodo',
    'isActive',
    'accion',
  ];
  data: Plan[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  typeHeadFilter = new Subject<any[]>();
  typeHeadFilterFire = new Subject<string>();
  _filter: FilterModel = new FilterModel();
  _filterPage: any = '';
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 20, 30, 50, 100];
  flagBuscar: boolean = false;

  pageEvent!: PageEvent;

  flagEditar: boolean = false;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  constructor(
    private util: Util,
    private excelService: ExcelService,
    private pdfService: PdfService,
    private planService: PlanService,
    private dialog: Dialog
  ) {}

  ngOnInit(): void {
    this.getPage();
  }

  getPage() {
    this.paginator._intl.itemsPerPageLabel = 'Reg Por Pag Emp';
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.sort.active = 'nombreplan';

    this.typeHeadFilter
      .pipe(distinctUntilChanged(), debounceTime(1000))
      .subscribe((res) => {
        let value = res[0].value;
        let field = res[1];
        let operator = res[2];

        this._filterPage = this.util.NestJsonFilter(
          this._filter,
          value,
          field,
          operator
        );
        this.typeHeadFilterFire.next('');
      });

    merge(this.sort.sortChange, this.paginator.page, this.typeHeadFilterFire)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          this.pageSize =
            this.paginator.pageSize == undefined
              ? this.pageSize
              : this.paginator.pageSize;

          return this.planService.getPagination(
            this.paginator.pageIndex,
            this.pageSize,
            this.sort.direction,
            this.sort.active,
            this._filterPage
          );
        }),
        map((data) => {
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = data.meta.totalItems;
          return data.data;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          this.isRateLimitReached = true;
          return observableOf([]);
        })
      )
      .subscribe((data) => {
        this.data = <Plan[]>data;
      });
  }

  showBuscar() {
    this._filterPage = '';
    this.flagBuscar = !this.flagBuscar;
  }

  crearPlan() {
    const dialogRef = this.dialog.open(PlanesFormComponent, {
      minWidth: '500px',
      maxWidth: '50%',
    });

    dialogRef.closed.subscribe((plan: any) => {
      if (plan) {
        this.planService.crearPlan(plan).subscribe({
          next: () => {
            this.typeHeadFilterFire.next('');
            Swal.fire('Guardado', 'El plan se creó correctamente', 'success');
          },
          error: (error) => {
            Swal.fire('Error', 'Algo salió mal', 'error');
          },
        });
      }
    });
  }

  actualizar(plan: Plan) {
    const dialogRef = this.dialog.open(PlanesFormComponent, {
      minWidth: '500px',
      maxWidth: '50%',
      data: plan
    });

    dialogRef.closed.subscribe((plan: any) => {
      if (plan) {
        this.planService.actualizarPlan(plan).subscribe({
          next: () => {
            this.typeHeadFilterFire.next('');
            Swal.fire('Guardado', 'El plan se actualizó correctamente', 'success');
          },
          error: (error) => {
            Swal.fire('Error', 'Algo salió mal', 'error');
          },
        });
      }
    });
  }

  cambiarEstado(plan: Plan) {
    Swal.fire({
      title: '¿Cambiar estado?',
      text: `Esta a punto de cambiar el estado del plan: ${plan.nombreplan}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Si, cambiar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.planService.cambiarEstado(plan).subscribe((result) => {
          Swal.fire(
            'Cambiado!',
            `Estado del plan: ${plan.nombreplan} fue cambiado correctamente`,
            'success'
          );
          this.getPage();
        });
      }
    });

    return false;
  }

  eliminar(plan: Plan) {
    Swal.fire({
      title: '¿Eliminar plan?',
      text: `Esta a punto de eliminar el plan ${plan.nombreplan}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.planService.eliminarPlan(plan.id).subscribe((resp) => {
          Swal.fire('Eliminado', plan.nombreplan, 'success');
          this.getPage();
        });
      }
    });
  }

  exportToExcel() {
    this.planService
      .getPagination(
        this.paginator.pageIndex,
        1000,
        this.sort.direction,
        this.sort.active,
        this._filterPage
      )
      .subscribe((data) => {
        let dataToExcel: any[] = [];
        for (let row of data.data) {
          let dato = [
            row.id,
            row.nombreplan,
            row.preciodia,
            row.precioperiodo,
            row.isActive,
          ];
          dataToExcel.push(dato);
        }

        const archivoExcel: ArchivoExcelInterface = {
          nombre: 'planes',
          hojas: [
            {
              nombre: 'planes',
              cabeceraHoja: {
                logo: true,
                titulo: 'REPORTE DE PLANES',
                subtitulo: `Consultado a fecha: ${new Date().toISOString()}`,
              },
              cabecerasColumnas: [
                'ID',
                'NOMBRE DE PLAN',
                'PRECIO MES',
                'PRECIO PERIODO',
                'ESTADO',
              ],
              anchoColumnas: [20, 50, 30, 30, 20],
              alineacionColumnas: [
                {
                  horizontal: 'left',
                },
                {
                  horizontal: 'left',
                },
                {
                  horizontal: 'right',
                },
                {
                  horizontal: 'right',
                },
                {
                  horizontal: 'center',
                },
              ],
              dataColumnas: dataToExcel,
            },
          ],
        };
        this.excelService.dowloadExcel(archivoExcel);
      });
  }

  exportToPdf() {
    this.planService
      .getPagination(
        this.paginator.pageIndex,
        1000,
        this.sort.direction,
        this.sort.active,
        this._filterPage
      )
      .subscribe((data) => {
        let dataToTable: any[] = [];
        for (let row of data.data) {
          let dato: CampoTable[] = [
            {
              value: row.id,
              alignment: 'center',
            },
            {
              value: row.nombreplan,
              alignment: 'left',
            },
            {
              value: row.preciodia,
              alignment: 'right',
            },
            {
              value: row.precioperiodo,
              alignment: 'right',
            },
            {
              value: row.isActive,
              alignment: 'center',
            },
          ];
          dataToTable.push(dato);
        }
        const archivoPdf: PdfTableInterface = {
          layout: '', //'lightHorizontalLines',
          table: {
            headerRow: 1,
            widths: [50, '*', 50, 50, 50],
            body: {
              headers: [
                'ID',
                'NOMBRE DE PLAN',
                'PRECIO DIA',
                'PRECIO MES',
                'ESTADO',
              ],
              rows: dataToTable,
            },
          },
        };
        this.pdfService.exportToPdf(
          archivoPdf,
          'reporte_planes',
          'REPORTE DE PLANES'
        );
      });
  }
}
