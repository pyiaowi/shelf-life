import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductApi } from '../product-api';
import {
  Category,
  CATEGORIES,
  CONTENT_STATUSES,
  ContentStatus,
  Product,
  ProductRequest,
  todayIso,
  toRequest,
} from '../product';

type View = 'ALL' | 'NEEDS_CONTENT' | 'EXPIRING_SOON' | 'EXPIRED';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-product-list',
  styleUrl: './product-list.css',
  templateUrl: './product-list.html',
})
export class ProductList implements OnInit {
  private readonly api = inject(ProductApi);

  protected readonly categories = CATEGORIES;
  protected readonly contentStatuses = CONTENT_STATUSES;
  protected readonly views: { value: View; label: string }[] = [
    { value: 'ALL', label: 'Everything' },
    { value: 'NEEDS_CONTENT', label: 'Needs content' },
    { value: 'EXPIRING_SOON', label: 'Expiring soon' },
    { value: 'EXPIRED', label: 'Expired' },
  ];

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly view = signal<View>('ALL');
  protected readonly search = signal('');
  protected readonly category = signal<Category | 'ALL'>('ALL');

  protected readonly counts = computed(() => {
    const list = this.products();
    return {
      ALL: list.length,
      NEEDS_CONTENT: list.filter((p) => p.contentStatus === 'NOT_STARTED').length,
      EXPIRING_SOON: list.filter((p) => p.expiryStatus === 'EXPIRING_SOON').length,
      EXPIRED: list.filter((p) => p.expiryStatus === 'EXPIRED').length,
    };
  });

  protected readonly filtered = computed(() => {
    const view = this.view();
    const category = this.category();
    const term = this.search().trim().toLowerCase();

    return this.products()
      .filter((p) => {
        if (view === 'NEEDS_CONTENT') return p.contentStatus === 'NOT_STARTED';
        if (view === 'EXPIRING_SOON') return p.expiryStatus === 'EXPIRING_SOON';
        if (view === 'EXPIRED') return p.expiryStatus === 'EXPIRED';
        return true;
      })
      .filter((p) => category === 'ALL' || p.category === category)
      .filter(
        (p) =>
          !term ||
          p.name.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          (p.shade ?? '').toLowerCase().includes(term),
      )
      .sort((a, b) => {
        // Most urgent first; products with no expiry date go last.
        const aDays = a.daysUntilExpiry ?? Number.MAX_SAFE_INTEGER;
        const bDays = b.daysUntilExpiry ?? Number.MAX_SAFE_INTEGER;
        return aDays - bDays || a.name.localeCompare(b.name);
      });
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Couldn't reach the API. Make sure the Spring Boot app is running on port 8080.");
        this.loading.set(false);
      },
    });
  }

  protected clearFilters(): void {
    this.view.set('ALL');
    this.category.set('ALL');
    this.search.set('');
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected onCategory(event: Event): void {
    this.category.set((event.target as HTMLSelectElement).value as Category | 'ALL');
  }

  protected onStatusChange(product: Product, event: Event): void {
    const contentStatus = (event.target as HTMLSelectElement).value as ContentStatus;
    this.save(product, { contentStatus });
  }

  protected markOpened(product: Product): void {
    this.save(product, { openedDate: todayIso() });
  }

  protected remove(product: Product): void {
    if (!confirm(`Delete "${product.name}" from your shelf?`)) return;
    this.api.delete(product.id).subscribe({
      next: () => this.products.update((list) => list.filter((p) => p.id !== product.id)),
      error: () => alert("Couldn't delete that product. Try again."),
    });
  }

  protected categoryLabel(value: Category): string {
    return this.categories.find((c) => c.value === value)?.label ?? value;
  }

  protected expiryHeadline(p: Product): string {
    const days = p.daysUntilExpiry;
    if (days === null) return 'No expiry set';
    if (days < 0) return days === -1 ? 'Expired yesterday' : `Expired ${-days} days ago`;
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    return `${days} days left`;
  }

  private save(product: Product, changes: Partial<ProductRequest>): void {
    const request = { ...toRequest(product), ...changes };
    this.api.update(product.id, request).subscribe({
      next: (updated) =>
        this.products.update((list) => list.map((p) => (p.id === updated.id ? updated : p))),
      error: () => {
        alert("Couldn't save that change. Try again.");
        this.load();
      },
    });
  }
}