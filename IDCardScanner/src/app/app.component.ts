import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Dynamsoft from 'dwt';
import { WebTwain } from 'dwt/dist/types/WebTwain';
import { init } from "../dcv";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  @ViewChild('viewerElement') viewerElement:any;
  containerID = "dwtcontrolContainer";
  title = 'IDCardScanner';
  DWTObject:WebTwain|undefined;
  webTWAINReady = false;
  dcvReady = false;

  ngOnInit(): void {
    this.initDWT();
    this.initDCV();
  }

  initDWT(){
    Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', () => {
      this.DWTObject = Dynamsoft.DWT.GetWebTwain(this.containerID);
      this.webTWAINReady = true;
    });
    Dynamsoft.DWT.ProductKey = "DLS2eyJoYW5kc2hha2VDb2RlIjoiMTAwMjI3NzYzLVRYbFFjbTlxIiwibWFpblNlcnZlclVSTCI6Imh0dHBzOi8vbWx0cy5keW5hbXNvZnQuY29tIiwib3JnYW5pemF0aW9uSUQiOiIxMDAyMjc3NjMiLCJzdGFuZGJ5U2VydmVyVVJMIjoiaHR0cHM6Ly9zbHRzLmR5bmFtc29mdC5jb20iLCJjaGVja0NvZGUiOjE4OTc4MDUzNDV9";
    Dynamsoft.DWT.ResourcesPath = "assets/dwt-resources";
    Dynamsoft.DWT.Containers = [{
        WebTwainId: 'dwtObject',
        ContainerId: this.containerID
    }];

    Dynamsoft.DWT.Load();
  }

  async initDCV(){
    try {
      const result = await init();
      if (result) {
        this.dcvReady = true;
      }
    } catch (error) {
      alert(error);
    }
  }
  

  async scan(){
    if (this.DWTObject) { 
      await this.DWTObject.SelectSourceAsync()
      await this.DWTObject.AcquireImageAsync({ IfCloseSourceAfterAcquire: true });
    }
  }

  edit(){
    if (this.DWTObject) { 
      const imageEditor = this.DWTObject.Viewer.createImageEditor();
      imageEditor.show();
    }
  }
}
