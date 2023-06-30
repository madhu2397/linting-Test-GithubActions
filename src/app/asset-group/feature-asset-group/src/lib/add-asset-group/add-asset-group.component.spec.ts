import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
	ComponentFixture,
	fakeAsync,
	TestBed,
	tick,
	waitForAsync,
} from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { DropdownSearchModule } from '@cpxe/cx-portal/multi/ui/dropdown-search';
import { OktaAuthServiceTestModule } from '@cpxe/cx-portal/temporary/services';
import {
	CuiSearchModule,
	CuiSpinnerModule,
} from '@cpxe/shared/multi/util/temporary-cui-components';
import {
	MixpanelFeedbackService,
	StateAdapter,
} from '@cx-portal-core-data-access';
import { Environment, ENVIRONMENT } from '@cx-portal/common-injectable-tokens';
import {
	SplitIoService,
	SplitTreatment,
} from '@cx-portal/shared/core-services';
import { LoaderModule } from '@cxui-components/loader';
import { PaginatorModule } from '@cxui-components/paginator';
import { SearchModule } from '@cxui-components/search';
import { Sort, TableCdkModule } from '@cxui-components/table-cdk';
import { FullWidthBannerModule } from '@libs/common';
import { provideMockStore } from '@ngrx/store/testing';
import {
	AssetGroupAssetsResponseModel,
	ControlPointAssetGroupService,
	EditAssetGroupResponse,
	MOCK_SDP_API_ENVIRONMENT,
	SDP_API_ENVIRONMENT,
} from '@sdp-api';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { createSpyFromClass, provideAutoSpy, Spy } from 'jest-auto-spies';
import { of, throwError } from 'rxjs';
import { AddAssetGroupComponent } from './add-asset-group.component';

describe('CreateAssetGroup', () => {
	let component: AddAssetGroupComponent;
	let controlPointAssetGroupService: ControlPointAssetGroupService;
	let fixture: ComponentFixture<AddAssetGroupComponent>;

	beforeEach(
		waitForAsync(() => {
			const mockStateAdapter = createSpyFromClass(StateAdapter, {
				observablePropsToSpyOn: ['customerId$', 'user$'],
			});

			mockStateAdapter.user$.nextWith({});
			mockStateAdapter.customerId$.nextWith(null);

			TestBed.configureTestingModule({
				imports: [
					CommonModule,
					FormsModule,
					ReactiveFormsModule,
					CuiSpinnerModule,
					DropdownSearchModule,
					CuiSearchModule,
					HttpClientTestingModule,
					OktaAuthServiceTestModule,
					RouterTestingModule,
					FullWidthBannerModule,
					BrowserAnimationsModule,
					PaginatorModule,
					TableCdkModule,
					LoaderModule,
					SearchModule,
				],
				declarations: [AddAssetGroupComponent],
				providers: [
					provideAutoSpy(MixpanelFeedbackService),
					{ provide: StateAdapter, useValue: mockStateAdapter },
					{
						provide: SplitIoService,
						useValue: {
							isSplitEnabled: jest.fn(() => of(false)),
						},
					},
					{
						provide: ENVIRONMENT,
						useValue: <Environment>{ trackNames: { assets: '' } },
					},
					{
						provide: SDP_API_ENVIRONMENT,
						useValue: MOCK_SDP_API_ENVIRONMENT,
					},
				],
			});
		}),
	);

	beforeEach(() => {
		window.sessionStorage.clear();
		controlPointAssetGroupService = TestBed.inject(
			ControlPointAssetGroupService,
		);
		fixture = TestBed.createComponent(AddAssetGroupComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should sort assets data in asc order', () => {
		component.sortProps = {
			dir: 'asc',
			column: 'hostname',
		};
		component.setSort('hostname');
	});

	it('should sort user group data in desc order', () => {
		component.sortProps = {
			dir: 'desc',
			column: 'hostname',
		};
		component.setSort('hostname');
	});

	it('should change page number of user group list', () => {
		component.onPageChanged({ page: 2, current: 2 });
		// TODO This is not a test, there is no expect.
	});

	it('should get user details', (done) => {
		jest
			.spyOn(controlPointAssetGroupService, 'getAssetsGridData')
			.mockReturnValue(
				throwError(
					new HttpErrorResponse({
						status: 404,
						statusText: 'Resource not found',
					}),
				),
			);
		component.dropdownSearch.searchText = 'abcd';
		component.searchField = 'All';
		component.getAssetsGridData();
		// TODO this test isn't really testing anything.
		controlPointAssetGroupService
			.getAssetsGridData(
				{
					customerId: '104959_0',
					page: 1,
					rows: 10,
					sort: 'hostname:asc',
					search: 'switch',
					searchFields: 'hostname',
				},
				(component.queryParams = '&sort=hostname:asc'),
			)
			.subscribe({
				error: (err: unknown) => {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					expect((err as any).statusText).toEqual('Resource not found');
					done();
				},
			});
	});

	it('should failed while getting Assets List Using GET', (done) => {
		jest
			.spyOn(controlPointAssetGroupService, 'getAssetsGridData')
			.mockReturnValue(
				throwError(
					new HttpErrorResponse({
						status: 404,
						statusText: 'Resource not found',
					}),
				),
			);
		component.dropdownSearch.searchText = 'abcd';
		component.searchField = '';
		component.getAssetsGridData();
		// TODO What is this even testing?
		controlPointAssetGroupService
			.getAssetsGridData(
				{
					customerId: '104959_0',
					page: 1,
					rows: 10,
					sort: 'hostname:asc',
					search: 'switch',
					searchFields: 'hostname',
				},
				(component.queryParams = '&sort=hostname:asc'),
			)
			.subscribe({
				error: (err: unknown) => {
					// TODO(CACC-4817): Proper type guarding
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					expect((err as any).statusText).toEqual('Resource not found');
					done();
				},
			});
	});

	it('should get the selected search dropdown value', () => {
		component.getCategoryValue('hostname');
		// TODO This is not a test, there is no expect.
	});

	it('should fail to get location filters list', (done) => {
		jest
			.spyOn(controlPointAssetGroupService, 'getLocationFiltersList')
			.mockReturnValue(
				throwError(
					new HttpErrorResponse({
						status: 404,
						statusText: 'Resource not found',
					}),
				),
			);
		component.getLocationFiltersList();
		controlPointAssetGroupService
			.getLocationFiltersList({
				customerId: '104959_0',
			})
			.subscribe({
				error: (err: unknown) => {
					// TODO(CACC-4817): Proper type guarding
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					expect((err as any).statusText).toEqual('Resource not found');
					done();
				},
			});
	});

	it('should fail to get location filters list', (done) => {
		jest
			.spyOn(controlPointAssetGroupService, 'getProductTypeFiltersList')
			.mockReturnValue(
				throwError(
					new HttpErrorResponse({
						status: 404,
						statusText: 'Resource not found',
					}),
				),
			);
		component.getProductTypeFiltersList();
		controlPointAssetGroupService
			.getProductTypeFiltersList({
				customerId: '104959_0',
			})
			.subscribe({
				error: (err: unknown) => {
					// TODO(CACC-4817): Proper type guarding
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					expect((err as any).statusText).toEqual('Resource not found');
					done();
				},
			});
	});

	it('should fail to create the asset group', (done) => {
		jest
			.spyOn(controlPointAssetGroupService, 'createAssetGroup')
			.mockReturnValue(
				throwError(
					new HttpErrorResponse({
						status: 404,
						statusText: 'Resource not found',
						error: {
							message: 'Duplicate Object Encountered',
						},
					}),
				),
			);
		component.onCreateAssetGroup();
		controlPointAssetGroupService
			.createAssetGroup({
				customerId: '104959_0',
				groupName: 'sample-asset-group',
				createdBy: 'testid',
			})
			.subscribe({
				error: (err: unknown) => {
					// TODO(CACC-4817): Proper type guarding
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					expect((err as any).statusText).toEqual('Resource not found');

					done();
				},
			});
	});

	it('should create User Group', (done) => {
		const requestParam = {
			message: 'successfully created user group',
			status: 200,
		};
		component.isAllSelected = true;
		jest
			.spyOn(controlPointAssetGroupService, 'createAssetGroup')
			.mockReturnValue(of(<any>requestParam));
		component.onCreateAssetGroup();
		controlPointAssetGroupService
			.createAssetGroup({
				customerId: '104959_0',
				groupName: 'sample-asset-group',
				createdBy: 'testid',
			})
			.subscribe((response) => {
				expect(response).toBeDefined();
				done();
			});
	});

	it('should handle if else condition in create User Group', (done) => {
		const requestParam = {
			message: 'successfully created user group',
			status: 200,
		};
		component.isAllSelected = false;
		component.selectedNeIds = [];
		jest
			.spyOn(controlPointAssetGroupService, 'createAssetGroup')
			.mockReturnValue(of(<any>requestParam));
		component.onCreateAssetGroup();
		controlPointAssetGroupService
			.createAssetGroup({
				customerId: '104959_0',
				groupName: 'sample-asset-group',
				createdBy: 'testid',
			})
			.subscribe((response) => {
				expect(response).toBeDefined();
				done();
			});
	});

	it('should fail to update the asset group', (done) => {
		jest
			.spyOn(controlPointAssetGroupService, 'updateAssetGroup')
			.mockReturnValue(
				throwError(
					new HttpErrorResponse({
						status: 404,
						statusText: 'Resource not found',
					}),
				),
			);
		component.onEditAssetGroup();
		controlPointAssetGroupService
			.updateAssetGroup({
				customerId: '104959_0',
				groupName: 'sample-asset-group',
			})
			.subscribe({
				error: (err: unknown) => {
					// TODO(CACC-4817): Proper type guarding
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					expect((err as any).statusText).toEqual('Resource not found');
					done();
				},
			});
	});

	it('should update asset Group', (done) => {
		const requestParam = {
			message: 'successfully updated the asset group',
			status: 200,
		};
		component.isAllSelected = true;
		jest
			.spyOn(controlPointAssetGroupService, 'updateAssetGroup')
			.mockReturnValue(of(<any>requestParam));
		component.onEditAssetGroup();
		controlPointAssetGroupService
			.updateAssetGroup({
				customerId: '104959_0',
				groupName: 'sample-asset-group',
			})
			.subscribe((response) => {
				expect(response).toBeDefined();
				done();
			});
	});

	it('should hanlde if else condition on update asset Group', (done) => {
		const requestParam = {
			message: 'successfully updated the asset group',
			status: 200,
		};
		component.isAllSelected = false;
		component.selectedNeIds = [];
		jest
			.spyOn(controlPointAssetGroupService, 'updateAssetGroup')
			.mockReturnValue(of(<any>requestParam));
		component.onEditAssetGroup();
		controlPointAssetGroupService
			.updateAssetGroup({
				customerId: '104959_0',
				groupName: 'sample-asset-group',
			})
			.subscribe((response) => {
				expect(response).toBeDefined();
				done();
			});
	});
	it('should fail to get location filters list', (done) => {
		jest
			.spyOn(controlPointAssetGroupService, 'getAssetsByGroup')
			.mockReturnValue(
				throwError(
					new HttpErrorResponse({
						status: 404,
						statusText: 'Resource not found',
					}),
				),
			);
		component.getSelectedAssetsForEdit();
		controlPointAssetGroupService
			.getAssetsByGroup({
				customerId: '104959_0',
				groupId: '1675',
			})
			.subscribe({
				error: (err: unknown) => {
					// TODO(CACC-4817): Proper type guarding
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					expect((err as any).statusText).toEqual('Resource not found');
					done();
				},
			});
	});

	it('should fetch assets list by group', (done) => {
		const responseObj = {
			neIds: [
				'neId10',
				'neId13',
				'neId14',
				'neId3',
				'neId4',
				'neId6',
				'neId7',
				'neId9',
			],
		};
		jest
			.spyOn(controlPointAssetGroupService, 'getAssetsByGroup')
			.mockReturnValue(of(<any>responseObj));
		component.getSelectedAssetsForEdit();
		controlPointAssetGroupService
			.getAssetsByGroup({
				customerId: '104959_0',
				groupId: '1675',
			})
			.subscribe((response) => {
				expect(response).toBeDefined();
				done();
			});
	});

	it('should handle the loading for dropdown search', () => {
		expect(component.loadingHandler(component.loading)).toBeFalsy();
		// TODO This is not a test, there is no expect.
	});

	it('should close the asset group modal', () => {
		component.closeAssetGroupModal();
		expect(component.visibleComponent).toBeDefined();
	});

	it('toggle show all assets and selected assets', () => {
		component.toggleShowAllAssets();
		expect(component.showOnlyAssets).toBeTruthy();
	});

	it('toggle show all assets and select all is true', () => {
		component.showOnlyAssets = true;
		component.isAllSelected = true;
		component.toggleShowAllAssets();
	});

	it('toggle show all assets and select all is false', () => {
		component.showOnlyAssets = false;
		component.isAllSelected = false;
		component.locationResponse = [
			{ isSelected: true, value: 'PITTSFIELD' },
			{ isSelected: false, value: 'MA' },
			{ isSelected: true, value: 'USA' },
		];
		component.technologyResponse = [
			{ isSelected: true, value: 'Unknown' },
			{ isSelected: false, value: 'Wireless' },
			{ isSelected: true, value: 'Switches' },
		];
		component.toggleShowAllAssets();
	});

	it('toggle show all assets and select all is true', () => {
		component.showOnlyAssets = false;
		component.isAllSelected = true;
		component.toggleShowAllAssets();
	});

	it('toggle show all assets and reset the page to 1', () => {
		component.showOnlyAssets = false;
		component.toggleShowAllAssets();
		expect(component.pageNumber).toEqual(1);
	});

	it('on location filter search', () => {
		const searchParam = 'abcd';
		component.locationResponse = [
			{ isSelected: false, value: 'PITTSFIELD' },
			{ isSelected: false, value: 'MA' },
			{ isSelected: false, value: 'USA' },
		];
		component.onSearchLocations(searchParam);
		expect(component.locationsData).toEqual([]);
	});

	it('on location filter search', () => {
		const searchParam = '';
		component.onSearchLocations(searchParam);
		expect(component.locationsData).toEqual([]);
	});

	it('on product types filter search', () => {
		const searchParam = 'abcd';
		component.technologyResponse = [
			{ isSelected: false, value: 'Unknown' },
			{ isSelected: false, value: 'Wireless' },
			{ isSelected: false, value: 'Switches' },
		];
		component.onSearchTechnologies(searchParam);
		expect(component.technologyData).toEqual([]);
	});

	it('on product types filter search', () => {
		const searchParam = '';
		component.onSearchTechnologies(searchParam);
		expect(component.technologyData).toEqual([]);
	});

	it('show/hide location filters list', () => {
		component.toggleLocationsList();
		expect(component.showLocationsFilter).toBeTruthy();
	});

	it('show/hide product type filters list', () => {
		component.toggleTechnologiesList();
		expect(component.showTechnologiesFilter).toBeTruthy();
	});

	it('should set modal heading for edit', () => {
		component.isEdit = true;
		component.ngOnInit();
		expect(component.modalHeading).toBeDefined();
	});

	it('should change page when show only assets is toggled', () => {
		component.showOnlyAssets = true;
		component.isAllSelected = false;
		component.onPageChanged({ page: 2, current: 3 });
		expect(component.curPage).toStrictEqual(3);
	});

	it('should change page when show only assets is toggled and all assets are selected', () => {
		component.showOnlyAssets = true;
		component.isAllSelected = true;
		component.onPageChanged({ page: 2, current: 3 });
		expect(component.pageNumber).toStrictEqual(3);
	});

	it('should change page when show only assets toggle is disabled', () => {
		component.showOnlyAssets = false;
		component.onPageChanged({ page: 2, current: 3 });
		expect(component.pageNumber).toStrictEqual(3);
	});

	it('should get the assets list API response and set pagination', () => {
		const response = {
			data: [
				{
					productId: 'AIR-AP1852I-B-K9',
					description: 'Cisco Aironet 1850 Series Access Points',
					neId: 'NA,KWC193901RS,AIR-AP1852I-B-K9,NA',
					hostname: 'AP1850',
					installLocation: null,
					productType: 'Wireless',
				},
			],
			Pagination: {
				page: 1,
				pages: 2,
				rows: 10,
				total: 19,
			},
		};
		component.showOnlyAssets = true;
		component.isAllSelected = true;
		component.handleResults(response);
		expect(component.assetsData).toEqual(response.data);
		expect(component.totalRows).toEqual(response.Pagination.total);
		expect(component.selectedAssetsCountForCreate).toEqual(component.totalRows);
	});

	it('should show popup on search of assets', () => {
		component.selectedNeIds = ['ne1', 'ne2'];
		component.showOnlyAssets = true;
		component.isAllSelected = false;
		component.selectedAssetsTempInstance = [];
		const params = {
			search: 'test',
			searchField: 'All',
		};
		component.searchField = 'All';
		component.searchAssetsServiceHandler(params);
		expect(component.selectedAssets).toStrictEqual(
			component.selectedAssetsTempInstance,
		);
	});

	it('should show popup on search of assets', () => {
		component.showOnlyAssets = true;
		component.isAllSelected = false;
		component.selectedAssetsTempInstance = [];
		const params = {
			search: '',
		};
		component.searchField = '';
		component.searchAssetsServiceHandler(params);
		expect(component.selectedAssets).toStrictEqual(
			component.selectedAssetsTempInstance,
		);
	});

	it('should search with hostname filter', () => {
		component.selectedNeIds = [];
		component.dropdownSearch.searchText = 'test';
		component.searchAssetsServiceHandler({ search: 'test' });
		expect(component.queryParams).toBeDefined();
		expect(component.queryParams).toContain('&search=test');
	});

	it('should search with all filter', () => {
		component.searchField = '';
		component.selectedNeIds = [];
		component.searchAssetsServiceHandler({ search: 'test' });
		expect(component.searchField).toStrictEqual('');
		expect(component.queryParams).toBeDefined();
	});

	it('should search with all filter', () => {
		component.showOnlyAssets = true;
		component.searchField = '';
		component.selectedAssetsTempInstance = [];
		component.selectedNeIds = [];
		component.searchAssetsServiceHandler({ search: '' });
		expect(component.selectedAssets).toStrictEqual(
			component.selectedAssetsTempInstance,
		);
	});

	it('should search with all filter when the toggle is enabled', () => {
		component.showOnlyAssets = true;
		component.isAllSelected = false;
		component.searchField = '';
		component.selectedAssetsTempInstance = [];
		component.selectedNeIds = [];
		component.selectedLocationFilter = ['GALVESTON,TX,USA'];
		component.selectedTechnologyFilter = ['Wireless'];
		component.searchAssetsServiceHandler({ search: '' });
		expect(component.selectedAssets).toStrictEqual(
			component.selectedAssetsTempInstance,
		);
	});

	it('should search with all filter when the toggle is enabled', () => {
		component.showOnlyAssets = true;
		component.isAllSelected = true;
		component.selectedLocationFilter = ['GALVESTON,TX,USA'];
		component.selectedTechnologyFilter = ['Wireless'];
		component.dropdownSearch.searchText = '';
		component.searchField = '';
		component.searchAssetsServiceHandler({ search: '' });
		expect(component.selectedAssets).toStrictEqual(
			component.selectedAssetsTempInstance,
		);
	});

	it('should search with all filter when the toggle is enabled', () => {
		component.showOnlyAssets = false;
		component.isAllSelected = false;
		component.selectedNeIds = ['ne1', 'ne2'];
		component.selectedLocationFilter = ['GALVESTON,TX,USA'];
		component.selectedTechnologyFilter = ['Wireless'];
		component.dropdownSearch.searchText = '';
		component.searchField = '';
		component.searchAssetsServiceHandler({ search: '' });
		expect(component.selectedAssets).toStrictEqual(
			component.selectedAssetsTempInstance,
		);
	});

	it('should search with all filter when the toggle is enabled', () => {
		component.showOnlyAssets = false;
		component.isAllSelected = false;
		component.selectedNeIds = ['ne1', 'ne2'];
		component.selectedLocationFilter = ['GALVESTON,TX,USA'];
		component.selectedTechnologyFilter = ['Wireless'];
		component.searchField = '';
		component.searchAssetsServiceHandler({ search: '' });
		expect(component.selectedAssets).toStrictEqual(
			component.selectedAssetsTempInstance,
		);
	});

	it('should search with all filter when the toggle is enabled', () => {
		component.showOnlyAssets = false;
		component.isAllSelected = false;
		component.selectedNeIds = ['ne1', 'ne2'];
		component.selectedLocationFilter = ['GALVESTON,TX,USA'];
		component.selectedTechnologyFilter = ['Wireless'];
		component.searchField = 'All';
		component.searchAssetsServiceHandler({ search: '' });
		expect(component.selectedAssets).toStrictEqual(
			component.selectedAssetsTempInstance,
		);
	});

	it('should search with all filter when the toggle is enabled', () => {
		component.showOnlyAssets = false;
		component.isAllSelected = false;
		component.selectedLocationFilter = ['GALVESTON,TX,USA'];
		component.selectedTechnologyFilter = ['Wireless'];
		component.dropdownSearch.searchText = 'abc';
		component.searchField = 'All';
		component.searchAssetsServiceHandler({ search: 'abc' });
		expect(component.selectedAssets).toStrictEqual(
			component.selectedAssetsTempInstance,
		);
	});

	it('should set table sort in V3', () => {
		component.showOnlyAssets = false;
		const setSortAsset: Sort = {
			active: 'hostname',
			direction: 'desc',
			start: 'desc',
		};
		component.setSortAssetsV3(setSortAsset);
		expect(component.sorting.column).toEqual(setSortAsset.active);
		expect(component.sorting.direction).toEqual(setSortAsset.direction);
	});

	it('should not set table sort in V3', () => {
		component.showOnlyAssets = true;
		const setSortAsset: Sort = {
			active: 'hostname',
			direction: 'desc',
			start: 'desc',
		};
		component.setSortAssetsV3(setSortAsset);
		expect(component.sorting.column).toEqual(setSortAsset.active);
		expect(component.sorting.direction).toEqual(setSortAsset.direction);
	});

	it('should return true for all assets selected', () => {
		component.selectedRows = new SelectionModel<any>(true, [1, 2, 3, 4, 5]);
		component.assetsData = [1, 2, 3, 4, 5];
		component.selectAllV3();
		expect(component.selectedRows.isSelected[0]).toBeFalsy();
	});

	it('should return true for is assets selected', () => {
		component.selectedRows = new SelectionModel<any>(true, [1, 2, 3, 4, 5]);
		component.assetsData = [1, 2, 3, 4, 5];
		const selectedResult = component.isAllSelectedV3();
		expect(selectedResult).toBeTruthy();
	});

	it('should return false for is assets selected', () => {
		component.selectedRows = new SelectionModel<any>(true, [5]);
		component.assetsData = [1, 2, 3, 4];
		const selectedResult = component.isAllSelectedV3();
		expect(selectedResult).toBeFalsy();
	});

	it('should select row in table V3', () => {
		component.selectedRows = new SelectionModel<any>(true, [5]);
		component.selectRow(5);
		expect(component.selectedRows.isSelected(5)).toBeFalsy();
	});

	it('should not select row in table V3', () => {
		component.selectedRows = new SelectionModel<any>(false, [5]);
		component.selectRow(5);
		expect(component.selectedRows.isSelected(5)).toBeFalsy();
	});

	it('should set table sort', () => {
		component.showOnlyAssets = false;
		component.setSortAssets('hostname');
		// TODO This is not a test, there is no expect.
	});

	it('should not set table sort', () => {
		component.showOnlyAssets = true;
		component.setSortAssets('hostname');
		// TODO This is not a test, there is no expect.
	});

	it('should filter data if new filter is checked', () => {
		component.selectedFilter = [];
		component.selectedNeIds = [];
		component.filterData(
			{
				target: {
					checked: true,
				},
			},
			{
				value: 'texas',
				isSelected: false,
			},
			'location',
		);
		expect(component.selectedFilter).toStrictEqual(['texas']);
	});

	it('should filter data if new filter is unchecked', () => {
		component.selectedFilter = ['texas'];
		component.selectedNeIds = [];
		component.filterData(
			{
				target: {
					checked: false,
				},
			},
			{
				value: 'texas',
				isSelected: false,
			},
			'location',
		);
		expect(component.selectedFilter).toStrictEqual([]);
	});

	it('should filter data if new filter is unchecked and target checked is true', () => {
		component.selectedFilter = ['texas'];
		component.selectedNeIds = [];
		component.selectedAssetsMainInstance = [
			{
				productId: 'AIR-AP1852I-B-K9',
				description: 'Cisco Aironet 1850 Series Access Points',
				neId: 'NA,KWC193901RS,AIR-AP1852I-B-K9,NA',
				hostname: 'abcd',
				installLocation: 'texas',
				productType: 'Wireless',
			},
		];
		component.filterData(
			{
				target: {
					checked: true,
				},
			},
			{
				value: 'texas',
				isSelected: false,
			},
			'location',
		);
		expect(component.selectedAssets).toHaveLength(1);
	});
	it('should filter data if new location filter is checked', () => {
		component.selectedFilter = [];
		component.locationsData = [
			{
				value: 'texas',
				isSelected: false,
			},
		];
		component.locationResponse = [
			{
				value: 'texas',
				isSelected: false,
			},
		];
		component.selectLocationCheckbox(
			{
				target: {
					checked: true,
				},
			},
			{
				value: 'texas',
				isSelected: false,
			},
		);
		expect(component.selectedFilter).toStrictEqual([]);
		expect(component.locationsData).toStrictEqual([
			{
				value: 'texas',
				isSelected: true,
			},
		]);
		expect(component.locationResponse).toStrictEqual([
			{
				value: 'texas',
				isSelected: true,
			},
		]);
	});

	it('should filter data if location filter is unchecked', () => {
		component.selectedFilter = [];
		component.selectedNeIds = [];
		component.filterData(
			{
				target: {
					checked: true,
				},
			},
			{
				value: 'texas',
				isSelected: false,
			},
			'location',
		);
		expect(component.selectedFilter).toStrictEqual(['texas']);
	});

	it('should filter data if technology filter is checked', () => {
		component.selectedFilter = [];
		component.selectedNeIds = [];
		component.filterDataByProductType(
			{
				target: {
					checked: false,
				},
			},
			{
				value: 'texas',
				isSelected: false,
			},
			'technology',
		);
		expect(component.selectedFilter).toStrictEqual([]);
	});

	it('should filter data if technology filter is unchecked', () => {
		component.selectedProductTypeFilter = ['Wireless'];
		component.selectedNeIds = [];
		component.selectedProductTypeFilter = [
			{
				productId: 'AIR-AP1852I-B-K9',
				description: 'Cisco Aironet 1850 Series Access Points',
				neId: 'NA,KWC193901RS,AIR-AP1852I-B-K9,NA',
				hostname: 'abcd',
				installLocation: null,
				productType: 'Wireless',
			},
		];
		component.filterDataByProductType(
			{
				target: {
					checked: true,
				},
			},
			{
				value: 'texas',
				isSelected: false,
			},
			'technology',
		);
		expect(component.selectedAssets).toStrictEqual([]);
	});

	it('should filter data if new location filter is unchecked', () => {
		component.selectedFilter = ['texas'];
		component.locationsData = [
			{
				value: 'texas',
				isSelected: false,
			},
		];
		component.locationResponse = [
			{
				value: 'texas',
				isSelected: false,
			},
		];
		component.selectLocationCheckbox(
			{
				target: {
					checked: false,
				},
			},
			{
				value: 'texas',
				isSelected: false,
			},
		);
		expect(component.selectedFilter).toStrictEqual(['texas']);
		expect(component.locationsData).toStrictEqual([
			{
				value: 'texas',
				isSelected: false,
			},
		]);
		expect(component.locationResponse).toStrictEqual([
			{
				value: 'texas',
				isSelected: false,
			},
		]);
	});

	it('should filter data if new technology filter is checked', () => {
		component.selectedFilter = [];
		component.technologyData = [
			{
				value: 'wireless',
				isSelected: false,
			},
		];
		component.technologyResponse = [
			{
				value: 'wireless',
				isSelected: false,
			},
		];
		component.selectTechnologyCheckbox(
			{
				target: {
					checked: true,
				},
			},
			{
				value: 'wireless',
				isSelected: false,
			},
		);
		expect(component.selectedFilter).toStrictEqual([]);
		expect(component.technologyData).toStrictEqual([
			{
				value: 'wireless',
				isSelected: true,
			},
		]);
		expect(component.technologyResponse).toStrictEqual([
			{
				value: 'wireless',
				isSelected: true,
			},
		]);
	});

	it('should filter data if new technology filter is unchecked', () => {
		component.selectedFilter = ['wireless'];
		component.technologyData = [
			{
				value: 'wireless',
				isSelected: false,
			},
		];
		component.technologyResponse = [
			{
				value: 'wireless',
				isSelected: false,
			},
		];
		component.selectTechnologyCheckbox(
			{
				target: {
					checked: false,
				},
			},
			{
				value: 'wireless',
				isSelected: false,
			},
		);
		expect(component.selectedFilter).toStrictEqual(['wireless']);
		expect(component.technologyData).toStrictEqual([
			{
				value: 'wireless',
				isSelected: false,
			},
		]);
		expect(component.technologyResponse).toStrictEqual([
			{
				value: 'wireless',
				isSelected: false,
			},
		]);
	});

	it('should change filter', () => {
		component.selectedFilter = ['test'];
		component.showOnlyAssets = true;
		component.changeFilter(
			{
				target: {
					checked: false,
				},
			},
			{
				value: 'texas',
				isSelected: false,
			},
			'location',
		);

		// TODO This is not a test, there is no expect.
	});

	it('should change filter when no filter was selected location', () => {
		component.selectedAssets = [];
		component.selectedFilter = [];
		component.selectedProductTypeFilter = [];
		component.showOnlyAssets = true;
		component.changeFilter(
			{
				target: {
					checked: false,
				},
			},
			{
				value: 'texas',
				isSelected: false,
			},
			'location',
		);
		expect(component.selectedAssets).toBeDefined();
	});

	it('should select the select all checkbox', () => {
		const response = {
			data: [
				{
					productId: 'AIR-AP1852I-B-K9',
					description: 'Cisco Aironet 1850 Series Access Points',
					neId: 'NA,KWC193901RS,AIR-AP1852I-B-K9,NA',
					hostname: 'AP1850',
					installLocation: null,
					productType: 'Wireless',
				},
			],
			Pagination: {
				page: 1,
				pages: 2,
				rows: 10,
				total: 19,
			},
		};
		component.assetsData = response.data;
		component.selectAll({
			target: {
				checked: true,
			},
		});
		expect(component.isAllSelected).toBeTruthy();
	});

	it('should unselect the select all checkbox', () => {
		const response = {
			data: [
				{
					productId: 'AIR-AP1852I-B-K9',
					description: 'Cisco Aironet 1850 Series Access Points',
					neId: 'NA,KWC193901RS,AIR-AP1852I-B-K9,NA',
					hostname: 'AP1850',
					installLocation: null,
					productType: 'Wireless',
				},
			],
			Pagination: {
				page: 1,
				pages: 2,
				rows: 10,
				total: 19,
			},
		};
		component.assetsData = response.data;
		component.selectAll({
			target: {
				checked: false,
			},
		});
		expect(component.isAllSelected).toBeFalsy();
	});

	it('should unselect checkbox and is edit and not select all', () => {
		component.isAllSelected = false;
		component.isEdit = true;
		component.editNewNeId = [];
		component.selectChange(
			{
				target: {
					checked: false,
				},
			},
			{
				neId: 'test',
			},
		);
		expect(component.editNewNeId).toStrictEqual([]);
	});

	it('should unselect checkbox and all selected true', () => {
		component.isAllSelected = true;
		component.editNewNeId = [];
		component.selectChange(
			{
				target: {
					checked: false,
				},
			},
			{
				neId: 'test',
			},
		);
		expect(component.excludeNeIds).toStrictEqual(['test']);
		expect(component.selectedNeIds).toStrictEqual([]);
	});

	it('should unselect checkbox and is edit', () => {
		component.isAllSelected = false;
		component.selectedAssetsCountForEdit = 1;
		component.isEdit = true;
		component.editNewNeId = [];
		component.selectChange(
			{
				target: {
					checked: true,
				},
			},
			{
				neId: 'test',
			},
		);
		expect(component.editNewNeId).toStrictEqual(['test']);
		expect(component.addNeids).toStrictEqual(['test']);
		expect(component.selectedAssetsCountForEdit).toStrictEqual(2);
	});

	it('should select checkbox and all selected false', () => {
		component.isAllSelected = false;
		component.isEdit = false;
		component.selectChange(
			{
				target: {
					checked: true,
				},
			},
			{
				neId: 'test',
			},
		);

		// TODO This is not a test, there is no expect.
	});

	it('should select checkbox and all selected true', () => {
		component.isAllSelected = true;
		component.selectChange(
			{
				target: {
					checked: true,
				},
			},
			{
				neId: 'test',
			},
		);
		expect(component.selectedNeIds).toStrictEqual(['test']);
	});

	it('should fetch locations list', (done) => {
		const responseObj = ['SanJose', 'Texas'];
		jest
			.spyOn(controlPointAssetGroupService, 'getLocationFiltersList')
			.mockReturnValue(of(<any>responseObj));
		component.getLocationFiltersList();
		controlPointAssetGroupService
			.getLocationFiltersList({
				customerId: '104959_0',
			})
			.subscribe((response) => {
				expect(response).toBeDefined();
				done();
			});
	});

	it('should fetch product types list', (done) => {
		const responseObj = ['Wireless', 'prodType', 'Cat9k'];
		jest
			.spyOn(controlPointAssetGroupService, 'getProductTypeFiltersList')
			.mockReturnValue(of(<any>responseObj));
		component.getProductTypeFiltersList();
		controlPointAssetGroupService
			.getProductTypeFiltersList({
				customerId: '104959_0',
			})
			.subscribe((response) => {
				expect(response).toBeDefined();
				done();
			});
	});

	it('on location filter search hostname', () => {
		const searchText = 'abcd';
		const selectedColumn = 'hostname';
		component.selectedAssetsTempInstance = [
			{
				productId: 'AIR-AP1852I-B-K9',
				description: 'Cisco Aironet 1850 Series Access Points',
				neId: 'NA,KWC193901RS,AIR-AP1852I-B-K9,NA',
				hostname: 'abcd',
				installLocation: null,
				productType: 'Wireless',
			},
		];
		component.searchData(searchText, selectedColumn);
		expect(component.selectedAssets).toEqual([]);
	});

	it('on location filter search hostname with different value in searchtext', () => {
		const searchText = 'abcd';
		const selectedColumn = 'hostname';
		component.selectedAssetsTempInstance = [
			{
				productId: 'AIR-AP1852I-B-K9',
				description: 'Cisco Aironet 1850 Series Access Points',
				neId: 'NA,KWC193901RS,AIR-AP1852I-B-K9,NA',
				hostname: 'abcde',
				installLocation: null,
				productType: 'Wireless',
			},
		];
		component.searchData(searchText, selectedColumn);
		expect(component.selectedAssets).toHaveLength(1);
	});

	it('on location filter search description', () => {
		const searchText = 'Cisco Aironet 1850 Series Access Points';
		const selectedColumn = 'description';
		component.selectedAssetsTempInstance = [
			{
				productId: 'AIR-AP1852I-B-K9',
				description: 'Cisco Aironet 1850 Series Access Points',
				neId: 'NA,KWC193901RS,AIR-AP1852I-B-K9,NA',
				hostname: 'abcdef',
				installLocation: null,
				productType: 'Wireless',
			},
		];
		component.searchData(searchText, selectedColumn);
		expect(component.selectedAssets).toEqual([]);
	});

	it('on location filter search description with branch of different description', () => {
		const searchText = 'Cisco Aironet 1850 Series Access Points';
		const selectedColumn = 'description';
		component.selectedAssetsTempInstance = [
			{
				productId: 'AIR-AP1852I-B-K9',
				description: 'Cisco Aironet 1850 Series Access Points Series',
				neId: 'NA,KWC193901RS,AIR-AP1852I-B-K9,NA',
				hostname: 'abcdef',
				installLocation: null,
				productType: 'Wireless',
			},
		];
		component.searchData(searchText, selectedColumn);
		expect(component.selectedAssets).toHaveLength(1);
	});

	it('on location filter search productId', () => {
		const searchText = 'AIR-AP1852I-B-K9';
		const selectedColumn = 'productId';
		component.selectedAssetsTempInstance = [
			{
				productId: 'AIR-AP1852I-B-K9',
				description: 'Cisco Aironet 1850 Series Access Points',
				neId: 'NA,KWC193901RS,AIR-AP1852I-B-K9,NA',
				hostname: 'abcdef',
				installLocation: null,
				productType: 'Wireless',
			},
		];
		component.searchData(searchText, selectedColumn);
		expect(component.selectedAssets).toEqual([]);
	});

	it('on location filter search productId with branch of different productId', () => {
		const searchText = 'AIR-AP1852I-B-K9';
		const selectedColumn = 'productId';
		component.selectedAssetsTempInstance = [
			{
				productId: 'AIR-AP1852I-B-K9-ZU',
				description: 'Cisco Aironet 1850 Series Access Points',
				neId: 'NA,KWC193901RS,AIR-AP1852I-B-K9,NA',
				hostname: 'abcdef',
				installLocation: null,
				productType: 'Wireless',
			},
		];
		component.searchData(searchText, selectedColumn);
		expect(component.selectedAssets).toHaveLength(1);
	});

	it('on location filter search neId', () => {
		const searchText = 'Wireless';
		const selectedColumn = 'productType';
		component.selectedAssetsTempInstance = [
			{
				productId: 'AIR-AP1852I-B-K9',
				description: 'Cisco Aironet 1850 Series Access Points',
				neId: 'NA,KWC193901RS,AIR-AP1852I-B-K9,NA',
				hostname: 'abcdef',
				installLocation: null,
				productType: 'Wireless',
			},
		];
		component.searchData(searchText, selectedColumn);
		expect(component.selectedAssets).toHaveLength(0);
	});

	it('on location filter search neId for different branch for product type', () => {
		const searchText = 'Wireless';
		const selectedColumn = 'productType';
		component.selectedAssetsTempInstance = [
			{
				productId: 'AIR-AP1852I-B-K9',
				description: 'Cisco Aironet 1850 Series Access Points',
				neId: 'NA,KWC193901RS,AIR-AP1852I-B-K9,NA',
				hostname: 'abcdef',
				installLocation: null,
				productType: 'Wireless Devices',
			},
		];
		component.searchData(searchText, selectedColumn);
		expect(component.selectedAssets).toHaveLength(0);
	});

	it('should call validateGroupname else condition', () => {
		component.isEdit = false;
		jest.spyOn(component, 'validateGroupname');
		fixture.detectChanges();
		component.validateGroupname();
		// TODO This is not a test, there is no expect.
	});

	it('should call validateGroupname if condition', () => {
		component.isEdit = true;
		component.groupName = 'test';
		component.AssetGroup = { groupName: 'test' };
		jest.spyOn(component, 'validateGroupname');
		fixture.detectChanges();
		component.validateGroupname();
		expect(component.validGroupName).toBeFalsy();
	});

	it('should return error for getAssetGroupsList', (done) => {
		let controlPointAssetGroupServiceFake: ControlPointAssetGroupService;
		controlPointAssetGroupServiceFake = TestBed.inject(
			ControlPointAssetGroupService,
		);
		jest
			.spyOn(controlPointAssetGroupServiceFake, 'getAssetGroupList')
			.mockReturnValue(
				throwError(
					new HttpErrorResponse({
						status: 404,
						statusText: 'Resource not found',
					}),
				),
			);
		const getAssetGroupListParams: any = {
			customerId: component.customerId,
			page: 1,
			rows: component.ROWS_PER_PAGE,
		};
		let queryParams = '&sort=groupName:asc';
		const groupName = 'test';
		queryParams = `${queryParams}&search=${encodeURIComponent(groupName)}`;
		component.getAssetGroupsList();
		controlPointAssetGroupServiceFake
			.getAssetGroupList(getAssetGroupListParams, queryParams)
			.subscribe({
				error: (err: unknown) => {
					// TODO(CACC-4817): Proper type guarding
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					expect((err as any).statusText).toEqual('Resource not found');
					done();
				},
			});
	});

	it('should return success for getAssetGroupsList', (done) => {
		const dummyData = {
			data: [
				{
					groupId: 5022,
					groupName: 'assets-only',
					type: 'default',
					assetCount: 150,
				},
				{
					groupId: 123,
					groupName: 'test',
					type: 'default',
					assetCount: 150,
				},
				{
					groupId: 3442,
					groupName: 'group-test',
					type: 'default',
					assetCount: 100,
				},
			],
			pagination: {
				page: 1,
				pages: 1,
				rows: 3,
				total: 3,
			},
		};
		component.groupName = 'test';
		const getAssetGroupListParams: any = {
			customerId: component.customerId,
			page: 1,
			rows: component.ROWS_PER_PAGE,
		};
		let queryParams = '&sort=groupName:asc';
		const groupName = 'test';
		queryParams = `${queryParams}&search=${encodeURIComponent(groupName)}`;
		let controlPointAssetGroupServiceFake: ControlPointAssetGroupService;
		controlPointAssetGroupServiceFake = TestBed.inject(
			ControlPointAssetGroupService,
		);
		jest
			.spyOn(controlPointAssetGroupServiceFake, 'getAssetGroupList')
			.mockReturnValue(of(<any>dummyData));
		component.getAssetGroupsList();
		controlPointAssetGroupServiceFake
			.getAssetGroupList(getAssetGroupListParams, queryParams)
			.subscribe((res) => {
				expect(res).toBeDefined();
				done();
			});
	});

	it('should call on else condition on search results', () => {
		const data = {};
		jest.spyOn(component, 'searchResults');
		component.searchResults(data);
		fixture.detectChanges();

		// TODO This is not a test, there is no expect.
	});

	it('should handle the else condition for isAllselected in handleResults function', () => {
		const response = {
			data: [
				{
					productId: 'AIR-AP1852I-B-K9',
					description: 'Cisco Aironet 1850 Series Access Points',
					neId: 'NA,KWC193901RS,AIR-AP1852I-B-K9,NA',
					hostname: 'AP1850',
					installLocation: null,
					productType: 'Wireless',
				},
			],
			Pagination: {
				page: 1,
				pages: 2,
				rows: 10,
				total: 1,
			},
		};
		component.selectedAssets = [
			{
				description: '',
				hostname: '',
				installLocation: null,
				isSelected: true,
				neId: '10.127.102.214,56456e40-876b-4861-9f8b-331ff26cf1b2,NA,NA',
				productId: 'NA',
				productType: 'Unknown',
			},
		];
		component.showOnlyAssets = true;
		component.isAllSelected = false;
		component.isEdit = true;
		component.AssetGroup = { groupName: 'test' };
		component.selectedNeIds = ['neId5', 'neId6'];
		component.handleResults(response);
		expect(component.assetsData).toEqual(component.selectedAssets);
		expect(component.totalRows).toEqual(response.Pagination.total);
	});

	it('should handle the else condition for searchmode true in handleResults function', () => {
		const response = {
			data: [
				{
					productId: 'AIR-AP1852I-B-K9',
					description: 'Cisco Aironet 1850 Series Access Points',
					neId: 'NA,KWC193901RS,AIR-AP1852I-B-K9,NA',
					hostname: 'AP1850',
					installLocation: null,
					productType: 'Wireless',
				},
			],
			Pagination: {
				page: 1,
				pages: 2,
				rows: 10,
				total: 1,
			},
		};
		component.showOnlyAssets = false;
		component.isAllSelected = false;
		component.isEdit = true;
		component.AssetGroup = { groupName: 'test' };
		component.selectedNeIds = ['neId5', 'neId6'];
		component.handleResults(response);
		expect(component.assetsData).toEqual(response.data);
		expect(component.totalRows).toEqual(response.Pagination.total);
	});

	it('should handle the else condition for searchmode false in handleResults function', () => {
		const response = {
			data: [
				{
					productId: 'AIR-AP1852I-B-K9',
					description: 'Cisco Aironet 1850 Series Access Points',
					neId: 'NA,KWC193901RS,AIR-AP1852I-B-K9,NA',
					hostname: 'AP1850',
					installLocation: null,
					productType: 'Wireless',
				},
			],
			Pagination: {
				page: 1,
				pages: 2,
				rows: 10,
				total: 1,
			},
		};
		component.showOnlyAssets = false;
		component.isAllSelected = false;
		component.isEdit = true;
		component.AssetGroup = { groupName: 'test' };
		component.selectedNeIds = ['neId5', 'neId6'];
		component.handleResults(response);
		expect(component.assetsData).toEqual(response.data);
		expect(component.totalRows).toEqual(response.Pagination.total);
		expect(component.totalPages).toEqual(response.Pagination.pages);
	});

	it('should send error message on error code', () => {
		const code = {
			error: {
				code: 'CX_CONTROLPOINT_NO_DATA',
			},
		};
		const message = 'No Results Found';

		const errorMessage = component.getErrorMessage(code);
		expect(errorMessage).toBe(message);
	});

	it('set assetGroupDropdown value to false on closing the asset group modal', () => {
		const closeButton = screen.getByTestId('addAssetHide');
		userEvent.click(closeButton);
		expect(component.assetGroupDropdown).toBe(false);
	});
});

@Component({
	selector: 'cpxe-dropdown-search',
	template: ``,
})
class MockDropdownSearchComponent {
	@Input() refreshOnEmpty = false;
	@Input() assetDropdown: boolean;

	@Output() searchResults = new EventEmitter<any>();
	@Output() searchString = new EventEmitter<any>();
	@Output() searchCategory = new EventEmitter<any>();
	@Output() loading = new EventEmitter<boolean>();
	@Input() searchText: string;
	@Input() passDefaultParams;
	// use service data-binding to get service object from parent component
	@Input() service: any;
	@Input() categoryParamName: string;
	@Input() searchParamName = 'search';
	@Input() autoDataRefresh = true;
	@Input() searchOptions: {
		pattern?: any;
	};
	@Input() isV3CxuiTableAdoptionEnabled = false;
	@Input()
	typeaheadItems: Array<{
		displayLongName: string;
		displayShortName: string;
		paramValue: string;
		placeholder?: string;
	}>;
}

interface AssetGroupServiceData {
	getAssetsGridData: AssetGroupAssetsResponseModel;
	updateAssetGroup: EditAssetGroupResponse;
	updateAssetGroupUsingPATCH: unknown;
	getAssetsByGroup: unknown;
	getProductTypeFiltersList?: string[];
	getLocationFiltersList?: string[];
}

describe('AddAssetGroupComponent - SIFERS', () => {
	async function setup(
		{
			isEnableV3ComponentsAddAssetGroup,
			isEdit,
			isContractNumberVisibleInAddAssetGroup,
		}: Partial<{
			isEnableV3ComponentsAddAssetGroup: boolean;
			isEdit: boolean;
			isContractNumberVisibleInAddAssetGroup: boolean;
		}> = {
			isEnableV3ComponentsAddAssetGroup: false,
			isEdit: false,
			isContractNumberVisibleInAddAssetGroup: false,
		},
		{
			getAssetsGridData,
			updateAssetGroup,
			updateAssetGroupUsingPATCH,
			getAssetsByGroup,
			getProductTypeFiltersList,
			getLocationFiltersList,
		}: Partial<AssetGroupServiceData> = {
			getAssetsGridData: {},
			updateAssetGroup: {},
			updateAssetGroupUsingPATCH: {},
			getAssetsByGroup: {},
		},
	) {
		const mockAssetGroupService: Spy<ControlPointAssetGroupService> =
			createSpyFromClass(ControlPointAssetGroupService, {
				observablePropsToSpyOn: ['reloadAssetGroupList'],
			});
		mockAssetGroupService.getAssetsGridData.nextWith(getAssetsGridData);
		mockAssetGroupService.createAssetGroup.nextWith();
		mockAssetGroupService.updateAssetGroup.nextWith(updateAssetGroup);
		mockAssetGroupService.updateAssetGroupUsingPATCH.nextWith(
			updateAssetGroupUsingPATCH,
		);
		mockAssetGroupService.getAssetsByGroup.nextWith(getAssetsByGroup);
		mockAssetGroupService.getProductTypeFiltersList.nextWith(
			getProductTypeFiltersList,
		);
		mockAssetGroupService.getLocationFiltersList.nextWith(
			getLocationFiltersList,
		);

		const mockSplitIoService: Spy<SplitIoService> = createSpyFromClass(
			SplitIoService,
			{
				methodsToSpyOn: ['isSplitEnabled'],
			},
		);
		mockSplitIoService.isSplitEnabled.mockImplementation(
			(splitTreatment: SplitTreatment) => {
				switch (splitTreatment) {
					case SplitTreatment.FE_CCFC_61417_ENABLEV3COMPONENTS_ADDASSETGROUP:
						return of(isEnableV3ComponentsAddAssetGroup);
					case SplitTreatment.FE_CCFC67053_ENABLE_CONTRACT_NUMBER_IN_ADD_ASSET_GROUP:
						return of(isContractNumberVisibleInAddAssetGroup);
					default:
						return of(true);
				}
			},
		);
		const mockStateAdapter = createSpyFromClass(StateAdapter, {
			observablePropsToSpyOn: ['customerId$', 'user$'],
		});

		mockStateAdapter.user$.nextWith({});
		mockStateAdapter.customerId$.nextWith('1234');

		const mockMixpanelFeedbackService: Spy<MixpanelFeedbackService> =
			createSpyFromClass(MixpanelFeedbackService, {
				methodsToSpyOn: ['track'],
			});

		const result = await render(AddAssetGroupComponent, {
			componentProperties: {
				isEdit: isEdit,
				selectedAssetsList: [{}, {}],
			},
			imports: [
				CommonModule,
				FormsModule,
				ReactiveFormsModule,
				CuiSpinnerModule,
				CuiSearchModule,
				FullWidthBannerModule,
				PaginatorModule,
				TableCdkModule,
				LoaderModule,
				SearchModule,
				OktaAuthServiceTestModule,
				RouterTestingModule,
			],
			declarations: [MockDropdownSearchComponent],
			providers: [
				{
					provide: ControlPointAssetGroupService,
					useValue: mockAssetGroupService,
				},
				{
					provide: MixpanelFeedbackService,
					useValue: mockMixpanelFeedbackService,
				},
				{
					provide: SplitIoService,
					useValue: mockSplitIoService,
				},
				{
					provide: StateAdapter,
					useValue: mockStateAdapter,
				},
				provideMockStore(),
			],
		});
		const componentInstance = result.fixture.componentInstance;
		const fixture = result.fixture;
		return {
			componentInstance,
			fixture,
			mockAssetGroupService,
		};
	}

	describe('when the feature flag FE_CCFC_61417_ENABLEV3COMPONENTS_ADDASSETGROUP is turned ON', () => {
		it('cxui input component should be rendered for the updateOptInOutStatus', async () => {
			await setup({ isEnableV3ComponentsAddAssetGroup: true });

			expect(
				screen.getByTestId('cp-update-optInOutStatus-v3'),
			).toBeInTheDocument();
		});
		describe('when isEdit input is false', () => {
			it('should render add asset group save cxui-button', async () => {
				await setup({ isEnableV3ComponentsAddAssetGroup: true });

				expect(
					screen.getByTestId('cp-add-asset-group-save-btn-v3'),
				).toBeInTheDocument();
			});
		});

		describe('when isEdit input is true', () => {
			it('should render add asset group save cxui-button', async () => {
				await setup({
					isEnableV3ComponentsAddAssetGroup: true,
					isEdit: true,
				});

				expect(
					screen.getByTestId('cp-edit-asset-group-save-btn-v3'),
				).toBeInTheDocument();
			});
		});

		it('v3 asset group name input should be rendered', async () => {
			await setup({
				isEnableV3ComponentsAddAssetGroup: true,
				isEdit: true,
			});

			expect(
				screen.getByTestId('cp-asset-groupname-input-v3'),
			).toBeInTheDocument();
		});

		describe('After location filters loaded', () => {
			const mockAssetDataResponse = {
				data: [
					{
						productId: 'AIR-AP1852I-B-K9',
						description: 'Cisco Aironet 1850 Series Access Points',
						neId: '1.2.3.4,SIM12246100,MR52-HW,NA',
						hostname: 'AP1850',
						installLocation: '1',
						productType: 'Wireless',
						contractNumber: '21456',
					},
					{
						productId: 'AIR-ABXI-K7',
						description: 'Cisco BLADE',
						neId: '10.35.48.128,FDO22411M3T,N9K-C93180YC-FX,NA',
						hostname: 'AP270',
						installLocation: '1',
						productType: 'Wireless',
						contractNumber: '21486',
					},
				],
				Pagination: {
					page: 1,
					pages: 1,
					rows: 2,
					total: 2,
				},
			};
			const mockAssetGroupResponse = {
				neIds: [
					'1.2.3.4,SIM12246100,MR52-HW,NA',
					'10.35.48.128,FDO22411M3T,N9K-C93180YC-FX,NA',
				],
			};
			it('should render cxui search component for locations', async () => {
				await setup(
					{
						isEnableV3ComponentsAddAssetGroup: true,
						isEdit: true,
					},
					{
						getLocationFiltersList: ['1', '2'],
					},
				);

				expect(screen.getByTestId('cp-location-search-v3')).toBeInTheDocument();
			});

			it('calls the all assets API with correct params when location filters are selected', fakeAsync(async () => {
				const { mockAssetGroupService } = await setup(
					{
						isEnableV3ComponentsAddAssetGroup: true,
						isEdit: true,
					},
					{
						getAssetsGridData: mockAssetDataResponse,
						getAssetsByGroup: mockAssetGroupResponse,
						getProductTypeFiltersList: ['1', '2'],
						getLocationFiltersList: ['MockLocation1', 'MockLocation2'],
					},
				);

				const locationFilterCheckboxes = screen.getAllByTestId(
					'cp-asset-group-location-filter',
				);
				userEvent.click(locationFilterCheckboxes[0]);
				tick(1000); // Added this because of debounce time added in the service call
				const assetRequest = {
					customerId: '1234',
					page: 1,
					rows: 10,
					search: undefined,
					searchFields: null,
					sort: 'hostname',
					sortOrder: 'asc',
					userGroup: '',
				};

				expect(mockAssetGroupService.getAssetsGridData).toBeCalledWith(
					assetRequest,
					`&sort=${encodeURIComponent(
						'hostname:asc',
					)}&installLocation=MockLocation1`,
				);
			}));

			it('calls the all assets API with correct params when location and technology filters are selected', fakeAsync(async () => {
				const { mockAssetGroupService } = await setup(
					{
						isEdit: true,
					},
					{
						getAssetsGridData: mockAssetDataResponse,
						getAssetsByGroup: mockAssetGroupResponse,
						getProductTypeFiltersList: ['tech1', 'tech2'],
						getLocationFiltersList: ['MockLocation1', 'MockLocation2'],
					},
				);

				const locationFilterCheckboxes = screen.getAllByTestId(
					'cp-asset-group-location-filter',
				);
				userEvent.click(locationFilterCheckboxes[0]);
				const technologyFilterCheckboxes = screen.getAllByTestId(
					'cpAssetGroupTechnologyFilter',
				);
				userEvent.click(technologyFilterCheckboxes[0]);
				tick(1000); // Added this because of debounce time added in the service call
				const assetRequest = {
					customerId: '1234',
					page: 1,
					rows: 10,
					search: undefined,
					searchFields: null,
					sort: 'hostname',
					sortOrder: 'asc',
					userGroup: '',
				};

				expect(mockAssetGroupService.getAssetsGridData).toHaveBeenNthCalledWith(
					2,
					assetRequest,
					`&sort=${encodeURIComponent(
						'hostname:asc',
					)}&installLocation=MockLocation1&productType=tech1`,
				);
			}));

			it('should render locations data with cxui-checkbox component', async () => {
				const { mockAssetGroupService } = await setup({
					isEnableV3ComponentsAddAssetGroup: true,
					isEdit: true,
				});

				mockAssetGroupService.getAssetsGridData.nextWith({});
				mockAssetGroupService.createAssetGroup.nextWith();
				mockAssetGroupService.updateAssetGroup.nextWith({});
				mockAssetGroupService.updateAssetGroupUsingPATCH.nextWith({});
				mockAssetGroupService.getProductTypeFiltersList.nextWith([]);
				mockAssetGroupService.getAssetsByGroup.nextWith({});
				mockAssetGroupService.getLocationFiltersList.nextWith([
					'MockLocation1',
					'MockLocation2',
				]);

				const locationList = screen.getByTestId('cp-location-list').children;

				Array.from(locationList).forEach(function (location) {
					expect(
						location.firstElementChild.firstElementChild.hasAttribute(
							'cxui-checkbox',
						),
					).toBe(true);
				});
			});
		});

		describe('After ProductType filters loaded', () => {
			it('should render cxui search component for ProductType', async () => {
				await setup(
					{
						isEnableV3ComponentsAddAssetGroup: true,
						isEdit: true,
					},
					{
						getProductTypeFiltersList: ['1', '2'],
						getLocationFiltersList: ['1', '2'],
					},
				);

				expect(
					screen.getByTestId('cp-product-type-search-v3'),
				).toBeInTheDocument();
			});

			it('should render ProductType data with cxui-checkbox component', async () => {
				await setup({
					isEnableV3ComponentsAddAssetGroup: true,
					isEdit: true,
				});

				const locationList = screen.getByTestId(
					'cp-product-type-list',
				).children;
				Array.from(locationList).forEach(function (location) {
					expect(
						location.firstElementChild.firstElementChild.hasAttribute(
							'cxui-checkbox',
						),
					).toBe(true);
				});
			});
		});
	});

	describe('when the feature flag FE_CCFC_61417_ENABLEV3COMPONENTS_ADDASSETGROUP is turned OFF', () => {
		it('cui input component should be rendered for the updateOptInOutStatus', async () => {
			await setup();

			expect(
				screen.getByTestId('cp-update-optInOutStatus'),
			).toBeInTheDocument();
		});
		describe('when isEdit input is false', () => {
			it('should render add asset group save buttons', async () => {
				await setup(
					{},
					{
						//		getLocationFiltersList: ['1', '2'],
					},
				);

				expect(
					screen.getByTestId('cp-add-asset-group-save-btn'),
				).toBeInTheDocument();
			});
		});

		describe('when isEdit input is true', () => {
			it('should render add asset group save buttons', async () => {
				await setup(
					{
						isEdit: true,
					},
					{
						//			getLocationFiltersList: ['1', '2'],
					},
				);

				expect(
					screen.getByTestId('cp-edit-asset-group-save-btn'),
				).toBeInTheDocument();
			});
		});
		it('asset group name input should be rendered', async () => {
			await setup(
				{},
				{
					//	getLocationFiltersList: ['1', '2'],
				},
			);

			expect(
				screen.getByTestId('cp-asset-groupname-input'),
			).toBeInTheDocument();
		});

		describe('After location filters loaded', () => {
			it('should render cxui search component for locations', async () => {
				await setup(
					{
						isEdit: true,
					},
					{
						getLocationFiltersList: ['1', '2'],
					},
				);

				expect(screen.getByTestId('cp-location-search')).toBeInTheDocument();
			});
		});

		it('should render locations data without cxui-checkbox component', async () => {
			await setup({
				isEdit: true,
			});

			const locationList = screen.getByTestId('cp-location-list').children;
			Array.from(locationList).forEach(function (location) {
				expect(
					location.firstElementChild.firstElementChild.hasAttribute(
						'cxui-checkbox',
					),
				).toBe(false);
			});
		});

		describe('After ProductType filters loaded', () => {
			const mockAssetDataResponse = {
				data: [
					{
						productId: 'AIR-AP1852I-B-K9',
						description: 'Cisco Aironet 1850 Series Access Points',
						neId: '1.2.3.4,SIM12246100,MR52-HW,NA',
						hostname: 'AP1850',
						installLocation: '1',
						productType: 'Wireless',
						contractNumber: '21456',
					},
					{
						productId: 'AIR-ABXI-K7',
						description: 'Cisco BLADE',
						neId: '10.35.48.128,FDO22411M3T,N9K-C93180YC-FX,NA',
						hostname: 'AP270',
						installLocation: '1',
						productType: 'Wireless',
						contractNumber: '21486',
					},
				],
				Pagination: {
					page: 1,
					pages: 1,
					rows: 2,
					total: 2,
				},
			};
			const mockAssetGroupResponse = {
				neIds: [
					'1.2.3.4,SIM12246100,MR52-HW,NA',
					'10.35.48.128,FDO22411M3T,N9K-C93180YC-FX,NA',
				],
			};
			it('should render search component for ProductType', async () => {
				await setup(
					{
						isEdit: true,
					},
					{
						getLocationFiltersList: ['1', '2'],
						getProductTypeFiltersList: ['1', '2'],
					},
				);

				expect(
					screen.getByTestId('cp-product-type-search'),
				).toBeInTheDocument();
			});

			it('should render ProductType data without cxui-checkbox component', async () => {
				await setup(
					{
						isEdit: true,
					},
					{
						//		getLocationFiltersList: ['1', '2'],
						//		getProductTypeFiltersList: ['1', '2'],
					},
				);

				const locationList = screen.getByTestId(
					'cp-product-type-list',
				).children;
				Array.from(locationList).forEach(function (location) {
					expect(
						location.firstElementChild.firstElementChild.hasAttribute(
							'cxui-checkbox',
						),
					).toBe(false);
				});
			});

			it('renders the count for selected assets after filters are selected', async () => {
				await setup(
					{
						isEdit: true,
					},
					{
						getAssetsGridData: mockAssetDataResponse,
						getAssetsByGroup: mockAssetGroupResponse,
						getLocationFiltersList: ['MockLocation11', 'MockLocation22'],
						getProductTypeFiltersList: ['1', '2'],
					},
				);

				const allAssetCheckbox = screen.getByTestId(
					'cp-add-asset-group-select-all',
				);
				userEvent.click(allAssetCheckbox);
				const locationFilterCheckboxes = screen.getAllByTestId(
					'cp-asset-group-location-filter',
				);
				userEvent.click(locationFilterCheckboxes[0]);

				const assetNumber = screen.findByTestId('ShowingAssetsCount');
				expect((await assetNumber).textContent).toBe(
					'Showing 2 of 2 total assets ',
				);

				const selectedAssetNumber = screen.findByTestId(
					'ShowingSelAssetsCount',
				);
				expect((await selectedAssetNumber).textContent).toBe(
					' | 2 assets selected for this group ',
				);
			});

			it('renders the table with contractNumber when the feature flag is on', async () => {
				await setup(
					{
						isEdit: true,
						isContractNumberVisibleInAddAssetGroup: true,
						isEnableV3ComponentsAddAssetGroup: true,
					},
					{
						getAssetsGridData: mockAssetDataResponse,
						getAssetsByGroup: mockAssetGroupResponse,
						//		getLocationFiltersList: ['MockLocation11', 'MockLocation22'],
						//	getProductTypeFiltersList: ['1', '2'],
					},
				);

				expect(
					screen.queryByTestId('cpContractNumberField'),
				).toBeInTheDocument();
			});

			it('renders the table without contractNumber when the feature flag is off', async () => {
				await setup(
					{
						isEdit: true,
						isContractNumberVisibleInAddAssetGroup: false,
						isEnableV3ComponentsAddAssetGroup: true,
					},
					{
						getAssetsGridData: mockAssetDataResponse,
						getAssetsByGroup: mockAssetGroupResponse,
						//			getLocationFiltersList: ['MockLocation11', 'MockLocation22'],
						//		getProductTypeFiltersList: ['1', '2'],
					},
				);

				expect(
					screen.queryByTestId('cpContractNumberField'),
				).not.toBeInTheDocument();
			});
		});
	});
});
