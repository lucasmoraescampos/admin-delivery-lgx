import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

interface AlertOptions {
  message?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  onConfirm?: Function;
  onCancel?: Function;
  duration?: number;
  position?: 'top-end' | 'top' | 'center'
  icon?: SweetAlertIcon;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private customClass = {
    container: 'alert-custom-container',
    popup: 'alert-custom-popup',
    header: 'alert-custom-header',
    title: 'alert-custom-title',
    closeButton: 'alert-custom-close-button',
    icon: 'alert-custom-icon',
    image: 'alert-custom-image',
    content: 'alert-custom-content',
    input: 'alert-custom-input',
    actions: 'alert-custom-actions',
    confirmButton: 'alert-custom-confirm-button',
    cancelButton: 'alert-custom-cancel-button',
    footer: 'alert-custom-footer'
  }

  constructor() { }

  public show(options: AlertOptions) {
    Swal.fire({
      icon: options.icon,
      title: options.message,
      showCancelButton: options.showCancelButton !== undefined ? options.showCancelButton : true,
      showConfirmButton: options.showConfirmButton !== undefined ? options.showCancelButton : true,
      confirmButtonText: options.confirmButtonText ? options.confirmButtonText : 'Continue',
      cancelButtonText: options.cancelButtonText ? options.cancelButtonText : 'Cancel',
      reverseButtons: true,
      heightAuto: false,
      allowOutsideClick: false,
      customClass: this.customClass
    }).then(result => {
      if (result.value) {
        if (options.onConfirm) {
          options.onConfirm();
        }
      }
      else {
        if (options.onCancel) {
          options.onCancel();
        }
      }
    });
  }

  public toast(options: AlertOptions) {
    const Toast = Swal.mixin({
      toast: true,
      position: options.position ?? 'top-end',
      showConfirmButton: false,
      timer: options.duration ?? 4500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })

    Toast.fire({
      icon: options.icon,
      title: options.message
    });
  }

}