import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { GoogleAutocompleteModule } from 'src/app/components/google-autocomplete/google-autocomplete.module';
import { ModalDriverTimeComponent } from './modal-driver-time.component';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';

@NgModule({
  declarations: [ModalDriverTimeComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GoogleAutocompleteModule,
    ModalModule.forRoot(),
    TimepickerModule.forRoot()
  ]
})
export class ModalDriverTimeModule { }
