import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ButtonVariant } from '@cisco-bpa-platform/cxui-components/button';
import { ColumnConfItem } from '@cisco-bpa-platform/cxui-components/column-selector';
import { DropdownSearchContext } from '@cisco-bpa-platform/cxui-components/dropdown-search';
import { PageEvent } from '@cisco-bpa-platform/cxui-components/paginator';
import { Sort } from '@cisco-bpa-platform/cxui-components/table-cdk';
import { ToastService } from '@cisco-bpa-platform/data-access-services/alert';
import { AssetGroup, AssetGroupResponse, AssetGroupService, Filter, Filters, GroupTypes } from '@cisco-bpa-platform/data-access-services/asset-group';
import { Asset, AssetManagerService } from '@cisco-bpa-platform/data-access-services/asset-manager';
import { CustomTableShell, TableColumn } from '@cisco-bpa-platform/spogui-components/custom-table-shell';
import { debounce } from '@cisco-bpa-platform/util/decorators';


@Component({
	selector: 'cisco-bpa-platform-edit-asset-group',
	templateUrl: './edit-asset-group.component.html',
	styleUrls: ['./edit-asset-group.component.scss'],
})
export class EditAssetGroupComponent  {
	public get buttonVariant(): typeof ButtonVariant {
		return ButtonVariant;
	}
	fullscreen = false;
	public staticAssetGroup = false;
	public displayColumns: string[];
	currentPage = 1;
	totalPages = 0;
	itemsPerPage = 10;
	assetsData: CustomTableShell;
	_selectedAssetGroup: AssetGroup = {} as AssetGroup;
	public sortDirection = 'asc';
	public sortColumn = 'name';
	@Input() hidden = true;
	@Input() set selectedAssetGroup(value: AssetGroup) {
		this._selectedAssetGroup = value
		this.staticAssetGroup = value.synched;
		this.fetchAssetList();
	}
	@Output() closeModal: EventEmitter<boolean> = new EventEmitter<boolean>()
	@Output() assetGroupEdit: EventEmitter<AssetGroup> = new EventEmitter<AssetGroup>();
	@Output() assetGroupDelete: EventEmitter<AssetGroup> = new EventEmitter<AssetGroup>();
	columnsConf: ColumnConfItem[] = [];
	private gridSearchData: DropdownSearchContext = { searchString: '', searchCategory: 'all' };
	constructor(private assetGroupService: AssetGroupService, private assetManagerService: AssetManagerService, private toast: ToastService) {
		this.assetsData = new CustomTableShell();
		this.assetsData.currentPage = 1;
		this.assetsData.itemsPerPage = 10;
		//this.fetchAssetGroups(request)
		this.assetsData.tableColumns = [];
		this.assetsData.enableRowSelection = true;
		let tableColumn: TableColumn = {
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
		this.columnsConf.push(columnDef);

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
		this.columnsConf.push(columnDef);
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
		this.columnsConf.push(columnDef);
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
		this.columnsConf.push(columnDef);
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
		this.columnsConf.push(columnDef);
		tableColumn = {
			name: "Tenant Name",
			attributeName: "tenantName",
			sortable: true,
			filterable: true,
			defaultSorted: false,
			mandatory: true,
			visible: true
		}
		this.assetsData.tableColumns.push(tableColumn);
		columnDef = { key: tableColumn.attributeName, name: tableColumn.name, locked: true, display: true };
		this.columnsConf.push(columnDef);
		this.setDisplayColumns();
		this.displayColumns = ["name", "description", "address", "latitude", "controller_id", "tenantName"];
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

	private fetchAssetList() {
		let filters: Filter[] = [];
		if (this.gridSearchData.searchString != '') {
			if (this.gridSearchData.searchCategory == 'all' || this.gridSearchData.searchCategory == null) {
				this.assetsData.tableColumns.forEach(tc => {
					filters.push({ "searchterm": this.gridSearchData.searchString, "name": tc.attributeName });
				})
			} else {
				const searchTerm = this.gridSearchData.searchString;
				filters = [{ "searchterm": searchTerm, "name": this.gridSearchData.searchCategory }];
			}
		}
		this.assetGroupService.fetchAssetGroup(this._selectedAssetGroup.name, this._selectedAssetGroup.controller_id, this._selectedAssetGroup.sub_controller_id, this.itemsPerPage, this.currentPage, this.sortColumn, this.sortDirection, filters).subscribe((assetGroupResult: AssetGroupResponse) => {
			this.setAssetData(assetGroupResult.body.devices, assetGroupResult.body.totalCount);
		});
	}

	private setAssetData(result: Asset[], totalCount: number) {
		this.assetsData.totalPages = Math.ceil(totalCount / this.itemsPerPage);
		this.assetsData.enableRowSelection = true;
		this.assetsData.currentPage = this.currentPage;
		this.assetsData.itemsPerPage = this.itemsPerPage;
		this.assetsData.tableData = result;
	}

	onPageChange(event: PageEvent) {
		this.currentPage = event.current;
		this.fetchAssetList();
	}

	onItemsPerPageChange(event: number | undefined) {
		this.itemsPerPage = event as number;
		this.fetchAssetList();
	}
	sortData(event: Sort) {
		this.sortColumn = event.active;
		this.sortDirection = event.direction;
		this.fetchAssetList();
	}

	deleteAssetGroup() {
		this.closeModal.emit(false);
		this.assetGroupDelete.emit(this._selectedAssetGroup);	
	}

	editAssetGroup() {
		this.closeModal.emit(false);
		this.assetGroupEdit.emit(this._selectedAssetGroup);
	}
	onPanelOpen(): void {
		this.hidden = true;
	}
	onPanelClose(): void {
		this.closeModal.emit(false);
		this.hidden = true;
	}
	handleHidden(hidden: boolean): void {
		if (hidden) {
			this.onPanelClose();
		}
	}
	@debounce(500)
	searchData(event: any) {
		this.gridSearchData = event;
		this.currentPage = 1;
		this.fetchAssetList();

	}
}