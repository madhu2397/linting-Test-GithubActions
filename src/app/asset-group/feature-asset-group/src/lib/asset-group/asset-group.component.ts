import { DatePipe } from "@angular/common";
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit,
	TemplateRef,
	ViewChild,
} from "@angular/core";
import { ButtonVariant } from "@cisco-bpa-platform/cxui-components/button";
import { ChipSize } from "@cisco-bpa-platform/cxui-components/chip";
import { ColumnConfItem } from "@cisco-bpa-platform/cxui-components/column-selector";
import { DropdownSearchContext } from "@cisco-bpa-platform/cxui-components/dropdown-search";
import { IconVariant } from "@cisco-bpa-platform/cxui-components/icon";
import {
	ModalComponent,
	SizeVariant,
} from "@cisco-bpa-platform/cxui-components/modal";
import { PageEvent } from "@cisco-bpa-platform/cxui-components/paginator";
import { Sort } from "@cisco-bpa-platform/cxui-components/table-cdk";
import { TenantStateService } from "@cisco-bpa-platform/data-access-services/admin-services";
import { ToastService } from "@cisco-bpa-platform/data-access-services/alert";
import {
	AssetGroup,
	AssetGroupRequest,
	AssetGroupResponse,
	AssetGroupService,
	Filter,
} from "@cisco-bpa-platform/data-access-services/asset-group";
import { AuthorizationService } from "@cisco-bpa-platform/data-access-services/authorization";
import {
	ActionData,
	CustomTableShell,
	gridData,
	TableColumn,
} from "@cisco-bpa-platform/spogui-components/custom-table-shell";
import { debounce } from "@cisco-bpa-platform/util/decorators";
import * as saveAs from "file-saver";
@Component({
	selector: "cisco-bpa-platform-asset-group",
	templateUrl: "./asset-group.component.html",
	styleUrls: ["./asset-group.component.scss"],
	changeDetection: ChangeDetectionStrategy.Default,
})
export class AssetGroupComponent implements OnInit {
	showView = false;
	@ViewChild("assetGroupModal")
	assetGroupModal!: ModalComponent;
	@ViewChild("gridActions") gridActions: TemplateRef<any> | undefined;
	public displayedColumns: string[];
	currentPage = 1;
	totalPages = 0;
	itemsPerPage = 10;
	assetGroupsData: CustomTableShell;
	selectedAssetGroup: AssetGroup[] = [];
	selectedAssetGroupForEdit: AssetGroup = {} as AssetGroup;
	showEdit = false;
	chipSize = ChipSize.DEFAULT;
	sortColumn = "";
	sortDirection = "";
	isEdit = false;
	private gridSearchData: DropdownSearchContext = {
		searchString: "",
		searchCategory: "all",
	};
	public staticAssetGroup = false;
	columnsConf: ColumnConfItem[] = [];
	columnSelectorOpen = false;
	displayColumns: string[] = [];
	menuIcon = IconVariant.WHITE;
	buttonVariantTertairy = ButtonVariant.TERTIARY;
	conditionalRowActions = [
		{
			displayName: "Edit",
			value: "editAssetGroup",
			permission: "AssetManagerService.asset-group.manage",
		},
		{
			displayName: "Delete",
			value: "deleteAssetGroup",
			permission: "AssetManagerService.asset-group.manage",
		},
	];
	commonRowActions = [
		{
			displayName: "View ",
			value: "viewAssetGroup",
			permission: "AssetManagerService.asset-group.view",
		},
	];
	constructor(
		private assetGroupService: AssetGroupService,
		private tenantState: TenantStateService,
		private toast: ToastService,
		private authzService: AuthorizationService,
		private ref: ChangeDetectorRef,
	) {
		this.assetGroupsData = new CustomTableShell();
		this.assetGroupsData.currentPage = this.currentPage;
		this.assetGroupsData.itemsPerPage = this.itemsPerPage;
		this.assetGroupsData.tableColumns = [];
		this.assetGroupsData.enableRowSelection = false;
		this.assetGroupsData.enableRowAction = false;
		this.assetGroupsData.rowActions = [];
		let tableColumn: TableColumn = {
			name: "Group Name",
			attributeName: "name",
			sortable: true,
			filterable: true,
			defaultSorted: true,
			mandatory: true,
			visible: true,
		};
		this.assetGroupsData.tableColumns.push(tableColumn);
		let columnDef = {
			key: tableColumn.attributeName,
			name: tableColumn.name,
			locked: true,
			display: true,
		};
		this.columnsConf.push(columnDef);
		tableColumn = {
			name: "Group Type",
			attributeName: "groupType",
			sortable: true,
			filterable: true,
			defaultSorted: false,
			mandatory: true,
			visible: true,
		};
		this.assetGroupsData.tableColumns.push(tableColumn);
		columnDef = {
			key: tableColumn.attributeName,
			name: tableColumn.name,
			locked: true,
			display: true,
		};
		this.columnsConf.push(columnDef);
		tableColumn = {
			name: "Source",
			attributeName: "controller_id",
			sortable: true,
			filterable: true,
			defaultSorted: false,
			mandatory: true,
			visible: true,
		};
		this.assetGroupsData.tableColumns.push(tableColumn);
		columnDef = {
			key: tableColumn.attributeName,
			name: tableColumn.name,
			locked: true,
			display: true,
		};
		this.columnsConf.push(columnDef);
		// tableColumn = {
		//   name: "Tenant Name",
		//   attributeName: "tenantName",
		//   sortable: true,
		//   filterable: true,
		//   defaultSorted: false,
		//   mandatory: true,
		//   visible: true
		// }
		// this.assetGroupsData.tableColumns.push(tableColumn);
		// columnDef = { key: tableColumn.attributeName, name: tableColumn.name, locked: true, display: true };
		// this.columnsConf.push(columnDef)
		this.setDisplayColumns();
		this.assetGroupsData.enableRowAction = true;
		//this.assetGroupsData.rowActions.push(...this.commonRowActions);
		this.displayedColumns = ["name", "groupType", "controller_id"];
	}

	setDisplayColumns(gridColumns: ColumnConfItem[] = []) {
		this.displayColumns = [];
		this.assetGroupsData.tableColumns.forEach((tableColumn) => {
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
			});
			if (tableColumn.visible) {
				this.displayColumns.push(tableColumn.attributeName as string);
			}
		});
	}
	ngOnInit(): void {
		//this.fetchAssetGroups(this.createRequest());
		this.tenantState.tenantSelectedEvent$.subscribe(() => {
			this.fetchAssetGroups(this.createRequest());
		});
	}

	public fetchAssetGroups(request: AssetGroupRequest) {
		this.assetGroupService
			.fetchAssetGroups(request)
			.subscribe((assetGroups: AssetGroupResponse) => {
				if (assetGroups.data.length > 0) {
					assetGroups.data.forEach((grp) => {
						grp.tenantName = this.tenantState.getTenantName(grp.tenant);
					});
					this.assetGroupsData.tableData = assetGroups.data;
					this.assetGroupsData.enableRowSelection = true;
					this.assetGroupsData.totalPages = Math.ceil(
						assetGroups.totalRecords / this.itemsPerPage,
					);
					this.assetGroupsData.currentPage = this.currentPage;
					this.assetGroupsData.itemsPerPage = this.itemsPerPage;
					this.totalPages = Math.ceil(
						assetGroups.totalRecords / this.itemsPerPage,
					);
				} else {
					this.assetGroupsData.tableData = assetGroups.data;
					this.assetGroupsData.enableRowSelection = true;
					this.assetGroupsData.totalPages = Math.ceil(
						assetGroups.totalRecords / this.itemsPerPage,
					);
					this.assetGroupsData.currentPage = this.currentPage;
					this.assetGroupsData.itemsPerPage = this.itemsPerPage;
					this.totalPages = Math.ceil(
						assetGroups.totalRecords / this.itemsPerPage,
					);
					this.toast.showSuccess("No matches found");
				}
				// TODO: The component is not updated despite this
				this.ref.detectChanges();
			});
	}

	public displayAssetGroupDetail(assetGroup: AssetGroup) {
		this.staticAssetGroup = assetGroup.groupType === "static";
		this.assetGroupModal.size = SizeVariant.SEMI;
		this.assetGroupModal.open();
	}

	closeModal(event: boolean) {
		this.isEdit = false;
		this.assetGroupModal.close();
		if (event) {
			this.fetchAssetGroups(this.createRequest());
		}
	}

	closeEditAssetGroupModal(event: boolean) {
		this.showView = false;
		if (event) {
			this.fetchAssetGroups(this.createRequest());
		}
	}

	public createAssetGroup() {
		this.assetGroupModal.size = SizeVariant.FULL_SCREEN;
		this.assetGroupModal.open();
	}

	createRequest(): AssetGroupRequest {
		const request: AssetGroupRequest = {};
		let filters: Filter[] = [];
		if (this.gridSearchData.searchString !== "") {
			if (
				this.gridSearchData.searchCategory === "all" ||
				this.gridSearchData.searchCategory == null
			) {
				this.assetGroupsData.tableColumns.forEach((tc) => {
					filters.push({
						searchterm: this.gridSearchData.searchString,
						name: tc.attributeName,
					});
				});
			} else {
				const searchTerm = this.gridSearchData.searchString;
				filters = [
					{ searchterm: searchTerm, name: this.gridSearchData.searchCategory },
				];
			}
		}
		request.page = this.currentPage;
		request.rows = this.itemsPerPage;
		request.sortColumn = this.sortColumn;
		request.sortDirection = this.sortDirection;
		request.filters = filters;
		return request;
	}

	onPageChange(event: PageEvent) {
		this.currentPage = event.current;
		const request = this.createRequest();
		this.fetchAssetGroups(request);
	}

	onItemsPerPageChange(event: number | undefined) {
		this.itemsPerPage = event as number;
		this.currentPage = 1;
		const request = this.createRequest();
		this.fetchAssetGroups(request);
	}

	sortData(event: Sort) {
		this.sortColumn = event.active;
		this.sortDirection = event.direction;
		const request = this.createRequest();
		this.fetchAssetGroups(request);
	}

	@debounce(500)
	searchData(event: DropdownSearchContext) {
		this.gridSearchData = event;
		this.currentPage = 1;
		const request = this.createRequest();
		this.fetchAssetGroups(request);
	}

	rowClicked(row: AssetGroup) {
		if (
			this.authzService.hasPermissions(
				"AssetManagerService",
				"asset-group",
				"AssetManagerService.asset-group.view",
			)
		) {
			this.selectedAssetGroupForEdit = row;
			this.showView = true;
		}
	}

	rowSelected(rows: AssetGroup[]) {
		this.selectedAssetGroup = rows;
	}

	editAssetGroup(assetGroup: AssetGroup) {
		if (assetGroup) {
			this.isEdit = true;
			this.assetGroupModal.size = SizeVariant.FULL_SCREEN;
			this.assetGroupModal.open();
		}
	}

	actionSelected(event: ActionData) {
		this.selectedAssetGroupForEdit = event.row;
		if (event.action.value === "viewAssetGroup") {
			this.rowClicked(event.row);
		} else if (event.action.value === "editAssetGroup") {
			this.editAssetGroup(event.row);
		} else if (event.action.value === "deleteAssetGroup") {
			this.deleteAssetGroup(event.row);
		}
	}

	getGridAction(event: gridData) {
		if (event.action === "export") {
			this.exportCSV();
		}
	}

	exportCSV() {
		const request = this.createRequest();
		this.assetGroupService
			.getExportAssetGroupsList(request)
			.subscribe((data: BlobPart) => {
				const blob = new Blob([data]);
				const prependString = "Assets-Groups-";
				const datePipe = new DatePipe("en-US");
				const timestamp = datePipe.transform(new Date(), "yyyyMMddHHmmss");
				const fileName = `${prependString}${timestamp}.csv`;
				saveAs(blob, fileName);
			});
	}

	close() {
		this.columnSelectorOpen = false;
	}

	findEligibleActions(event: AssetGroup) {
		this.assetGroupsData.rowActions = [];
		const rowActions = [];
		rowActions.push(...this.commonRowActions);
		if (!event.synched) {
			rowActions.push(...this.conditionalRowActions);
		}
		rowActions.forEach((rowAction) => {
			if (
				this.authzService.hasPermissions(
					"AssetManagerService",
					"asset-group",
					rowAction.permission,
				)
			) {
				this.assetGroupsData.rowActions.push(rowAction);
			}
		});
	}

	deleteAssetGroup(event: AssetGroup) {
		this.assetGroupService.deleteAssetGroup(event.name).subscribe({
			next: (response) => {
				this.fetchAssetGroups(this.createRequest());
				this.toast.showSuccess(response);
			},
			error: (error) => {
				this.toast.showError(error.error.errMessage);
			},
		});
	}
}
