import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalUploadStopsComponent } from './modal-upload-stops.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ModalUploadStopsColumnsModule } from '../modal-upload-stops-columns/modal-upload-stops-columns.module';

@NgModule({
  declarations: [ModalUploadStopsComponent],
  imports: [
    CommonModule,
    ModalUploadStopsColumnsModule,
    ModalModule.forRoot()
  ]
})
export class ModalUploadStopsModule { }
