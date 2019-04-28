
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { Component } from '@angular/core';
import { NavController, IonicModule, Platform } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  
  matches: String[];
  isRecording = false;
  buttonMode = 'off';

  constructor(public navCtrl: NavController, 
    private plt: Platform, 
    private speechRecognition: SpeechRecognition,
    private cd: ChangeDetectorRef) {

  }

  startListening() {

      // Check feature available
      this.speechRecognition.isRecognitionAvailable()
      .then((available: boolean) => console.log(available))

      this.buttonMode = 'on';

      let options = {
          language: 'pt-BR'
      }

      // Start the recognition process
      this.speechRecognition.startListening(options)
      .subscribe(
        (matches: string[]) => {
            this.matches = matches;
            this.isRecording = false;
            this.buttonMode = 'off';
            this.cd.detectChanges();
        },
        (onerror) => console.log('error:', onerror)
      );

      
      this.isRecording = true;
  }

  stopListening() {
    
    // Stop the recognition process (iOS only)
    this.speechRecognition.stopListening();
  }

  getPermission() {
      // Check permission
      this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => console.log(hasPermission))

      // Request permissions
      this.speechRecognition.requestPermission()
      .then(
        () => console.log('Granted'),
        () => console.log('Denied')
      )
  }

  isIos() {
    return this.plt.is('ios');
  }
}
