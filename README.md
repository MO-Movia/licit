













<h1 align="center">Licit Editor</h1>

<div align="center">
  <strong>WYSIWYG editor based on ProseMirror & React</strong>
</div>
<div align="center">
  Includes significant text markup including size, face, color, line spacing, strikethrough, bold, italic, etc.; multi-level bullet/number lists; images with text wrapping and resizing; and a powerful table (with images and markup within table)
</div>
&nbsp;
<div align="center">

![Build Status](https://github.com/MO-Movia/licit/workflows/build/badge.svg?branch=main)
![GitHub last commit](https://img.shields.io/github/last-commit/MO-Movia/licit)
[![codecov](https://codecov.io/gh/MO-Movia/licit/branch/main/graph/badge.svg?token=33EHFUZOGL)](https://codecov.io/gh/MO-Movia/licit)
![Website](https://img.shields.io/website?down_color=red&down_message=Offline&up_color=green&up_message=Online&url=http://www.greathints.com)
<!-- ![Dependencies](https://david-dm.org/MO-Movia/licit.svg) -->
![Contributions welcome](https://img.shields.io/badge/contributions-welcome-orange.svg)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

</div>
<div align="center">
  <h3>
    <a href="https://github.com/MO-Movia/licit/wiki">Wiki
    </a>
    <span> | </span>
    <a href="http://greathints.com/licit">Demo
    </a>
    <span> | </span>
    <a href="https://prosemirror.net/">Based on...
    </a>
  </h3>
</div>

## Getting Started

### Getting repository

```
git clone https://github.com/MO-Movia/licit.git
```
### Install Prerequisite
```
Make(0.8.1)
Python(3.8.2)
```

### Install dependencies

 Pack [licit-ui-components](https://github.com/MO-Movia/licit-ui-components/tree/initial) and copy _modusoperandi-licit-ui-commands-0.0.1.tgz_ to the root folder.
```
cd licit
npm install
```

In order to upload image work correctly, "images" folder is expected outside the root folder 'licit'.


### Start the collaboration server
```
In Windows
To build collab server:
py build_collab_server.py

To run collab server:
py run_collab_server.py

In MacOS/Linux
To build collab server:
python build_collab_server.py

To run collab server:
python run_collab_server.py
```
### Start the custom style server
```
In Windows
To build customstyle server:
py build_customstyle_server.py

To run customstyle server:
py run_customstyle_server.py

In MacOS/Linux
To build customstyle server:
python build_customstyle_server.py

To run customstyle server:
python run_customstyle_server.py
```
To save custom styles in server "customstyles" folder is expected outside the root folder 'licit'.

### Start the image server for Upload image
```
In Windows
py run_image_server.py

In MacOS/Linux
python run_image_server.py
```
### Start the style service for Custom Styles
```
git clone https://github.com/MO-Movia/licit-style-service.git
Follow the README.md file to run the service.

```

### Start the web server

```
In Windows
py run_web_server.py

In MacOS/Linux
python run_web_server.py
```
Test http://localhost:3001/ from your browser.

### Build the distribution files
```
# At the working directory `licit`
npm run build:dist
```
## Use Licit as a component

For using licit in your project you should follow these steps:

 To build the licit pack, run the below commands:
```
# At the working directory `licit`
npm pack
```

Now you will find a *modusoperandi-licit-0.0.2.tgz* file in the licit directory.

Add this *.tgz* file to your own angular project and install it using the below command:
```
# At your angular working directory
npm install ./modusoperandi-licit-0.0.2.tgz
```

**After this you can import licit component in your application like:**
```
import { Licit } from '@modusoperandi/licit';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

// To create multiple instances:
ReactDOM.render(<Licit docID={1}/>, document.getElementById('root'));
ReactDOM.render(<Licit docID={1}/>, document.getElementById('root2'));
ReactDOM.render(<Licit docID={2}/>, document.getElementById('root3'));
ReactDOM.render(<Licit docID={3}/>, document.getElementById('root4'));

// OR
ReactDOM.render(React.createElement(Licit, {docID:1}), document.getElementById("root"));
ReactDOM.render(React.createElement(Licit, {docID:2}), document.getElementById("root2"));

 ```
 By default, the *collaboration* and the *prosemirror dev tool* are disabled for the editor.
 set  *docID* to *"0"* for disable the collaboration.
 User can enable the same using the below configuration:
 ```
 ReactDOM.render(React.createElement(Licit, {docID: 1, debug: true}), document.getElementById('root'));
```
**To use Custom run time in your component :**
 ```
 Use the below imports for access the image and style API

import type {ImageLike, StyleProps} from '@modusoperandi/licit';
import {POST, GET, DELETE, PATCH} from '@modusoperandi/licit';
import {setStyles} from '@modusoperandi/licit';
```

Please refer *licit\client\index.js* for getting more detailed idea on passing properties and fires events.

|Property Name| Description|Default Value|
|--|--|--|
| docID  |Id of the collaborative document. *docID* empty means collaboration disabled. Based on the value of *docID* decides the collaboration communication |
| collabServiceURL|URL of the collaboration service.|
| debug|Show/hide prosemirror dev tools|false
| width|Width of the editor|100%
| height|Height of the editor|100%
| readOnly |To enable/disable editing mode|false
| data |Document JSON/HTML data to be loaded into the editor|null
| dataType |Document data type - JSON/HTML|JSON
| disabled|To disable the editor|false
| embedded|To disable/enable inline behavior of the editor|false
| fitToContent|To disable/enable fit to content behavior of the editor|false
| runtime|To pass runtime to the editor. No value means default EditorRuntime | Expects a post method '*saveimage?fn=*' in the server with input parameters *File name and File object*, and this post method parse the form data and return response in JSON format (*{id: string, height: < height of the image>, src: <relative/full_path_of_the_image>, width: < width_of_the_image>}*). Please refer *licit\utils\build_web_server.js* for '*saveimage*' method sample.To configure style service to licit expects methods to saveStyle(),getStyles(),renameStyle() and removeStyle(). Please refer *licit\src\client\LicitRuntime.js* for getting more detailed idea.
| plugins| Array of prosemirror plugin object to pass external prosemirror plugins to the editor. No value means no external plugins | Expects a method '*getEffectiveSchema*' in the prosemirror plugin object that returns new schema object which is the effective schema modified with the current editor schema, that is passed as the input parameter to this method. Also must follow a order for adding  the plugins in the plugin array. And the order is the licit-plugin-contrib-styles plugin and objectId plugin should be the last items in that pluigin array.The reason for this is: Style should be handled after all the other plugins handle their own rendering. And ObjectID is required for all artifacts.

|Event Name| Description|Parameter|
|--|--|--|
|onChange | Fires after each significant change |<ul><li>data: document JSON</li><li>isEmpty: true when empty</li><li>view: prosemirror view</li></ul>
|onReady| Fires once when the editor is ready |licit reference

|Method Name| Description|Parameter|
|--|--|--|
|setProps | Update properties of the editor using an editor instance |<ul><li>props: Licit properties' object</li></ul>
|insertJSON | Insert node at the current cursor position |<ul><li>json: Node</li></ul>
|gotoEnd | Return focus to the editor with cursor at end of document  |</li></ul>

To set data to editor: 

> function setData() { 	const props = {};
>     Object.assign(props, this.props);
>     // here the *this.props* is the *ref* input from the onReadyCB(ref) (Please refer *licit\client\index.js* for onReadyCB(ref) method)
> 	props.data = {
> "type":"doc","attrs":{"layout":null,"padding":null,"width":null,"counterFlags":null},"content":[{"type":"paragraph","attrs":{"align":null,"color":null,"id":null,"indent":null,"lineSpacing":null,"paddingBottom":null,"paddingTop":null},"content":[{"type":"text","text":"Hello
> World!!!"}]}]};
>    this.setProps(props); }

To load the styles:
Either in *angular.json*, add
 *"styles": [
 "node_modules/@modusoperandi/licit/styles.css",
]*
OR
in the default global CSS file *src\styles.scss*, add
*@import  "@modusoperandi/licit/styles.css"*


Run *npm start* to see the licit editor inside the angular application.

Note: there is a nice Angular test app designed to test the component interface of licit here: https://github.com/melgish/licit-playground - which also allows you to load and save the JSON file.

## Use it for your own project

For using licit in your project you should follow these steps:

For example (in an Angular app):

```
# At the working directory `licit`
npm run build:licit
```

Now you will find a new directory (*bin*) with *licit.bundle.js* file.

Add this *bin* folder to your own project and also include the *licit.bundle.js* file in the scripts array of *angular.json* file as follows:

"scripts": [
"src/bin/licit.bundle.js"
]

To start the collaboration server, follow the steps below:

Run the Collaborative server in licit/servers directory using following command:

```
node run_licit_collab_server.bundle.js PORT='<yourPort>' IP='<yourIP/Hostname>'
```

NOTE: In case if you are hosting collab server in a different location or machine then you need to change the host name and port number in *licit\src\client\CollabConnector.js* accordingly.
```
const url = <yourLocationProtocol> + '\/\/' +
<yourIP/Hostname>+ ':<yourPort>/docs/' +
docID;
```
Run *ng serve* to see the collaborative licit editor inside the angular application.

**To deploy LICIT in a server:**
```
# At the working directory `licit`
npm install
npm run build:licit
```
Now you will find a *bin* directory, copy the files from bin to the server to run the *Licit* as a standalone application.

**You can install licit using the commit hash to include in your own `package.json`.**


For install the latest commit on master branch:
```
npm install --save "MO-Movia/licit"
```
For install a specific commit:
```
npm install --save "MO-Movia/licit#3de185eaccdfd745bc567d5358cf3281472d8df8"
```
You may find the latest commit hash at https://github.com/MO-Movia/licit/commits/master

## Windows Specific

Use Git bash or Windows Power Shell to install build and run the project
