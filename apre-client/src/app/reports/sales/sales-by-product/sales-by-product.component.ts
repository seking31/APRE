import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { TableComponent } from '../../../shared/table/table.component';

@Component({
  selector: 'app-sales-by-product',
  standalone: true,
  imports: [ReactiveFormsModule, TableComponent],
  template: `
    <div class="sales-container">
      <h1>Sales by Product</h1>

      <form class="form" [formGroup]="productForm" (ngSubmit)="onSubmit()">
        <div class="form__group">
          <label for="product">Select Product:</label>
          <select class="select" id="product" formControlName="product">
            <option value="" disabled>Select a product</option>
            <option value="Fitness Tracker">Fitness Tracker</option>
            <option value="Office Chair Deluxe">Office Chair Deluxe</option>
            <option value="Laptop Pro 15">Laptop Pro 15</option>
          </select>
        </div>

        <div class="form__action">
          <input
            type="submit"
            class="button button--primary"
            value="Generate Report"
          />
        </div>
      </form>

      @if (salesData.length > 0) {
      <div class="card chart-card">
        <app-table
          [title]="'Sales Data by Product'"
          [data]="salesData"
          [headers]="['salesperson', 'product', 'totalSales']"
          [sortableColumns]="['salesperson', 'product', 'totalSales']"
        ></app-table>
      </div>
      } @if (salesData.length === 0) {
      <h1>{{ showMessage }}</h1>
      }
    </div>
  `,
  styles: ``,
})
export class SalesByProductComponent {
  salesData: any[] = [];
  showMessage = '';

  // Strongly-typed, non-nullable control named "product"
  productForm: FormGroup<{ product: FormControl<string> }> = this.fb.group({
    product: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  onSubmit() {
    const selectedProduct = this.productForm.controls.product.value;

    if (!selectedProduct) {
      this.showMessage = 'Please select a product.';
      return;
    }

    this.http
      .get(
        `${
          environment.apiBaseUrl
        }/reports/sales/sales-by-product/${encodeURIComponent(selectedProduct)}`
      )
      .subscribe({
        next: (data) => {
          this.salesData = data as any[];
          this.showMessage = this.salesData.length
            ? ''
            : 'No data found for this product';
        },
        error: (err) => {
          console.error('Error fetching data from the server.', err);
          this.showMessage = 'Error fetching data from the server.';
        },
      });
  }
}
