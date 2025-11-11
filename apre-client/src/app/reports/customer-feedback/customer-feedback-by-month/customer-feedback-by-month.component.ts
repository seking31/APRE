import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { TableComponent } from '../../../shared/table/table.component';

@Component({
  selector: 'app-sales-by-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TableComponent],
  template: `
    <div class="sales-container">
      <h1>Channel Rating by Month</h1>

      <form class="form" [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form__group">
          <label for="month">Select Month:</label>
          <select class="select" id="month" formControlName="month">
            <option value="">-- Choose a month --</option>
            <option *ngFor="let m of months" [value]="m.value">
              {{ m.label }}
            </option>
          </select>
        </div>

        <div class="form__action">
          <input
            type="submit"
            class="button button--primary"
            value="Fetch Ratings"
          />
        </div>
      </form>

      @if (tableRows.length > 0) {
      <div class="card chart-card">
        <app-table
          [title]="'Average Rating by Channel'"
          [data]="tableRows"
          [headers]="['channel', 'ratingAvg']"
          [sortableColumns]="['channel', 'ratingAvg']"
        ></app-table>
      </div>
      } @if (tableRows.length === 0) {
      <h1>{{ showMessage }}</h1>
      }
    </div>
  `,
  styles: ``,
})
export class CustomerFeedbackByMonthComponent {
  tableRows: Array<{ channel: string; ratingAvg: number }> = [];
  showMessage = '';

  months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  form: FormGroup<{ month: FormControl<string> }> = this.fb.group({
    month: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  onSubmit() {
    const selectedMonth = this.form.controls.month.value?.trim();

    if (!selectedMonth) {
      this.showMessage = 'Please select a month before fetching data.';
      return;
    }

    const url = `${
      environment.apiBaseUrl
    }/reports/customer-feedback/channel-rating-by-month/${encodeURIComponent(
      selectedMonth
    )}`;

    this.tableRows = [];
    this.showMessage = 'Loading...';

    this.http.get(url, { observe: 'response' }).subscribe({
      next: (resp) => {
        const payload = resp.body;
        const data: any[] = Array.isArray(payload) ? payload : [];

        this.tableRows = data
          .filter(
            (item) =>
              item &&
              typeof item.channel === 'string' &&
              (typeof item.ratingAvg === 'number' ||
                typeof item.ratingAvg === 'string')
          )
          .map((item) => ({
            channel: String(item.channel),
            ratingAvg: Number(item.ratingAvg),
          }))
          .filter((row) => !Number.isNaN(row.ratingAvg));

        this.showMessage = this.tableRows.length
          ? ''
          : 'No data found for this month';
      },
      error: (err) => {
        console.error('Error fetching data from the server.', err);
        this.showMessage = 'Error fetching data from the server.';
      },
    });
  }
}
