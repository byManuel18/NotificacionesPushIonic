import { ApplicationRef, Component, OnInit } from '@angular/core';
import { PushService } from '../services/push.service';
import OSNotification from 'onesignal-cordova-plugin/dist/OSNotification';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{
  mensages: OSNotification[] = [];

  constructor(
    public pushService: PushService,
    private appRef: ApplicationRef
  ) {}

  ngOnInit(): void {

    this.pushService.pushListener.subscribe(notificacion=>{
      this.mensages.unshift(notificacion);
      this.appRef.tick();
    })

  }

  async ionViewWillEnter(){
    this.mensages = await this.pushService.getMensages();
  }

  async clearAllMsg(){
    await this.pushService.clearAll();
    this.mensages = [];
  }

}
