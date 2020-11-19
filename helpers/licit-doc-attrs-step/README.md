# licit-doc-attrs-step
Module that extend Step, overriding the apply, invert, map, getMap and fromJSON methods, and registering your class with a unique JSON-serialization identifier using Step.jsonID.

## Build

 - npm install 
 - npm pack

## Usage

Put the .tgz file in your project location, open command prompt and run:

npm install modusoperandi-licit-doc-attrs-step-0.0.1.tgz --save

import { SetDocAttrStep } from '@modusoperandi/licit-doc-attrs-step';
