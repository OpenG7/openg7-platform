import { TestBed } from '@angular/core/testing';
import { SectorCarouselComponent } from './sector-carousel.component';
import { FiltersService } from '@app/core/filters.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('SectorCarouselComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SectorCarouselComponent, TranslateModule.forRoot()],
      providers: [FiltersService],
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { sectors: { energy: 'Energy', mining: 'Mining' } }, true);
    translate.use('en');
  });

  it('updates active sector in service on click', () => {
    const fixture = TestBed.createComponent(SectorCarouselComponent);
    fixture.componentInstance.sectors = [
      { id: 'energy', labelKey: 'sectors.energy' },
      { id: 'mining', labelKey: 'sectors.mining' },
    ];
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[1].click();
    const service = TestBed.inject(FiltersService);
    expect(service.activeSector()).toBe('mining');
  });

  it('reflects active sector from service', () => {
    const fixture = TestBed.createComponent(SectorCarouselComponent);
    fixture.componentInstance.sectors = [
      { id: 'energy', labelKey: 'sectors.energy' },
      { id: 'mining', labelKey: 'sectors.mining' },
    ];
    fixture.detectChanges();
    const service = TestBed.inject(FiltersService);
    service.activeSector.set('energy');
    fixture.detectChanges();
    const active = fixture.nativeElement.querySelector('button.active');
    expect(active.textContent.trim()).toBe('Energy');
  });

  it('exposes accessible list attributes', () => {
    const fixture = TestBed.createComponent(SectorCarouselComponent);
    fixture.componentInstance.sectors = [{ id: 'energy', labelKey: 'sectors.energy' }];
    fixture.componentInstance.ariaLabelledBy = 'sector-label';
    fixture.componentInstance.describedBy = 'sector-description';
    fixture.detectChanges();
    const list: HTMLElement = fixture.nativeElement.querySelector('ul');
    expect(list.getAttribute('role')).toBe('listbox');
    expect(list.getAttribute('aria-labelledby')).toBe('sector-label');
    expect(list.getAttribute('aria-describedby')).toBe('sector-description');
  });
});
