import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalUploadStopsColumnsComponent } from './modal-upload-stops-columns.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [ModalUploadStopsColumnsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot()
  ],
  exports: [ModalUploadStopsColumnsComponent]
})
export class ModalUploadStopsColumnsModule { }
