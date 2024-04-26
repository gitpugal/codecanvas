
![Logo](https://app-leadsx10.s3.ap-south-1.amazonaws.com/leadsx10/assets/leadsx10-logo.png)


# LeadsX10 Email Editor

Introducing LeadsX10's drag-and-drop email editor, now with a React.js wrapper. Elevate your email creation with intuitive design and robust features. Experience unmatched flexibility seamlessly integrated into your workflow. Step into the future of email design with LeadsX10.


## Demo Preview

![App Screenshot](https://app-leadsx10.s3.ap-south-1.amazonaws.com/leadsx10/assets/npm-editor.jpg)


## Live Demo

Check out the live demo here:

https://www.youtube.com/watch?v=T3b8ijT27f4&t=211s
## Blog Post

Here's a blog post with a quickstart guide: [Documentation](https://linktodocumentation)


## Installation

Install Leadsx10 Email Editor from NPM for effortless integration into your React build process.

```bash
  npm install leadsx10-email-editor
```
    
## Usage

Require the EmailEditor component and render it with JSX:

```javascript
import React, { useRef } from "react";
import { LeadsX10Editor } from "leadsx10-email-editor";
import "leadsx10-email-editor/dist/components/css/main.css";

const App = () => {
  const htmlString = "";
  const editorRef = useRef(null);

  const onExport = () => {
    if (editorRef.current) {
      console.log(editorRef.current.exportHTML());
    }
  };

  const onReady = () => {
    alert("Editor loaded!");
    editorRef.current.loadHTML(htmlString);
  };

  return (
    <div>
      <LeadsX10Editor minHeight="100vh" apiKey={API_KEY} ref={editorRef} onReady={onReady} />
      <button onClick={onExport}>Export HTML</button>
    </div>
  );
};

export default App;
```


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`API_KEY`

Sign up on our homepage and obtain your API key from the settings.



## Support

For support, email :  support@leadsx10.io 


## Used By

This project is used by the following companies:

- [LeadsX10](https://leadsx10.io)



## Authors

- [Hari Prakash M](https://github.com/HariprakashM)
- [Pugalarasan M](https://github.com/gitpugal)


## License

Copyright (c) 2023 LeadsX10. [MIT](https://choosealicense.com/licenses/mit/) Licensed.

