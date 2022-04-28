import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDriverComponent } from './modal-driver.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleAutocompleteModule } from 'src/app/components/google-autocomplete/google-autocomplete.module';
import { BrMaskerModule } from 'br-mask';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';



@NgModule({
  declarations: [ModalDriverComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GoogleAutocompleteModule,
    BrMaskerModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot()
  ]
})
export class ModalDriverModule { }
