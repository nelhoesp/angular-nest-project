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
  pageInput = signal('');

  // Filtros
  fechaDesde = signal('');
  fechaHasta = signal('');
  empresaPagadora = signal('');

  // Formulario
  showForm = signal(false);
  formLoading = signal(false);
  formError = signal<string | null>(null);
  formSuccess = signal<string | null>(null);
  editingId = signal<number | null>(null);

  // Excel Upload
  uploadingExcel = signal(false);
  uploadSuccess = signal<string | null>(null);
  uploadError = signal<string | null>(null);

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

  goToSpecificPage() {
    const pageNumber = parseInt(this.pageInput());
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= this.totalPages()) {
      this.goToPage(pageNumber);
      this.pageInput.set('');
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadExcelFile(file);
      input.value = ''; // Reset input
    }
  }

  uploadExcelFile(file: File) {
    this.uploadingExcel.set(true);
    this.uploadError.set(null);
    this.uploadSuccess.set(null);

    this.pagosService.uploadExcel(file).subscribe({
      next: (response) => {
        this.uploadSuccess.set(`Excel importado exitosamente: ${response.created} registros creados`);
        this.uploadingExcel.set(false);
        this.loadPagos();
        setTimeout(() => {
          this.uploadSuccess.set(null);
        }, 5000);
      },
      error: (err) => {
        this.uploadError.set(err.error?.message || 'Error al importar el archivo Excel');
        this.uploadingExcel.set(false);
        console.error(err);
      }
    });
  }

  triggerFileInput() {
    const fileInput = document.getElementById('excelFileInput') as HTMLInputElement;
    fileInput?.click();
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

  editPago(pago: Pago) {
    this.editingId.set(pago.id);
    this.formPoliza.set(pago.poliza.numero_poliza);
    this.formCuota.set(pago.cuota);
    this.formEmpresaPagadora.set(pago.empresa_pagadora);
    this.formMedioPago.set(pago.medio_pago);
    this.formBanco.set(pago.banco);
    this.formNumeroOperacion.set(pago.numero_operacion);
    this.formFechaPago.set(new Date(pago.fecha_pago).toISOString().split('T')[0]);
    this.formMoneda.set(pago.moneda);
    this.formImporte.set(pago.importe);
    this.formTipoCambio.set(pago.tipo_cambio);
    this.formEquivalenteSoles.set(pago.equivalente_soles);
    this.showForm.set(true);
    this.formError.set(null);
    this.formSuccess.set(null);
  }

  deletePago(id: number) {
    if (!confirm('¿Está seguro de eliminar este pago?')) {
      return;
    }

    this.pagosService.deletePago(id).subscribe({
      next: () => {
        this.loadPagos();
      },
      error: (err) => {
        alert('Error al eliminar el pago: ' + (err.error?.message || 'Error desconocido'));
        console.error(err);
      }
    });
  }

  resetForm() {
    this.editingId.set(null);
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

    const pagoData: CreatePago = {
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

    const operation = this.editingId()
      ? this.pagosService.updatePago(this.editingId()!, pagoData)
      : this.pagosService.createPago(pagoData);

    operation.subscribe({
      next: () => {
        const message = this.editingId() ? 'Pago actualizado exitosamente' : 'Pago registrado exitosamente';
        this.formSuccess.set(message);
        this.formLoading.set(false);
        this.resetForm();
        this.loadPagos();
        setTimeout(() => {
          this.showForm.set(false);
        }, 2000);
      },
      error: (err) => {
        this.formError.set(err.error?.message || 'Error al procesar el pago');
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
