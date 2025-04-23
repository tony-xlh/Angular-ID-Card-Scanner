import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Dynamsoft from 'dwt';
import { WebTwain } from 'dwt/dist/types/WebTwain';
import { init, mrzTemplate } from "../dcv";
import { CaptureVisionRouter, CodeParser, EnumBarcodeFormat } from 'dynamsoft-capture-vision-bundle';

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
  router:CaptureVisionRouter|undefined;
  parser:CodeParser|undefined;
  info:HolderInfo = {
    firstName:"",
    lastName:"",
    docNumber:"",
    birthDate:"",
    sex:""
  };
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
        this.router = await CaptureVisionRouter.createInstance();
        this.parser = await CodeParser.createInstance();
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

  getBlobFromSelectedImage():Promise<Blob>{
    return new Promise((resolve, reject) => {
      if (this.DWTObject) {
        this.DWTObject.ConvertToBlob(
          [this.DWTObject.CurrentImageIndexInBuffer],
          Dynamsoft.DWT.EnumDWT_ImageType.IT_JPG,
          function (result, indices, type) {
            resolve(result);
          },
          function (errorCode, errorString) {
            reject(errorString);
          }
        );
      }
    });
  }

  async readBarcodes(){
    if (this.router && this.parser) {
      this.router.resetSettings();
      let blob = await this.getBlobFromSelectedImage();
      let result = await this.router.capture(blob,"ReadBarcodes_Balance");
      if (result.barcodeResultItems) {
        for (let index = 0; index < result.barcodeResultItems.length; index++) {
          const item = result.barcodeResultItems[index];
          if (item.format != EnumBarcodeFormat.BF_PDF417) {
            continue;
          }
          let parsedItem = await this.parser.parse(item.text);
          if (parsedItem.codeType === "AAMVA_DL_ID") {
            let number = parsedItem.getFieldValue("licenseNumber");
            let firstName = parsedItem.getFieldValue("firstName");
            let lastName = parsedItem.getFieldValue("lastName");
            let birthDate = parsedItem.getFieldValue("birthDate");
            let sex = parsedItem.getFieldValue("sex");
            this.info = {
              firstName:firstName,
              lastName:lastName,
              docNumber:number,
              birthDate:birthDate,
              sex:sex
            };
          }
          return;
        }
      }
      
    }
  }

  async readMRZ(){
    if (this.router && this.parser) {
      let blob = await this.getBlobFromSelectedImage();
      await this.router.initSettings(JSON.parse(mrzTemplate));
      let result = await this.router.capture(blob,"ReadPassportAndId");
      if (result.textLineResultItems) {
        let parsedItem = await this.parser.parse(result.textLineResultItems[0].text);
        console.log(parsedItem);
        if (parsedItem.codeType.indexOf("MRTD") != -1) {
          let number = parsedItem.getFieldValue("documentNumber");
          if (!number) {
            number = parsedItem.getFieldValue("passportNumber");
          }
          let firstName = parsedItem.getFieldValue("primaryIdentifier");
          let lastName = parsedItem.getFieldValue("secondaryIdentifier");
          let birthDate = parsedItem.getFieldValue("dateOfBirth");
          let sex = parsedItem.getFieldValue("sex");
          this.info = {
            firstName:firstName,
            lastName:lastName,
            docNumber:number,
            birthDate:birthDate,
            sex:sex
          };
        }
      }
    }
  }
}

export interface HolderInfo {
  lastName:string;
  firstName:string;
  birthDate:string;
  sex:string;
  docNumber:string;
}
