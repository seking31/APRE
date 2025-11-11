import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CustomerFeedbackByMonthComponent } from './customer-feedback-by-month.component';
import { environment } from '../../../../environments/environment';

describe('CustomerFeedbackByMonthComponent', () => {
  let component: CustomerFeedbackByMonthComponent;
  let fixture: ComponentFixture<CustomerFeedbackByMonthComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerFeedbackByMonthComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerFeedbackByMonthComponent);
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

  it('should show validation message if no month is selected', () => {
    component.form.controls.month.setValue(''); // empty
    component.onSubmit();

    // No HTTP request should be made
    httpMock.expectNone(() => true);

    expect(component.showMessage).toBe(
      'Please select a month before fetching data.'
    );
    expect(component.tableRows.length).toBe(0);
  });

  it('should request and map flat {channel, ratingAvg} data', () => {
    component.form.controls.month.setValue('11');
    component.onSubmit();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/customer-feedback/channel-rating-by-month/11`
    );
    expect(req.request.method).toBe('GET');

    const mockResponse = [
      { channel: 'Retail', ratingAvg: 4.3 },
      { channel: 'Online', ratingAvg: 3.9 },
      { channel: 'Wholesale', ratingAvg: 4.7 },
    ];
    req.flush(mockResponse);

    expect(component.tableRows).toEqual(mockResponse);
    expect(component.showMessage).toBe('');
  });
});
