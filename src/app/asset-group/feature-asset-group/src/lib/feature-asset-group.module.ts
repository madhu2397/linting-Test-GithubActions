import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AssetGroupComponent } from './asset-group/asset-group.component';
import { TableCdkModule } from '@cisco-bpa-platform/cxui-components/table-cdk';
import { ModalModule } from '@cisco-bpa-platform/cxui-components/modal';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ButtonModule } from '@cisco-bpa-platform/cxui-components/button';
import { PaginatorModule } from '@cisco-bpa-platform/cxui-components/paginator';
import { CustomTableShellModule } from '@cisco-bpa-platform/spogui-components/custom-table-shell';
import { AssetGroupModule } from '@cisco-bpa-platform/data-access-services/asset-group';
import { DropdownSearchModule } from '@cisco-bpa-platform/cxui-components/dropdown-search';
import { ChipModule } from '@cisco-bpa-platform/cxui-components/chip';
import { AddAssetGroupComponent } from './add-asset-group/add-asset-group.component';
import { EditAssetGroupComponent } from './edit-asset-group/edit-asset-group.component';
import { AccordionModule } from '@cisco-bpa-platform/cxui-components/accordion';
import { LoaderModule } from '@cisco-bpa-platform/cxui-components/loader';
import { SearchModule } from '@cisco-bpa-platform/cxui-components/search';
import { InputModule } from '@cisco-bpa-platform/cxui-components/input';
import { CheckboxModule } from '@cisco-bpa-platform/cxui-components/checkbox';
import { SelectModule } from '@cisco-bpa-platform/cxui-components/select';
import { OptionModule } from '@cisco-bpa-platform/cxui-components/option';
import { PanelModule } from '@cisco-bpa-platform/spogui-components/panel';
import { ColumnSelectorModule } from '@cisco-bpa-platform/cxui-components/column-selector';
import { MenuModule } from '@cisco-bpa-platform/cxui-components/menu';
import { ListModule } from '@cisco-bpa-platform/cxui-components/list';
import { OverlayModule } from '@angular/cdk/overlay';
import { AlertModule } from '@cisco-bpa-platform/cxui-components/alert';
import { IconModule } from '@cisco-bpa-platform/cxui-components/icon';
import { DecoratorModule } from '@cisco-bpa-platform/util/decorators';


const routes: Routes = [{ path: 'home', component: AssetGroupComponent }];

@NgModule({
    declarations: [AssetGroupComponent, AddAssetGroupComponent, EditAssetGroupComponent],
    exports: [AssetGroupComponent, AddAssetGroupComponent, EditAssetGroupComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        HttpClientModule,
        TableCdkModule,
        ModalModule,
        ButtonModule,
        PaginatorModule,
        CustomTableShellModule,
        AssetGroupModule,
        DropdownSearchModule,
        ChipModule,
        FormsModule,
        ReactiveFormsModule,
        LoaderModule,
        SearchModule,
        InputModule,
        CheckboxModule,
        SelectModule,
        OptionModule,
        AccordionModule,
        PanelModule,
        ColumnSelectorModule,
        MenuModule,
        ListModule,
        OverlayModule,
        AlertModule,
        IconModule,
        DecoratorModule
    ]
})
export class FeatureAssetGroupModule { }
