import "dynamsoft-license";

import "dynamsoft-barcode-reader";
import "dynamsoft-document-normalizer";
import "dynamsoft-label-recognizer";
import "dynamsoft-capture-vision-router";

import { CoreModule } from "dynamsoft-core";
import { LicenseManager } from "dynamsoft-license";
import { CodeParserModule, LabelRecognizerModule } from "dynamsoft-capture-vision-bundle";

let initialized = false;

export async function init(){
  if (initialized === false) {
    console.log("Initializing...");
    CoreModule.engineResourcePaths.rootDirectory = 'https://cdn.jsdelivr.net/npm/';
    await LicenseManager.initLicense("DLS2eyJoYW5kc2hha2VDb2RlIjoiMTAwMjI3NzYzLVRYbFFjbTlxIiwibWFpblNlcnZlclVSTCI6Imh0dHBzOi8vbWx0cy5keW5hbXNvZnQuY29tIiwib3JnYW5pemF0aW9uSUQiOiIxMDAyMjc3NjMiLCJzdGFuZGJ5U2VydmVyVVJMIjoiaHR0cHM6Ly9zbHRzLmR5bmFtc29mdC5jb20iLCJjaGVja0NvZGUiOjE4OTc4MDUzNDV9");
    await CoreModule.loadWasm(["DLR","DBR","DCP"]).catch((ex: any) => {
      let errMsg = ex.message || ex;
      console.error(errMsg);
      alert(errMsg);
    });
    await CodeParserModule.loadSpec("MRTD_TD1_ID");
    await CodeParserModule.loadSpec("MRTD_TD2_ID");
    await CodeParserModule.loadSpec("MRTD_TD3_PASSPORT");  
    await CodeParserModule.loadSpec("AAMVA_DL_ID");
    await LabelRecognizerModule.loadRecognitionData("MRZ");
  }
  initialized = true;
  return true;
}