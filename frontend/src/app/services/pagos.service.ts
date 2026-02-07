import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Pago {
  id: number;
  cuota: string;
  empresa_pagadora: string;
  medio_pago: string;
  banco: string;
  numero_operacion: string;
  fecha_pago: Date;
  importe: number;
  tipo_cambio: number;
  equivalente_soles: number;
  created_at: Date;
  poliza: {
    id: number;
    numero_poliza: string;
  };
}

export interface PagosResponse {
  data: Pago[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PagosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/pagos';

  getPagos(
    page: number = 1,
    limit: number = 10,
    fechaDesde?: string,
    fechaHasta?: string,
    empresaPagadora?: string
  ): Observable<PagosResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (fechaDesde) {
      params = params.set('fechaDesde', fechaDesde);
    }
    if (fechaHasta) {
      params = params.set('fechaHasta', fechaHasta);
    }
    if (empresaPagadora) {
      params = params.set('empresaPagadora', empresaPagadora);
    }

    return this.http.get<PagosResponse>(this.apiUrl, { params });
  }
}
