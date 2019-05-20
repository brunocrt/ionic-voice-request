import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IUtterance } from "NLPInterfaceModule";

@Injectable({
  providedIn: 'root'
})

export class NlpserviceService {

  DEFAULT_LANGUAGE    = 'pt-BR';
  DEFAULT_SPEECH_RATE = 1;

  LOADING_MESSAGE     = 'Carregando reconhecimendo de voz...';
  CONFIRM_MESSAGE     = 'Confirmar esse seu pedido?'
  UNKNOWN_INTENT_MSG  = 'Não consegui entender seu pedido!'

  LUIS_APP_URL        = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/'
  LUIS_APP_ID         = 'f297a6f0-290b-41ec-b39a-0b8f7130e47f';
  LUIS_API_KEY        = '749a36925f8c49a995340ca0cda270b2';

  constructor(
    private speechRecognition: SpeechRecognition,
    private textToSpeech: TextToSpeech,
    private httpClient: HttpClient) { 

  }

  startListening(callbackFunction: Function) {

    // Check feature available
    this.speechRecognition.isRecognitionAvailable()
      .then((available: boolean) => { console.log(available); })

    let options = {
        language: this.DEFAULT_LANGUAGE,
        matches: 1,
        prompt: 'Grave sua mensagem...',
        showPopup: true,
        showPartial: false
    }

    // Start the recognition process
    this.speechRecognition.startListening(options)
      .subscribe(
        (matches: string[]) => {

            // call NLP service
            this.recognizeMessage( matches[0] ).subscribe( (response: IUtterance) =>
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
                    person = 'com o ' + entities.filter( entity => entity.type == 'Profissional' )[0].resolution.values[0];
                  if (entities.filter( entity => entity.type == 'Cliente' ).length > 0)
                    client = entities.filter( entity => entity.type == 'Cliente' )[0].resolution.values[0] + ' ' + entities.filter( entity => entity.type == 'Cliente' )[0].entity;
                  if (entities.filter( entity => entity.type == 'Tecnologia' ).length > 0)
                    tecnologia = entities.filter( entity => entity.type == 'Tecnologia' )[0].entity;
                  if (entities.filter( entity => entity.type == 'builtin.datetimeV2.datetime' ).length > 0)
                    schedule = entities.filter( entity => entity.type == 'builtin.datetimeV2.datetime' )[0].resolution.values[0].value;                
                
                    // execute callback function with the returned message from NLPService
                    callbackFunction(`Atividade: ${activity} <br> Profissional: ${person} <br> Cliente: ${client} <br> Tecnologia: ${tecnologia} <br> Horario: ${schedule}`);

                    this.speakMessage(`Gostaria de confirmar pedido de ${activity} ${person} no ${client}?`);
              });
          

        },
        (onerror) => console.log('error:', onerror)
      );
  }

  stopListening() {
  
    // Stop the recognition process (iOS only)
    this.speechRecognition.stopListening();

  }

  getPermission() {
    // Check permission
    this.speechRecognition.hasPermission()
    .then((hasPermission: boolean) => {
      
        console.log(hasPermission)

        if(!hasPermission) {
            // Request permissions
            this.speechRecognition.requestPermission()
            .then(
              () => console.log('Granted'),
              () => console.log('Denied')
            )
        }
    
      })
  }

  speakMessage(msg) {
      this.textToSpeech.speak({
          text: msg,
          locale: this.DEFAULT_LANGUAGE,
          rate: this.DEFAULT_SPEECH_RATE
      }).then((res)=>console.log(res))
      .catch((err) => console.log(err));
  }

  recognizeMessage(textSpeechMessage) {

      var endpoint = this.LUIS_APP_URL;
      var luisAppId = this.LUIS_APP_ID;
      var endpointKey = this.LUIS_API_KEY;
      var verbose = 'false';

      var url = `${endpoint}${luisAppId}?verbose=${verbose}&q=${encodeURI(textSpeechMessage)}&subscription-key=${endpointKey}`;

      return this.httpClient.get<IUtterance>(url);
  }

}
