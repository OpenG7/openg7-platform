import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { convertToParamMap, ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { Og7SearchFieldComponent } from './og7-search-field.component';

@Component({
  standalone: true,
  imports: [Og7SearchFieldComponent],
  templateUrl: './og7-search-field.component.spec.html'
})
class TestHostComponent {
  @ViewChild('sf') sf!: Og7SearchFieldComponent;
  debounce = 50;
  qKey?: string;
}

describe('Og7SearchFieldComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  function getInput() {
    return fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, RouterTestingModule]
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debounces searchChanged', fakeAsync(() => {
    const spy = jasmine.createSpy('changed');
    host.sf.searchChanged.subscribe(spy);
    const input = getInput();
    input.value = 'foo';
    input.dispatchEvent(new Event('input'));
    tick(40);
    expect(spy).not.toHaveBeenCalled();
    tick(20);
    expect(spy).toHaveBeenCalledWith('foo');
  }));

  it('emits searchCommitted on enter', () => {
    const spy = jasmine.createSpy('commit');
    host.sf.searchCommitted.subscribe(spy);
    const input = getInput();
    input.value = 'bar';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(spy).toHaveBeenCalledWith('bar');
  });

  it('clears value and emits empty searchChanged', () => {
    const changed = jasmine.createSpy('changed');
    host.sf.searchChanged.subscribe(changed);
    const input = getInput();
    input.value = 'baz';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button[aria-label="Clear"]'));
    btn.nativeElement.click();
    expect(host.sf.value).toBe('');
    expect(changed).toHaveBeenCalledWith('');
    expect(document.activeElement).toBe(input);
  });

  it('clears value on escape key', fakeAsync(() => {
    const changed = jasmine.createSpy('changed');
    host.sf.searchChanged.subscribe(changed);
    const input = getInput();
    input.value = 'baz';
    input.dispatchEvent(new Event('input'));
    tick(60);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(host.sf.value).toBe('');
    expect(changed).toHaveBeenCalledWith('');
    expect(document.activeElement).toBe(input);
    tick(60);
  }));

  it('initializes from query param', () => {
    TestBed.overrideProvider(ActivatedRoute, { useValue: { snapshot: { queryParamMap: convertToParamMap({ q: 'init' }) } } });
    host.qKey = 'q';
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    expect(host.sf.value).toBe('init');
  });

  it('updates URL on commit', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    host.qKey = 'q';
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    const input = getInput();
    input.value = 'hello';
    input.dispatchEvent(new Event('input'));
    host.sf.commit('action');
    expect(router.navigate).toHaveBeenCalled();
  });

  it('has role searchbox', () => {
    const input = getInput();
    expect(input.getAttribute('role')).toBe('searchbox');
  });
});
