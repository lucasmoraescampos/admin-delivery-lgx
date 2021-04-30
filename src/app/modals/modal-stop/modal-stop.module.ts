import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalStopComponent } from './modal-stop.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleAutocompleteModule } from 'src/app/components/google-autocomplete/google-autocomplete.module';
import { BrMaskerModule } from 'br-mask';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';



@NgModule({
  declarations: [ModalStopComponent],
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
export class ModalStopModule { }
