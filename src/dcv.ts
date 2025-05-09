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

export const mrzTemplate = `
{
  "CaptureVisionTemplates": [
    {
      "Name": "ReadPassportAndId",
      "ImageROIProcessingNameArray": ["roi-passport-and-id"],
      "Timeout": 2000
    },
    {
      "Name": "ReadPassport",
      "ImageROIProcessingNameArray": ["roi-passport"],
      "Timeout": 2000
    },
    {
      "Name": "ReadId",
      "ImageROIProcessingNameArray": ["roi-id"],
      "Timeout": 2000
    }
  ],
  "TargetROIDefOptions": [
    {
      "Name": "roi-passport-and-id",
      "TaskSettingNameArray": ["task-passport-and-id"]
    },
    {
      "Name": "roi-passport",
      "TaskSettingNameArray": ["task-passport"]
    },
    {
      "Name": "roi-id",
      "TaskSettingNameArray": ["task-id"]
    }
  ],
  "TextLineSpecificationOptions": [
    {
      "Name": "tls_mrz_passport",
      "BaseTextLineSpecificationName": "tls_base",
      "StringLengthRange": [44, 44],
      "OutputResults": 1,
      "ExpectedGroupsCount": 1,
      "ConcatResults": 1,
      "ConcatSeparator": "\\n",
      "SubGroups": [
        {
          "StringRegExPattern": "(P[A-Z<][A-Z<]{3}[A-Z<]{39}){(44)}",
          "StringLengthRange": [44, 44],
          "BaseTextLineSpecificationName": "tls_base"
        },
        {
          "StringRegExPattern": "([A-Z0-9<]{9}[0-9][A-Z<]{3}[0-9]{2}[0-9<]{4}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{14}[0-9<][0-9]){(44)}",
          "StringLengthRange": [44, 44],
          "BaseTextLineSpecificationName": "tls_base"
        }
      ]
    },
    {
      "Name": "tls_mrz_id_td2",
      "BaseTextLineSpecificationName": "tls_base",
      "StringLengthRange": [36, 36],
      "OutputResults": 1,
      "ExpectedGroupsCount": 1,
      "ConcatResults": 1,
      "ConcatSeparator": "\\n",
      "SubGroups": [
        {
          "StringRegExPattern": "([ACI][A-Z<][A-Z<]{3}[A-Z<]{31}){(36)}",
          "StringLengthRange": [36, 36],
          "BaseTextLineSpecificationName": "tls_base"
        },
        {
          "StringRegExPattern": "([A-Z0-9<]{9}[0-9][A-Z<]{3}[0-9]{2}[0-9<]{4}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{8}){(36)}",
          "StringLengthRange": [36, 36],
          "BaseTextLineSpecificationName": "tls_base"
        }
      ]
    },
    {
      "Name": "tls_mrz_id_td1",
      "BaseTextLineSpecificationName": "tls_base",
      "StringLengthRange": [30, 30],
      "OutputResults": 1,
      "ExpectedGroupsCount": 1,
      "ConcatResults": 1,
      "ConcatSeparator": "\\n",
      "SubGroups": [
        {
          "StringRegExPattern": "([ACI][A-Z<][A-Z<]{3}[A-Z0-9<]{9}[0-9<][A-Z0-9<]{15}){(30)}",
          "StringLengthRange": [30, 30],
          "BaseTextLineSpecificationName": "tls_base"
        },
        {
          "StringRegExPattern": "([0-9]{2}[(01-12)][(01-31)][0-9][MF<][0-9]{2}[0-9<]{4}[0-9][A-Z<]{3}[A-Z0-9<]{11}[0-9]){(30)}",
          "StringLengthRange": [30, 30],
          "BaseTextLineSpecificationName": "tls_base"
        },
        {
          "StringRegExPattern": "([A-Z<]{30}){(30)}",
          "StringLengthRange": [30, 30],
          "BaseTextLineSpecificationName": "tls_base"
        }
      ]
    },
    {
      "Name": "tls_base",
      "CharacterModelName": "MRZ",
      "CharHeightRange": [5, 1000, 1],
      "BinarizationModes": [
        {
          "BlockSizeX": 30,
          "BlockSizeY": 30,
          "Mode": "BM_LOCAL_BLOCK",
          "EnableFillBinaryVacancy": 0,
          "ThresholdCompensation": 15
        }
      ],
      "ConfusableCharactersCorrection": {
        "ConfusableCharacters": [
          ["0", "O"],
          ["1", "I"],
          ["5", "S"]
        ],
        "FontNameArray": ["OCR_B"]
      }
    }
  ],
  "LabelRecognizerTaskSettingOptions": [
    {
      "Name": "task-passport",
      "ConfusableCharactersPath": "ConfusableChars.data",
      "TextLineSpecificationNameArray": ["tls_mrz_passport"],
      "SectionImageParameterArray": [
        {
          "Section": "ST_REGION_PREDETECTION",
          "ImageParameterName": "ip-mrz"
        },
        {
          "Section": "ST_TEXT_LINE_LOCALIZATION",
          "ImageParameterName": "ip-mrz"
        },
        {
          "Section": "ST_TEXT_LINE_RECOGNITION",
          "ImageParameterName": "ip-mrz"
        }
      ]
    },
    {
      "Name": "task-id",
      "ConfusableCharactersPath": "ConfusableChars.data",
      "TextLineSpecificationNameArray": ["tls_mrz_id_td1", "tls_mrz_id_td2"],
      "SectionImageParameterArray": [
        {
          "Section": "ST_REGION_PREDETECTION",
          "ImageParameterName": "ip-mrz"
        },
        {
          "Section": "ST_TEXT_LINE_LOCALIZATION",
          "ImageParameterName": "ip-mrz"
        },
        {
          "Section": "ST_TEXT_LINE_RECOGNITION",
          "ImageParameterName": "ip-mrz"
        }
      ]
    },
    {
      "Name": "task-passport-and-id",
      "ConfusableCharactersPath": "ConfusableChars.data",
      "TextLineSpecificationNameArray": ["tls_mrz_passport", "tls_mrz_id_td1", "tls_mrz_id_td2"],
      "SectionImageParameterArray": [
        {
          "Section": "ST_REGION_PREDETECTION",
          "ImageParameterName": "ip-mrz"
        },
        {
          "Section": "ST_TEXT_LINE_LOCALIZATION",
          "ImageParameterName": "ip-mrz"
        },
        {
          "Section": "ST_TEXT_LINE_RECOGNITION",
          "ImageParameterName": "ip-mrz"
        }
      ]
    }
  ],
  "CharacterModelOptions": [
    {
      "DirectoryPath": "",
      "Name": "MRZ"
    }
  ],
  "ImageParameterOptions": [
    {
      "Name": "ip-mrz",
      "TextureDetectionModes": [
        {
          "Mode": "TDM_GENERAL_WIDTH_CONCENTRATION",
          "Sensitivity": 8
        }
      ],
      "BinarizationModes": [
        {
          "EnableFillBinaryVacancy": 0,
          "ThresholdCompensation": 21,
          "Mode": "BM_LOCAL_BLOCK"
        }
      ],
      "TextDetectionMode": {
        "Mode": "TTDM_LINE",
        "CharHeightRange": [5, 1000, 1],
        "Direction": "HORIZONTAL",
        "Sensitivity": 7
      }
    }
  ]
}
`