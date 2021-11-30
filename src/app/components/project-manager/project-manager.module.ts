import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectManagerComponent } from './project-manager.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SortablejsModule } from 'ngx-sortablejs';
import { ClipboardModule } from 'ngx-clipboard';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@NgModule({
  declarations: [ProjectManagerComponent],
  imports: [
    CommonModule,
    TabsModule,
    SortablejsModule,
    ClipboardModule,
    TooltipModule
  ],
  exports: [ProjectManagerComponent]
})
export class ProjectManagerModule { }
