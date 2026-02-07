import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagosService, Pago, PagosResponse } from './services/pagos.service';

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
