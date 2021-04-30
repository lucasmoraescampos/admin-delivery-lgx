import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalUploadStopsComponent } from './modal-upload-stops.component';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  declarations: [ModalUploadStopsComponent],
  imports: [
    CommonModule,
    ModalModule.forRoot()
  ]
})
export class ModalUploadStopsModule { }
