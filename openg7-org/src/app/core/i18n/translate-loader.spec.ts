import { TestBed } from '@angular/core/testing';
import { HttpBackend } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppTranslateLoader } from './translate-loader';
import { TransferState, PLATFORM_ID } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { errorInterceptor } from '../http/error.interceptor';
import { NotificationStore } from '../observability/notification.store';

describe('AppTranslateLoader', () => {
  let translate: TranslateService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: AppTranslateLoader, deps: [HttpBackend, TransferState, PLATFORM_ID] },
        }),
      ],
      providers: [
        { provide: HTTP_INTERCEPTORS, useValue: errorInterceptor, multi: true },
        NotificationStore,
        TransferState,
      ],
    });
    translate = TestBed.inject(TranslateService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads translations without interceptor loop', () => {
    translate.use('en').subscribe();
    http.expectOne('/assets/i18n/en.json').flush({});
  });
});
