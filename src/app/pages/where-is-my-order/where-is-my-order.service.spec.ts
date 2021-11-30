import { TestBed } from '@angular/core/testing';

import { WhereIsMyOrderService } from './where-is-my-order.service';

describe('WhereIsMyOrderService', () => {
  let service: WhereIsMyOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WhereIsMyOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
