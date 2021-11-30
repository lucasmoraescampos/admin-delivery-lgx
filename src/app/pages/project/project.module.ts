import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectComponent } from './project.component';
import { ProjectRoutingModule } from './project-routing.module';
import { SofboxModule } from 'src/app/components/sofbox/sofbox.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { GoogleAutocompleteModule } from 'src/app/components/google-autocomplete/google-autocomplete.module';
import { BrMaskerModule } from 'br-mask';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalStopModule } from 'src/app/modals/modal-stop/modal-stop.module';
import { ModalUploadStopsModule } from 'src/app/modals/modal-upload-stops/modal-upload-stops.module';
import { FilterModule } from 'src/app/pipes/filter/filter.module';
import { ModalDriverModule } from 'src/app/modals/modal-driver/modal-driver.module';
import { SortablejsModule } from 'ngx-sortablejs';
import { ModalSwapRouteModule } from 'src/app/modals/modal-swap-route/modal-swap-route.module';
import { ProjectManagerModule } from 'src/app/components/project-manager/project-manager.module';
import { ModalDriverTimeModule } from 'src/app/modals/modal-driver-time/modal-driver-time.module';

@NgModule({
  declarations: [ProjectComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProjectRoutingModule,
    SofboxModule,
    GoogleAutocompleteModule,
    BrMaskerModule,
    ModalStopModule,
    ModalUploadStopsModule,
    ModalDriverModule,
    FilterModule,
    SortablejsModule,
    ModalSwapRouteModule,
    ProjectManagerModule,
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    ModalDriverTimeModule
  ]
})
export class ProjectModule { }
