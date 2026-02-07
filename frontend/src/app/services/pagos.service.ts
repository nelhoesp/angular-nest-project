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
  moneda: string;
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

export interface CreatePago {
  cuota: string;
  empresa_pagadora: string;
  medio_pago: string;
  banco: string;
  numero_operacion: string;
  fecha_pago: string;
  moneda: string;
  importe: number;
  tipo_cambio: number;
  equivalente_soles: number;
  poliza: string;
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

  createPago(pago: CreatePago): Observable<Pago> {
    return this.http.post<Pago>(this.apiUrl, pago);
  }

  updatePago(id: number, pago: CreatePago): Observable<Pago> {
    return this.http.patch<Pago>(`${this.apiUrl}/${id}`, pago);
  }

  deletePago(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload-excel`, formData);
  }
}
