import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleAutocompleteComponent } from './google-autocomplete.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [GoogleAutocompleteComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [GoogleAutocompleteComponent]
})
export class GoogleAutocompleteModule { }
