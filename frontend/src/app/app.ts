import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagosService, Pago, PagosResponse, CreatePago } from './services/pagos.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly pagosService = inject(PagosService);

  protected readonly title = signal('Gestión de Pagos');
  protected readonly Math = Math;

  pagos = signal<Pago[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Paginación
  currentPage = signal(1);
  limit = signal(10);
  totalPages = signal(0);
  total = signal(0);

  // Filtros
  fechaDesde = signal('');
  fechaHasta = signal('');
  empresaPagadora = signal('');

  // Formulario
  showForm = signal(false);
  formLoading = signal(false);
  formError = signal<string | null>(null);
  formSuccess = signal<string | null>(null);

  // Campos del formulario
  formPoliza = signal('');
  formCuota = signal('');
  formEmpresaPagadora = signal('');
  formMedioPago = signal('');
  formBanco = signal('');
  formNumeroOperacion = signal('');
  formFechaPago = signal('');
  formMoneda = signal('SOLES');
  formImporte = signal(0);
  formTipoCambio = signal(1);
  formEquivalenteSoles = signal(0);

  ngOnInit() {
    this.loadPagos();
  }

  loadPagos() {
    this.loading.set(true);
    this.error.set(null);

    this.pagosService.getPagos(
      this.currentPage(),
      this.limit(),
      this.fechaDesde() || undefined,
      this.fechaHasta() || undefined,
      this.empresaPagadora() || undefined
    ).subscribe({
      next: (response: PagosResponse) => {
        this.pagos.set(response.data);
        this.total.set(response.meta.total);
        this.totalPages.set(response.meta.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los pagos');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadPagos();
    }
  }

  changeLimit(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.limit.set(parseInt(select.value));
    this.currentPage.set(1);
    this.loadPagos();
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadPagos();
  }

  clearFilters() {
    this.fechaDesde.set('');
    this.fechaHasta.set('');
    this.empresaPagadora.set('');
    this.currentPage.set(1);
    this.loadPagos();
  }

  toggleForm() {
    this.showForm.update(v => !v);
    if (this.showForm()) {
      this.resetForm();
    }
  }

  resetForm() {
    this.formPoliza.set('');
    this.formCuota.set('');
    this.formEmpresaPagadora.set('');
    this.formMedioPago.set('');
    this.formBanco.set('');
    this.formNumeroOperacion.set('');
    this.formFechaPago.set('');
    this.formMoneda.set('SOLES');
    this.formImporte.set(0);
    this.formTipoCambio.set(1);
    this.formEquivalenteSoles.set(0);
    this.formError.set(null);
    this.formSuccess.set(null);
  }

  calculateEquivalente() {
    const equivalente = this.formImporte() * this.formTipoCambio();
    this.formEquivalenteSoles.set(equivalente);
  }

  submitForm() {
    this.formLoading.set(true);
    this.formError.set(null);
    this.formSuccess.set(null);

    const newPago: CreatePago = {
      poliza: this.formPoliza(),
      cuota: this.formCuota(),
      empresa_pagadora: this.formEmpresaPagadora(),
      medio_pago: this.formMedioPago(),
      banco: this.formBanco(),
      numero_operacion: this.formNumeroOperacion(),
      fecha_pago: this.formFechaPago(),
      moneda: this.formMoneda(),
      importe: this.formImporte(),
      tipo_cambio: this.formTipoCambio(),
      equivalente_soles: this.formEquivalenteSoles()
    };

    this.pagosService.createPago(newPago).subscribe({
      next: () => {
        this.formSuccess.set('Pago registrado exitosamente');
        this.formLoading.set(false);
        this.resetForm();
        this.loadPagos();
        setTimeout(() => {
          this.showForm.set(false);
        }, 2000);
      },
      error: (err) => {
        this.formError.set(err.error?.message || 'Error al crear el pago');
        this.formLoading.set(false);
        console.error(err);
      }
    });
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(5, this.totalPages());
    let startPage = Math.max(1, this.currentPage() - 2);
    let endPage = Math.min(this.totalPages(), startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
