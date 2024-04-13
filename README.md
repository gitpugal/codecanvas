# CustomEditorByPugal

CustomEditorByPugal is an npm package that provides a versatile HTML design editor component called PixelEditor. This editor allows users to create and modify HTML designs with ease.

## Installation

You can install CustomEditorByPugal via npm:

```bash
npm install customeditorbypugal --force
```

## Usage

Once installed, you can import the PixelEditor component and use it in your React application:

```javascript
import { PixelEditor } from "customeditorbypugal";
import "customeditorbypugal/dist/components/css/main.css";

import React, { useRef } from "react";

const ImageUpload = () => {
  const editorRef = useRef(null);

  const callHandleReturnValue = () => {
    if (editorRef.current) {
      console.log(editorRef.current.exportHTML());
    }
  };

  const onReady = () => {
    alert("Editor loaded!");
  };

  return (
    <div className="w-full overflow-hidden">
      <PixelEditor projectId={'akjhghfg'} ref={editorRef} onReady={onReady} />
      <button className="bg-blue-600 rounded-md px-2 py-1 text-white font-semibold italic m-10" onClick={callHandleReturnValue}>Export HTML</button>
    </div>
  );
};

export default ImageUpload;
```

## Props

- `projectId`: A string representing the project ID. This prop is required for initializing the editor.
- `ref`: A ref to access the editor instance programmatically.
- `onReady`: A callback function triggered when the editor is loaded and ready for use.

## Exporting HTML

You can export the HTML content from the editor using the `exportHTML` method, as demonstrated in the example above.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

CustomEditorByPugal is developed and maintained by [Your Name]. For any inquiries or issues, please contact [Your Email].

## Contributions

Contributions are welcome! If you find any bugs or want to suggest improvements, feel free to open an issue or submit a pull request on [GitHub](https://github.com/yourusername/customeditorbypugal).

## Acknowledgements

Special thanks to [Any Acknowledgements, if applicable].

## Support

If you need assistance or have any questions, please reach out to [Your Email] for support.
