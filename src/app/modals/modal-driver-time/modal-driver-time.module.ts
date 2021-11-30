import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrMaskerModule } from 'br-mask';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { GoogleAutocompleteModule } from 'src/app/components/google-autocomplete/google-autocomplete.module';

import { ModalDriverTimeComponent } from './modal-driver-time.component';

@NgModule({
  declarations: [ModalDriverTimeComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GoogleAutocompleteModule,
    BrMaskerModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot()
  ]
})
export class ModalDriverTimeModule { }
