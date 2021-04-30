import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {

  public modalRef: BsModalRef;

  constructor(
    private modalSrv: BsModalService
  ) { }

  ngOnInit() { }

  public openModal(template: TemplateRef<any>) {

    this.modalRef = this.modalSrv.show(template, {
      class: 'modal-dialog-centered'
    });

  }

}
