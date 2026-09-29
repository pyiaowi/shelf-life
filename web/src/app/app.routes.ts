import { Routes } from '@angular/router';
import { ProductList } from './products/product-list/product-list';
import { ProductForm } from './products/product-form/product-form';

export const routes: Routes = [
  { path: '', component: ProductList, title: 'Shelf Life' },
  { path: 'products/new', component: ProductForm, title: 'Add product | Shelf Life' },
  { path: 'products/:id/edit', component: ProductForm, title: 'Edit product | Shelf Life' },
  { path: '**', redirectTo: '' },
];