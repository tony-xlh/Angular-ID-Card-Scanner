import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Dynamsoft from 'dwt';
import { WebTwain } from 'dwt/dist/types/WebTwain';

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

  ngOnInit(): void {
    this.initDWT();
  }

  initDWT(){
    Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', () => {
      this.DWTObject = Dynamsoft.DWT.GetWebTwain(this.containerID);
    });
    Dynamsoft.DWT.ProductKey = "DLS2eyJoYW5kc2hha2VDb2RlIjoiMTAwMjI3NzYzLVRYbFFjbTlxIiwibWFpblNlcnZlclVSTCI6Imh0dHBzOi8vbWx0cy5keW5hbXNvZnQuY29tIiwib3JnYW5pemF0aW9uSUQiOiIxMDAyMjc3NjMiLCJzdGFuZGJ5U2VydmVyVVJMIjoiaHR0cHM6Ly9zbHRzLmR5bmFtc29mdC5jb20iLCJjaGVja0NvZGUiOjE4OTc4MDUzNDV9";
    Dynamsoft.DWT.ResourcesPath = "assets/dwt-resources";
    Dynamsoft.DWT.Containers = [{
        WebTwainId: 'dwtObject',
        ContainerId: this.containerID
    }];

    Dynamsoft.DWT.Load();
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
