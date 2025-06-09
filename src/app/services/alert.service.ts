import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private toastr: ToastrService) {}

  success(message: string) {
    console.log('TOAST: ', message); // Confirm this prints
    this.toastr.success(message);
  }

  error(message: string) {
    this.toastr.error(message);
  }

  info(message: string) {
    this.toastr.info(message);
  }

  warning(message: string) {
    this.toastr.warning(message);
  }
}