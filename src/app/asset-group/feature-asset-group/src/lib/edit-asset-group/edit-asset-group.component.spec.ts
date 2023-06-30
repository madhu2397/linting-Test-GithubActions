import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAssetGroupComponent } from './edit-asset-group.component';

describe('EditAssetGroupComponent', () => {
  let component: EditAssetGroupComponent;
  let fixture: ComponentFixture<EditAssetGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditAssetGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditAssetGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
