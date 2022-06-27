import { Injectable } from '@angular/core';
import * as socketIOClient from 'socket.io-client';
import * as sailsIOClient from 'sails.io.js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private io: sailsIOClient.Client;

  constructor() {
    this.io = sailsIOClient(socketIOClient);
    this.io.sails.url = environment.socketUrl;
  }

  public on(event: string, cb: (...args: any[]) => any) {
    this.io.socket.on(event, cb);
  }

  public subscribe() {
    return new Promise<string>(resolve => {
      this.io.socket.post('/admin/subscribe', {}, (resData, jwres) => {
        resolve(resData.id);
      });
    });
  }

  public unsubscribe(id: string) {
    return new Promise<any>(resolve => {
      this.io.socket.post('/admin/unsubscribe', { id }, (resData, jwres) => {
        resolve({ resData, jwres });
      });
    });
  }

}
