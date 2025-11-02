import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SalesByProductComponent } from './sales-by-product.component';
import { environment } from '../../../../environments/environment';

describe('SalesByProductComponent', () => {
  let component: SalesByProductComponent;
  let fixture: ComponentFixture<SalesByProductComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesByProductComponent],
      providers: [
        provideHttpClient(), // 👈 New HttpClient provider
        provideHttpClientTesting(), // 👈 Replaces deprecated HttpClientTestingModule
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesByProductComponent);
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

  it('should initialize form with empty product control', () => {
    expect(component.productForm.controls.product.value).toBe('');
  });

  it('should fetch and set sales data', () => {
    component.productForm.controls.product.setValue('Widget123');
    const mockResponse = [
      { product: 'Widget123', amount: 100 },
      { product: 'Widget123', amount: 200 },
    ];

    component.onSubmit();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/sales/sales-by-product/Widget123`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(component.salesData.length).toBe(2);
  });

  it('should handle empty response', () => {
    component.productForm.controls.product.setValue('UnknownProduct');
    component.onSubmit();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/sales/sales-by-product/UnknownProduct`
    );
    req.flush([]);

    expect(component.salesData.length).toBe(0);
    expect(component.showMessage).toBe('No data found for this product');
  });
});
