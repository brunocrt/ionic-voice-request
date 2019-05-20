
import { Component } from '@angular/core';
import { NavController, IonicModule, Platform, AlertController } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { NlpserviceService } from '../services/nlpservice.service';
import { IUtterance } from "NLPInterfaceModule";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

    MAIN_TITLE_MESSAGE  = 'GFT Voice Request v0.2';
    START_MESSAGE       = 'Pressione o botão abaixo para falar...';
    //START_MESSAGE = 'Mattos, tem alguém no seu time que poderia me apoiar numa reunião sobre cloud no original na quinta-feira as 15h?';

    matches: String[];
    isRecording = false;
    buttonMode = 'off';
    requestMessage = this.START_MESSAGE;
    appTitle = this.MAIN_TITLE_MESSAGE;

    constructor(public navCtrl: NavController, 
      private plt: Platform,
      private cd: ChangeDetectorRef,
      private nlpService: NlpserviceService,
      private alertController: AlertController) {
    }

    ngOnInit() {
        this.checkPermission();
        //this.nlpService.speakMessage('Olá, fale seu pedido!');
    }

    startListening() {

      if(this.buttonMode == 'off') {
          this.buttonMode = 'on';
          this.isRecording = true;
      } else {
          this.buttonMode = 'off';
          this.isRecording = false;
          return;
      }

      var listeningCallbackFunction = (message: string) : void => {
          this.isRecording = false;
          this.buttonMode = 'off';
          this.cd.detectChanges();
          this.presentAlertConfirm(message);
      }
  
      this.nlpService.startListening(listeningCallbackFunction);

      this.isRecording = true;
    }
  
    stopListening() {
      
        // Stop the recognition process (iOS only)
        this.nlpService.stopListening();
        this.buttonMode = 'off'
        this.isRecording = false;
      
    }
    
    checkPermission() {
        this.nlpService.getPermission();
    }

    confirmRequest() {
        this.matches = [];
    }

    isIos() {
        return this.plt.is('ios');
    }

    testRequest() {
      
      this.requestMessage = 'Requesting...';
      this.nlpService.recognizeMessage( 'mattos, tem alguém no seu time que poderia me apoiar numa reunião sobre cloud no original na quinta-feira as 15h?' ).subscribe( (response: IUtterance) =>
       {


          var comment = response.query;
          var intent  = response.topScoringIntent.intent;
          var entities = response.entities;

          var person = '';
          var activity = '';
          var client = '';
          var tecnologia = '';
          var schedule = '';

          if (entities.filter( entity => entity.type == 'Atividade' ).length > 0)
            activity = entities.filter( entity => entity.type == 'Atividade' )[0].resolution.values[0];
          if (entities.filter( entity => entity.type == 'Profissional').length > 0)
            person = entities.filter( entity => entity.type == 'Profissional' )[0].resolution.values[0];
          if (entities.filter( entity => entity.type == 'Cliente' ).length > 0)
            client = entities.filter( entity => entity.type == 'Cliente' )[0].resolution.values[0];
            if (entities.filter( entity => entity.type == 'Tecnologia' ).length > 0)
            tecnologia = entities.filter( entity => entity.type == 'Tecnologia' )[0].resolution.values[0];
          if (entities.filter( entity => entity.type == 'builtin.datetimeV2.datetime' ).length > 0)
            schedule = entities.filter( entity => entity.type == 'builtin.datetimeV2.datetime' )[0].resolution.values[0].value || '';
          
          //this.requestMessage = `${JSON.stringify(entities)}`

          this.requestMessage = `Atividade: ${activity} - Profissional: ${person} - Cliente: ${client} - Horario: ${schedule}`;
      
       });
    }

    async presentAlertConfirm(message) {
      const alert = await this.alertController.create({
        header: 'Detalhes do pedido',
        message: `<strong>${message}</strong>`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              console.log('Confirm Cancel');
            }
          }, {
            text: 'Okay',
            handler: () => {
              console.log('Confirmar pedido');
            }
          }
        ]
      });
  
      await alert.present();
    }
}
