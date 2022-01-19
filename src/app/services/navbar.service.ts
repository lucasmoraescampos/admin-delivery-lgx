import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {

  private titleSubject = new BehaviorSubject<string>('');

  private breadcrumbSubject = new BehaviorSubject<Breadcrumb[]>([]);

  constructor() { }

  public get title() {
    return this.titleSubject.asObservable();
  }

  public get breadcrumb() {
    return this.breadcrumbSubject.asObservable();
  }

  public setTitle(title: string) {
    this.titleSubject.next(title);
  }

  public setBreadcrumb(breadcrumb: Breadcrumb[]) {
    this.breadcrumbSubject.next(breadcrumb);
  }

}

interface Breadcrumb {
  isActive: boolean;
  label: string;
  link?: string;
}