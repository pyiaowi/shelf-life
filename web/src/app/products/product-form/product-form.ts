import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductApi } from '../product-api';
import {
  Category,
  CATEGORIES,
  CONTENT_STATUSES,
  ContentStatus,
  ProductRequest,
  todayIso,
} from '../product';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-product-form',
  styleUrl: './product-form.css',
  templateUrl: './product-form.html',
})
export class ProductForm implements OnInit {
  /** Filled in from the URL (products/:id/edit). Empty when adding a new product. */
  readonly id = input<string>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(ProductApi);
  private readonly router = inject(Router);

  protected readonly categories = CATEGORIES;
  protected readonly contentStatuses = CONTENT_STATUSES;
  protected readonly today = todayIso();

  protected readonly isEdit = computed(() => !!this.id());
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly serverErrors = signal<Record<string, string>>({});

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    brand: ['', [Validators.required, Validators.maxLength(80)]],
    category: this.fb.control<Category>('SKINCARE', Validators.required),
    shade: ['', Validators.maxLength(80)],
    receivedDate: [todayIso(), Validators.required],
    openedDate: [''],
    paoMonths: this.fb.control<number | null>(null, [Validators.min(1), Validators.max(60)]),
    expiryDate: [''],
    contentStatus: this.fb.control<ContentStatus>('NOT_STARTED'),
    notes: ['', Validators.maxLength(1000)],
  });

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;

    this.loading.set(true);
    this.api.getById(Number(id)).subscribe({
      next: (p) => {
        this.form.setValue({
          name: p.name,
          brand: p.brand,
          category: p.category,
          shade: p.shade ?? '',
          receivedDate: p.receivedDate,
          openedDate: p.openedDate ?? '',
          paoMonths: p.paoMonths,
          expiryDate: p.expiryDate ?? '',
          contentStatus: p.contentStatus,
          notes: p.notes ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.formError.set("Couldn't load this product. It may have been deleted.");
        this.loading.set(false);
      },
    });
  }

  /** True when a field should show its error message. */
  protected showError(field: string): boolean {
    const control = this.form.get(field);
    return (!!control && control.invalid && control.touched) || !!this.serverErrors()[field];
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const request: ProductRequest = {
      name: v.name.trim(),
      brand: v.brand.trim(),
      category: v.category,
      shade: blankToNull(v.shade),
      receivedDate: v.receivedDate,
      openedDate: blankToNull(v.openedDate),
      paoMonths: v.paoMonths,
      expiryDate: blankToNull(v.expiryDate),
      contentStatus: v.contentStatus,
      notes: blankToNull(v.notes),
    };

    this.saving.set(true);
    this.formError.set(null);
    this.serverErrors.set({});

    const id = this.id();
    const save$ = id ? this.api.update(Number(id), request) : this.api.create(request);

    save$.subscribe({
      next: () => this.router.navigate(['/']),
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.serverErrors.set(err.error?.fieldErrors ?? {});
        this.formError.set(err.error?.message ?? "Couldn't save. Make sure the API is running.");
      },
    });
  }
}

function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}