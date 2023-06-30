import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetGroupComponent } from './asset-group.component';

describe('AssetGroupComponent', () => {
  let component: AssetGroupComponent;
  let fixture: ComponentFixture<AssetGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetGroupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
