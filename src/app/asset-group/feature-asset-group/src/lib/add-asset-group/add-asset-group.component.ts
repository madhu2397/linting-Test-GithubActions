import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AlertVariant } from '@cisco-bpa-platform/cxui-components/alert';
import { ButtonVariant } from '@cisco-bpa-platform/cxui-components/button';
import { ColumnConfItem } from '@cisco-bpa-platform/cxui-components/column-selector';
import { PageEvent } from '@cisco-bpa-platform/cxui-components/paginator';
import { Sort } from '@cisco-bpa-platform/cxui-components/table-cdk';
import { ToastService } from '@cisco-bpa-platform/data-access-services/alert';
import { AssetGroup, AssetGroupRequest, AssetGroupResponse, AssetGroupSaveRequest, AssetGroupService, displayOption, Filter, Filters, GroupTypes, SelectionAttribute } from '@cisco-bpa-platform/data-access-services/asset-group';
import { Asset, AssetManagerService, AssetResponse } from '@cisco-bpa-platform/data-access-services/asset-manager';
import { InMemoryService } from '@cisco-bpa-platform/data-access-services/cache';
import { CustomTableShell, CustomTableShellComponent, TableColumn } from '@cisco-bpa-platform/spogui-components/custom-table-shell';

@Component({
	selector: 'cisco-bpa-platform-add-asset-group',
	styleUrls: ['./add-asset-group.component.scss'],
	templateUrl: './add-asset-group.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class AddAssetGroupComponent implements OnInit {
	selectedGroupType: GroupTypes = GroupTypes.static;
	staticAssetGroup = true;
	assetSelectionGroup: FormGroup = new FormGroup([]);
	filterCriteria: Filters = { filters: [] };
	assetsData: CustomTableShell;
	displayedColumns: string[]
	currentPage = 1;
	totalPages = 0;
	itemsPerPage = 10;
	loading = false;
	dropdownOptions: SelectionAttribute[] = [] as SelectionAttribute[];
	modalHeading = `Create Asset Group`;
	showErrorGroupNameValidation = false;
	groupName = '';
	validGroupName = false;
	@Output() visibleComponent = new EventEmitter<boolean>();
	@Input() isEdit!: boolean;
	_selectedAssetGroupForEdit: AssetGroup = {} as AssetGroup;
	isAllRowsSelected = false;
	@Input() set selectedAssetGroupForEdit(value: AssetGroup) {
		if (this.isEdit) {
			this.modalHeading = `Edit Asset Group`;
			this._selectedAssetGroupForEdit = value;
			this.groupName = this._selectedAssetGroupForEdit.name;
			this.staticAssetGroup = this._selectedAssetGroupForEdit.groupType === GroupTypes.static
			if (this.staticAssetGroup) {
				this.showOnlyAssets = true;
			}
			this.enableRowSelection = this._selectedAssetGroupForEdit.groupType === GroupTypes.static;
			this.selectedGroupType = this._selectedAssetGroupForEdit.groupType;
		}
	}
	shownAssetsData: Asset[] = [];
	totalRows = 0;
	alertMessage = '';
	alertVariant = AlertVariant.CRITICAL;
	selectedAssetsCountForEdit = 0;
	selectedAssetsCount = 0;
	showOnlyAssets = false;
	secondaryButton: ButtonVariant = ButtonVariant.SECONDARY
	isAllSelected = false;
	isSelectAll = false;
	selectedAssets: Asset[] = [];
	selectionChangedEdit = false;
	error = false;
	modalLoading = false;
	@ViewChild(CustomTableShellComponent) devicesGrid!: CustomTableShellComponent
	enableRowSelection = true;
	sortColumn = "";
	sortDirection = "";
	selectedRows: Asset[] = [];
	public excludeCriteria: string[] = [];
	get resetDisabled() {
		return !(this.selectedRows.length > 0)
	}
	columnsConf: ColumnConfItem[] = [];
	columnSelectorOpen = false;
	displayColumns: string[] = [];
	constructor(private assetGroupService: AssetGroupService, public fb: FormBuilder, private assetManagerService: AssetManagerService, private toast: ToastService, private inMemoryService: InMemoryService) {
		this.assetsData = new CustomTableShell();
		this.assetsData.tableData = [];
		this.assetsData.currentPage = 1;
		this.assetsData.itemsPerPage = 10;
		this.assetsData.tableColumns = [];
		this.assetsData.enableRowSelection = true;
		this.assetsData.enableDropdownSearch = false;
		let tableColumn: TableColumn =
		{
			name: "Name",
			attributeName: "name",
			sortable: true,
			filterable: true,
			defaultSorted: true,
			mandatory: true,
			visible: true
		}
		this.assetsData.tableColumns.push(tableColumn);
		let columnDef = { key: tableColumn.attributeName, name: tableColumn.name, locked: true, display: true };
		this.columnsConf.push(columnDef)
		tableColumn = {
			name: "Description",
			attributeName: "description",
			sortable: true,
			filterable: true,
			defaultSorted: false,
			mandatory: true,
			visible: true
		}
		this.assetsData.tableColumns.push(tableColumn);
		columnDef = { key: tableColumn.attributeName, name: tableColumn.name, locked: true, display: true };
		this.columnsConf.push(columnDef)
		tableColumn = {
			name: "IP Address",
			attributeName: "address",
			sortable: true,
			filterable: true,
			defaultSorted: false,
			mandatory: true,
			visible: true
		}
		this.assetsData.tableColumns.push(tableColumn);
		columnDef = { key: tableColumn.attributeName, name: tableColumn.name, locked: true, display: true };
		this.columnsConf.push(columnDef)
		tableColumn = {
			name: "Managed By",
			attributeName: "controller_id",
			sortable: true,
			filterable: true,
			defaultSorted: false,
			mandatory: true,
			visible: true
		}
		this.assetsData.tableColumns.push(tableColumn);
		columnDef = { key: tableColumn.attributeName, name: tableColumn.name, locked: true, display: true };
		this.columnsConf.push(columnDef)
		tableColumn = {
			name: "Location",
			attributeName: "latitude",
			sortable: true,
			filterable: true,
			defaultSorted: false,
			mandatory: true,
			visible: true
		}
		this.assetsData.tableColumns.push(tableColumn);
		columnDef = { key: tableColumn.attributeName, name: tableColumn.name, locked: true, display: true };
		this.columnsConf.push(columnDef)
		this.setDisplayColumns();
		this.displayedColumns = ['hostname', 'description', 'address', 'latitude', 'controller_id', 'osType', 'osVersion', 'controllerType'];
	}
	setDisplayColumns(gridColumns: ColumnConfItem[] = []) {
		this.displayColumns = [];
		this.assetsData.tableColumns.forEach(tableColumn => {
			gridColumns.forEach((data) => {
				if (!data.locked && data.display) {
					if (data.key === tableColumn.attributeName) {
						tableColumn.visible = true;
					}
				} else if (!data.locked && !data.display) {
					if (data.key === tableColumn.attributeName) {
						tableColumn.visible = false;
					}
				}
			})
			if (tableColumn.visible) {
				this.displayColumns.push(tableColumn.attributeName as string);
			}
		})
	}
	ngOnInit() {
		this.loading = false;

		this.assetGroupService.fetchAssetattributes().subscribe((data: SelectionAttribute[]) => {
			this.dropdownOptions = data
			if (this._selectedAssetGroupForEdit && this._selectedAssetGroupForEdit.criteria) {
				const excludeCriteria = this._selectedAssetGroupForEdit.criteria.filters.filter(f => f.exclude && f.exclude === true);
				excludeCriteria.forEach(f => {
					const criteriaOption = this.dropdownOptions.find(d => d.attributeName === f.name);
					if (criteriaOption) {
						this.excludeCriteria.push(criteriaOption.displayName);
					}
				})
			}
			const group: any = {}
			//{[K in keyof T]: ɵElement<T[K], null>;}= {};
			this.dropdownOptions.forEach(async question => {
				if (this.isEdit && this._selectedAssetGroupForEdit && !this.staticAssetGroup) {
					const searchCriteria = this._selectedAssetGroupForEdit.criteria.filters.find((f: Filter) => f.name === question.attributeName);
					const value = searchCriteria ? searchCriteria?.searchterm : '';
					group[question.displayName] = new FormControl(value);
				} else {
					group[question.displayName] = new FormControl('');
				}
				if (question.attributeName === 'osType' && question.displayType === 'select') {
					await this.assetManagerService.getAssetDistinctColumn(question.attributeName, 'unique').subscribe((response: string[]) => {
						const domainDisplayOptions: displayOption[] = [];
						response.forEach((domain: string) => {
							domainDisplayOptions.push({ "displayName": domain, "displayValue": domain })
						});
						question.displayOptions = domainDisplayOptions;
					});
				}
				if (question.attributeName === 'domain') {
					const domainList: any[] = this.inMemoryService.getStore("domainList");
					const domainDisplayOptions: displayOption[] = [];
					if (domainList) {
						domainList.forEach((domain: any) => {
							domainDisplayOptions.push({ "displayName": domain.domain, "displayValue": domain.domain })
						});
					}
					question.displayOptions = domainDisplayOptions;
				}
			});
			this.assetSelectionGroup = this.fb.group(group);
			// if (this.isEdit && !this.staticAssetGroup && this._selectedAssetGroupForEdit.criteria && this._selectedAssetGroupForEdit.criteria.excludeCriteria && this._selectedAssetGroupForEdit.criteria.excludeCriteria.length > 0) {
			// this._selectedAssetGroupForEdit.criteria.excludeCriteria.forEach((controlName: string) => {
			// 	this.assetSelectionGroup.get(controlName)?.disable();
			// })

			// }
			this.assetSelectionGroup.valueChanges.subscribe(value => {
				const filters: Filters = { filters: [] };
				const includedAttributes = Object.keys(value);
				includedAttributes.forEach(attribute => {
					let selectionAttribute;
					if (this.dropdownOptions) {
						selectionAttribute = this.dropdownOptions.find(f => f && f.displayName === attribute)
					}
					const attributeName = selectionAttribute ? selectionAttribute.attributeName : '';
					if (value[attribute] != "") {
						const filter = { name: attributeName, searchterm: value[attribute], exclude: this.getExcludeValue(attribute) };
						filters.filters.push(filter);
					}
				});
				this.currentPage = 1;
				this.selectionChangedEdit = true;
				this.fetchAssetList(filters);
			})
		})
		let value = { filters: [] } as Filters
		if (this.isEdit && !this.staticAssetGroup) {
			this.filterCriteria = this._selectedAssetGroupForEdit.criteria;
			//this.excludeCriteria = this._selectedAssetGroupForEdit.criteria.excludeCriteria ? this._selectedAssetGroupForEdit.criteria.excludeCriteria : [];
			value = this._selectedAssetGroupForEdit.criteria
		}
		this.fetchAssetList(value, this.isEdit);
	}
	getExcludeValue(displayName: string) {
		return this.excludeCriteria.includes(displayName);
	}
	private fetchAssetList(value: Filters, isEdit = false) {
		this.modalLoading = true;
		let filters: Filters = { filters: [] };
		filters = value;
		if (filters.filters.length == 0) {
			const filter = { name: 'name', searchterm: '' };
			filters.filters.push(filter);
		}
		this.filterCriteria = filters;
		if (isEdit && this.staticAssetGroup) {
			this.assetGroupService.fetchAssetGroup(this._selectedAssetGroupForEdit.name, this._selectedAssetGroupForEdit.controller_id, this._selectedAssetGroupForEdit.sub_controller_id, -1, this.currentPage, this.sortColumn, this.sortDirection, []).subscribe((assetGroupResult: AssetGroupResponse) => {
				this.modalLoading = false;
				this.selectedRows = assetGroupResult.body.devices;
				this.selectedRows.forEach((f: Asset) => f.isSelected = true);
				const response = { assets: assetGroupResult.body.devices, totalCount: assetGroupResult.body.totalCount };
				this.setAssetResponseLocalPagination(response);
				this.selectedAssetsCount = this.selectedRows.length;
				//this.setAssetResponse({ assets: assetGroupResult.body.devices, totalCount: assetGroupResult.body.totalCount });
			});
		} else {
			this.assetManagerService.getAssetList(this.currentPage, this.itemsPerPage, this.sortDirection, this.sortColumn, this.filterCriteria).subscribe((data: AssetResponse) => {
				this.modalLoading = false;
				if (data && data.assets && data.assets.length > 0) {
					this.setAssetResponse(data);
				} else {
					this.setAssetResponse(data);
				}
			});
		}
	}

	private setAssetResponseLocalPagination(response: AssetResponse) {
		this.currentPage = response.totalCount < this.itemsPerPage ? 1 : this.currentPage
		this.totalRows = response.totalCount;
		this.assetsData.totalPages = Math.ceil(this.totalRows / this.itemsPerPage);
		this.assetsData.enableRowSelection = true;
		this.assetsData.currentPage = this.currentPage;
		this.assetsData.itemsPerPage = this.itemsPerPage;
		const start = ((this.currentPage - 1) * this.itemsPerPage);
		const end = start + this.itemsPerPage;
		let result = response.assets;
		result = result.slice(start, end);
		if (this.isAllRowsSelected) {
			response.assets.forEach(asset => asset.isSelected = true);
			this.selectedRows = response.assets;
		}
		this.selectedAssetsCount = this.selectedRows.length;
		this.assetsData.tableData = result;
		this.shownAssetsData = result;
		this.setDisplayColumns();
		this.setSelectedForTable();
	}

	private setAssetResponse(response: AssetResponse) {
		this.currentPage = response.totalCount < this.itemsPerPage ? 1 : this.currentPage
		const result = response.assets;
		if (this.isAllRowsSelected) {
			this.selectedRows = result;
		}
		this.totalRows = response.totalCount;
		this.assetsData.totalPages = Math.ceil(this.totalRows / this.itemsPerPage);
		this.assetsData.enableRowSelection = true;
		this.assetsData.currentPage = this.currentPage;
		this.assetsData.itemsPerPage = this.itemsPerPage;
		this.assetsData.tableData = result;
		this.shownAssetsData = result;
		this.setDisplayColumns();
		this.setSelectedForTable();

		this.selectedAssetsCount = this.selectedRows.length;
		if (this.isAllRowsSelected) {
			this.selectedAssetsCount = this.totalRows;
		}
	}

	setSelectedForTable() {
		const assets: Asset[] = [];
		this.assetsData.tableData.forEach(row => {
			const value = this.selectedRows.find(f => f.name === row.name && f.controller_id === row.controller_id);
			if (value) {
				row.isSelected = true;
				assets.push(row)
			}
		})
		this.devicesGrid.selectedRows.clear();
		this.devicesGrid.selectedRows.setSelection(...assets);
	}

	intializeIncludeExclude(controlName: string): boolean {
		const attribute = this.dropdownOptions.find(f => f.displayName === controlName)?.attributeName;
		const checkExclude = this.filterCriteria.filters.find(f => f.name === attribute);
		if (checkExclude && checkExclude.exclude)
			return false;
		return true;
	}
	setIncludeExclude(event: Event, included: boolean, controlName: string) {
		if (!included) {
			this.excludeCriteria.push(controlName);
		} else {
			const index = this.excludeCriteria.indexOf(controlName, 0);
			if (index > -1) {
				this.excludeCriteria.splice(index, 1);
			}
		}
		const filterCriteria = this.filterCriteria.filters.find(f => f.name === this.dropdownOptions.find(f => f.displayName === controlName)?.attributeName);
		if (filterCriteria) {
			filterCriteria.exclude = this.getExcludeValue(controlName);
		}
		this.fetchAssetList(this.filterCriteria);
		this.selectionChangedEdit = true;
		//this.filterCriteria.excludeCriteria = this.excludeCriteria;
	}

	toggleShowAllAssets() {
		this.showOnlyAssets = !this.showOnlyAssets;
		if (this.showOnlyAssets) {
			this.currentPage = 1
			//this.assetsData.currentPage = 1;
			this.setAssetResponse({
				assets: this.selectedRows,
				totalCount: this.selectedRows.length
			})
		} else {
			this.fetchAssetList(this.filterCriteria)
		}
	}

	validateGroupname() {
		this.showErrorGroupNameValidation = false;
		this.alertMessage = '';
		if (
			(/([\p{L}]+)/u.test(this.groupName) &&
				/[!"#$%&'()*+,/:;<=>?@[\]^`{|}~]/.test(this.groupName)) ||
			/[!"#$%&'()*+,/:;<=>?@[\]^`{|}~]/.test(this.groupName)
		) {
			this.showErrorGroupNameValidation = true;
			this.validGroupName = false;
		} else {
			this.showErrorGroupNameValidation = false;
			this.validGroupName = true;
		}
	}




	createRequest(): AssetGroupRequest {
		const request: AssetGroupRequest = {};
		request.page = this.currentPage;
		request.rows = this.itemsPerPage;
		request.sortColumn = this.sortColumn;
		request.sortDirection = this.sortDirection;
		return request;
	}
	onPageChange(event: PageEvent) {

		this.currentPage = event.current;
		if (this.showOnlyAssets) {
			this.setAssetResponseLocalPagination({
				assets: this.selectedRows,
				totalCount: this.selectedRows.length
			})
		} else {
			this.fetchAssetList(this.filterCriteria, false);
		}
	}

	onItemsPerPageChange(event: number | undefined) {
		this.currentPage = 1;
		this.itemsPerPage = event as number;
		if (this.showOnlyAssets) {
			this.setAssetResponseLocalPagination({
				assets: this.selectedRows,
				totalCount: this.selectedRows.length
			})
		} else {
			this.fetchAssetList(this.filterCriteria);
		}
	}

	sortData(event: Sort) {
		if (this.showOnlyAssets) {
			let result = this.localSort(event.active, event.direction)
			const start = ((this.currentPage - 1) * this.itemsPerPage);
			const end = start + this.itemsPerPage;
			result = result.slice(start, end);
			this.assetsData.tableData = result;
			this.setSelectedForTable();
		} else {
			this.sortColumn = event.active;
			this.sortDirection = event.direction;
			if (this.showOnlyAssets) {
				this.setAssetResponseLocalPagination({
					assets: this.selectedRows,
					totalCount: this.selectedRows.length
				})
			} else {
				this.fetchAssetList(this.filterCriteria);
			}
		}
	}

	localSort(column: string, direction: string) {
		if (direction == 'asc') {
			return this.selectedRows.sort((a: any, b: any) => a[column] < b[column] ? -1 : 1)

		} else if (direction == 'desc') {
			return this.selectedRows.sort((a: any, b: any) => a[column] < b[column] ? 1 : -1)
		} else {
			return this.selectedRows;
		}
	}

	rowSelected(rows: Asset[]) {
		this.selectedRows.push(...rows);
		this.selectedRows = this.unique(this.selectedRows, ['name', 'controller_id']);
		this.selectedRows = this.selectedRows.filter((m: Asset) => m.isSelected === true);
		this.selectedAssetsCount = this.selectedRows.length;
		this.isAllRowsSelected = false;
		if (this.totalRows === this.selectedRows.length) {
			this.isAllRowsSelected = true;
		}
		this.selectionChangedEdit = true;
	}

	public unique = (arr: any[], props: any[] = []) => [...new Map(arr.map(entry => [props.map(k => entry[k]).join('|'), entry])).values()];

	dropdownChange() {
		// console.log('assetAttribute: ', assetAttribute);
		// this.filterCriteria.filters.push({ name: assetAttribute.attributeName, searchterm: event as string });
		// this.assetManagerService.getAssetList(this.currentPage, this.itemsPerPage, this.sortDirection, this.sortColumn, this.filterCriteria).subscribe((data: AssetResponse) => {
		// 	console.log('data:========>199 ', data);
		// 	this.modalLoading = false;
		// 	if (data && data.assets && data.assets.length > 0) {
		// 		this.setAssetResponse(data);
		// 	}
		// })
	}

	selectGroupType(event: Event, selectedGroupType: string) {
		if (selectedGroupType === 'dynamic') {
			this.selectedGroupType = GroupTypes.dynamic
			this.staticAssetGroup = false;
			this.enableRowSelection = false;
			this.selectedRows = [];
		}
		else if (selectedGroupType === 'static') {
			this.selectedGroupType = GroupTypes.static
			this.staticAssetGroup = true;
			this.enableRowSelection = true;
		}
	}

	closeAssetGroupModal(refresh: boolean = false) {
		this.visibleComponent.emit(refresh);
	}

	saveAssetGroup() {
		if (this.groupName != '') {
			this.modalLoading = true;
			const request: AssetGroupSaveRequest = { name: this.groupName, groupType: this.selectedGroupType, synched: false, deviceCount: 0 };
			if (this.selectedGroupType === GroupTypes.dynamic) {
				request.criteria = this.filterCriteria;
				request.deviceCount = this.totalRows;
			}
			if (this.selectedGroupType === GroupTypes.static) {
				request.devices = this.selectedRows.map(m => { return { "name": m.name, "controllerId": m.controller_id, "subControllerId": m.sub_controller_id } });
				request.deviceCount = this.selectedRows.length;
			}
			this.modalLoading = false;
			this.assetGroupService.saveAssetGroup(request).subscribe({
				next: (response: string) => {
					this.toast.showSuccess(response);
					this.closeAssetGroupModal(true);
				},
				error: (error) => {
					this.alertMessage = error.error.errMessage;
				}
			})

		}
	}

	onEditAssetGroup() {
		this.modalLoading = true;
		const request: AssetGroupSaveRequest = { deviceCount: 0 };
		if (!this.staticAssetGroup) {
			request.criteria = this.filterCriteria;
			request.deviceCount = this.totalRows;
		}
		if (this.staticAssetGroup) {
			request.devices = this.selectedRows.map(m => { return { "name": m.name, "controllerId": m.controller_id, "subControllerId": m.sub_controller_id } });
			request.deviceCount = this.selectedRows.length;
		}
		this.assetGroupService.updateAssetGroup(request, this._selectedAssetGroupForEdit.name).subscribe({
			next: (response: string) => {
				this.toast.showSuccess(response);

				this.modalLoading = false;
				this.closeAssetGroupModal(true);

			}, error: (error => {
				this.alertMessage = error.error.errMessage;
			})
		});

	}



	selectAll(isAllSelected: boolean) {
		this.isAllRowsSelected = isAllSelected;
		if (this.isAllRowsSelected) {
			this.assetManagerService.getAssetList(1, 0, this.sortDirection, this.sortColumn, this.filterCriteria).subscribe(response => {
				if (response && response.assets && response.assets.length > 0) {
					//this.setAssetResponse(response);
					this.setAssetResponseLocalPagination(response);
				}
			})
		} else {
			this.devicesGrid.selectedRows.clear();
			this.selectedRows = [];
			this.assetsData.tableData.forEach(row => {
				row.isSelected = false;
			})
			this.selectedAssetsCount = this.selectedRows.length;
		}

	}
	reset() {
		this.selectedRows = []
		this.assetsData.tableData.forEach(row => {
			row.isSelected = false;
		})
		this.devicesGrid.selectedRows.clear();
	}

}


