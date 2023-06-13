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
import { Cajanap } from 'src/app/models/cajanap.model';
import { FilterModel } from 'src/app/models/filter-model';
import { CajanapService } from 'src/app/services/cajanap.service';
import { ExcelService } from 'src/app/services/excel.service';
import { PdfService } from 'src/app/services/pdf.service';
import { Util } from 'src/app/shared/util';
import { CajasnapFormComponent } from './cajasnap-form/cajasnap-form.component';
import Swal from 'sweetalert2';
import { ArchivoExcelInterface } from 'src/app/interfaces/excel.interface';
import {
  CampoTable,
  PdfTableInterface,
} from 'src/app/interfaces/pdf.interface';

@Component({
  selector: 'app-cajasnap',
  templateUrl: './cajasnap.component.html',
  styleUrls: ['./cajasnap.component.css'],
})
export class CajasnapComponent {
  displayedColumns: string[] = [
    'id',
    'nombrecajanap',
    'ubicacion',
    'referencia',
    'puertos',
    'accion',
  ];
  data: Cajanap[] = [];

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
    private cajanapService: CajanapService,
    private dialog: Dialog
  ) {}

  ngOnInit(): void {
    this.getPage();
  }

  getPage() {
    this.paginator._intl.itemsPerPageLabel = 'Reg Por Pag Emp';
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.sort.active = 'nombrecajanap';

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

          return this.cajanapService.getPagination(
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
          this.isRateLimitReached = true;
          return observableOf([]);
        })
      )
      .subscribe((data) => {
        this.data = <Cajanap[]>data;
      });
  }

  showBuscar() {
    this._filterPage = '';
    this.flagBuscar = !this.flagBuscar;
  }

  crearCajanap() {
    const dialogRef = this.dialog.open(CajasnapFormComponent, {
      minWidth: '500px',
      maxWidth: '50%',
    });

    dialogRef.closed.subscribe((cajanap: any) => {
      if (cajanap) {
        this.cajanapService.crearCajanap(cajanap).subscribe({
          next: () => {
            this.typeHeadFilterFire.next('');
            Swal.fire(
              'Guardado',
              'La caja nap se creó correctamente',
              'success'
            );
          },
          error: (error) => {
            Swal.fire('Error', 'Algo salió mal', 'error');
          },
        });
      }
    });
  }

  actualizar(cajanap: Cajanap) {
    const dialogRef = this.dialog.open(CajasnapFormComponent, {
      minWidth: '500px',
      maxWidth: '50%',
      data: cajanap,
    });

    dialogRef.closed.subscribe((cajanap: any) => {
      if (cajanap) {
        this.cajanapService.actualizarCajanap(cajanap).subscribe({
          next: () => {
            this.typeHeadFilterFire.next('');
            Swal.fire(
              'Guardado',
              'La caja nap se actualizó correctamente',
              'success'
            );
          },
          error: (error) => {
            Swal.fire('Error', 'Algo salió mal', 'error');
          },
        });
      }
    });
  }

  eliminar(cajanap: Cajanap) {
    Swal.fire({
      title: '¿Eliminar caja nap?',
      text: `Esta a punto de eliminar la caja nap ${cajanap.nombrecajanap}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cajanapService.eliminarCajanap(cajanap.id).subscribe((resp) => {
          Swal.fire('Eliminado', cajanap.nombrecajanap, 'success');
          this.getPage();
        });
      }
    });
  }

  exportToExcel() {
    this.cajanapService
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
            row.nombrecajanap,
            row.ubicacion,
            row.referencia,
            row.puertos,
          ];
          dataToExcel.push(dato);
        }

        const archivoExcel: ArchivoExcelInterface = {
          nombre: 'cajasnap',
          hojas: [
            {
              nombre: 'cajasnap',
              cabeceraHoja: {
                logo: true,
                titulo: 'REPORTE DE CAJAS NAP',
                subtitulo: `Consultado a fecha: ${new Date().toISOString()}`,
              },
              cabecerasColumnas: [
                'ID',
                'NOMBRE DE CAJA NAP',
                'UBICACION',
                'REFERENCIA',
                'PUERTOS',
              ],
              anchoColumnas: [20, 50, 50, 50, 30],
              alineacionColumnas: [
                {
                  horizontal: 'left',
                },
                {
                  horizontal: 'left',
                },
                {
                  horizontal: 'left',
                },
                {
                  horizontal: 'left',
                },
                {
                  horizontal: 'right',
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
    this.cajanapService
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
              value: row.nombrecajanap,
              alignment: 'left',
            },
            {
              value: row.ubicacion,
              alignment: 'left',
            },
            {
              value: row.referencia,
              alignment: 'left',
            },
            {
              value: row.puertos,
              alignment: 'right',
            },
          ];
          dataToTable.push(dato);
        }
        const archivoPdf: PdfTableInterface = {
          layout: '', //'lightHorizontalLines',
          table: {
            headerRow: 1,
            widths: [50, '*', '*', '*', 50],
            body: {
              headers: ['ID', 'NOMBRE DE PLAN', 'UBICACION', 'REFERENCIA', 'PUERTOS'],
              rows: dataToTable,
            },
          },
        };
        this.pdfService.exportToPdf(
          archivoPdf,
          'reporte_cajasnap',
          'REPORTE DE CAJAS NAP'
        );
      });
  }
}
