import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ChannelRatingByYearComponent } from './channel-rating-by-year.component';
import { environment } from '../../../../environments/environment';

describe('ChannelRatingByYearComponent', () => {
  let component: ChannelRatingByYearComponent;
  let fixture: ComponentFixture<ChannelRatingByYearComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ChannelRatingByYearComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChannelRatingByYearComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set an error when year is not selected', () => {
    // ensure empty/invalid form
    component.yearForm.controls.year.setValue(null);
    component.onSubmit();

    expect(component.errorMessage).toBe('Please select a year');
    expect(component.channel).toEqual([]);
    expect(component.ratingAvg).toEqual([]);
  });

  it('should populate channel and ratingAvg from API response', () => {
    const mockResponse = [
      { channel: 'Retail', ratingAvg: 4.2 },
      { channel: 'Online', ratingAvg: 3.9 },
    ];

    // select a valid year
    component.yearForm.controls.year.setValue(2023);
    component.onSubmit();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/customer-feedback/channel-rating-by-year/2023`
    );
    expect(req.request.method).toBe('GET');

    // respond
    req.flush(mockResponse);

    expect(component.errorMessage).toBe('');
    expect(component.channel).toEqual(['Retail', 'Online']);
    expect(component.ratingAvg).toEqual([4.2, 3.9]);
  });

  it('should show "No data found" and clear arrays when API returns empty array', () => {
    component.yearForm.controls.year.setValue(2023);
    component.onSubmit();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/customer-feedback/channel-rating-by-year/2023`
    );
    expect(req.request.method).toBe('GET');

    req.flush([]); // simulate no data

    expect(component.channel).toEqual([]);
    expect(component.ratingAvg).toEqual([]);
    expect(component.errorMessage).toBe('No data found for 2023');
  });
});
