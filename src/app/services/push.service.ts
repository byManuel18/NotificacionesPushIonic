import { EventEmitter, Injectable } from '@angular/core';

import { Storage } from '@ionic/storage-angular';

import OneSignal from 'onesignal-cordova-plugin';
import OSNotification from 'onesignal-cordova-plugin/dist/OSNotification';
import { environment } from 'src/environments/environment';

const oneSignalAppId: string = environment.oneSignalAppId;


@Injectable({
  providedIn: 'root'
})
export class PushService {

  private _storage: Storage | null = null;

  mesages: OSNotification[] = [];

  pushListener = new EventEmitter<OSNotification>();

  userId: string = '';

  constructor(
    private storage: Storage
  ) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
    await this.cargarMensages();
  }

  configuracionInicial(){
    OneSignal.setAppId(oneSignalAppId);


    OneSignal.setNotificationOpenedHandler((async (data)=>{
      console.log(data);
      console.log(data.notification.additionalData);
      await this.notificacionrecivida(data.notification)
    }));

    OneSignal.promptForPushNotificationsWithUserResponse((acepted)=>{
      console.log("Notificaciónes: ", acepted);
    });

    OneSignal.getDeviceState((state)=>{
      console.log(state);
      this.userId = state.userId;
    })
  }

  async notificacionrecivida(notification: OSNotification){
    await this.cargarMensages();
    const existe = this.mesages.some(m=>m.notificationId === notification.notificationId);
    if(!existe){
      this.mesages.unshift(notification);
      this.pushListener.emit(notification);
     await this.guardarMensages();
    }


  }

  async guardarMensages(){
    await this._storage?.set('mensages', this.mesages);
  }

  async getMensages(){
    await this.cargarMensages();
    return [...this.mesages];
  }

  async cargarMensages(){
   this.mesages = await  this._storage?.get('mensages') || [];
  }

  async clearAll(){
    await this.storage.remove('mensages');
    this.mesages = [];
    await this.guardarMensages();
  }
}
