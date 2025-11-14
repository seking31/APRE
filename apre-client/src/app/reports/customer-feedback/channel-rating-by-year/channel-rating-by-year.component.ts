import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from '../../../shared/chart/chart.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

interface ChannelYearItem {
  channel: string;
  ratingAvg: number;
}

@Component({
  selector: 'app-channel-rating-by-year',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ChartComponent],
  template: `
    <h1>Channel Rating by Year</h1>

    <div class="region-container">
      <form class="form" [formGroup]="yearForm" (ngSubmit)="onSubmit()">
        @if (errorMessage) {
        <div class="message message--error">{{ errorMessage }}</div>
        }

        <div class="form__group">
          <label class="label" for="year">Year</label>
          <select class="select" formControlName="year" id="year" name="year">
            @for (year of years; track year.value) {
            <option [value]="year.value">{{ year.name }}</option>
            }
          </select>
        </div>

        <div class="form__actions">
          <button class="button button--primary" type="submit">Submit</button>
        </div>
      </form>

      @if (channel.length) {
      <div class="card chart-card">
        <app-chart
          [type]="'bar'"
          [label]="'Average Rating by Channel'"
          [data]="ratingAvg"
          [labels]="channel"
        >
        </app-chart>
      </div>
      }
    </div>
  `,
  styles: `
    .region-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .form, .chart-card {
      width: 50%;
      margin: 20px 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ChannelRatingByYearComponent {
  channel: string[] = [];
  ratingAvg: number[] = [];
  years = this.loadYears();
  errorMessage = '';

  yearForm = this.fb.group({
    year: this.fb.control<number | null>(null, [Validators.required]),
  });

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  loadYears() {
    // Expand as needed
    return [{ value: 2023, name: '2023' }];
  }

  onSubmit() {
    if (this.yearForm.invalid) {
      this.errorMessage = 'Please select a year';
      this.channel = [];
      this.ratingAvg = [];
      return;
    }

    const year = this.yearForm.controls.year.value!;
    const url = `${environment.apiBaseUrl}/reports/customer-feedback/channel-rating-by-year/${year}`;

    this.http.get<ChannelYearItem[]>(url).subscribe({
      next: (data) => {
        if (!Array.isArray(data) || data.length === 0) {
          const selectedYear =
            this.years.find((y) => y.value === Number(year))?.name ?? year;
          this.errorMessage = `No data found for ${selectedYear}`;
          this.channel = [];
          this.ratingAvg = [];
          return;
        }

        // Map API array -> chart inputs
        this.channel = data.map((d) => d.channel);
        this.ratingAvg = data.map((d) => Number(d.ratingAvg));

        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Error fetching channel rating by year data:', err);
        this.errorMessage = 'Failed to load data. Please try again.';
        this.channel = [];
        this.ratingAvg = [];
      },
    });
  }
}
