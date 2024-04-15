# html-editor-react

html-editor-react is an npm package that provides a versatile HTML design editor component called PixelEditor. This editor allows users to create and modify HTML designs with ease.

# Installation

You can install html-editor-react via npm:

```bash
npm install html-editor-react --force
```

## Usage

Once installed, you can import the ReactEditor component and use it in your React application:

```javascript
import { ReactEditor } from "html-editor-react";
import "html-editor-react/dist/components/css/main.css";

import React, { useRef } from "react";

const ImageUpload = () => {
  const editorRef = useRef(null);

  return (
    <div className="w-full overflow-hidden">
      <ReactEditor  ref={editorRef} />
    </div>
  );
};

export default ImageUpload;
```

## Props

- `ref`: A ref to access the editor instance programmatically.

## Exporting HTML

You can export the HTML content from the editor using the `exportHTML` method, as demonstrated in the example above.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

html-editor-react is developed and maintained by [Your Name]. For any inquiries or issues, please contact [Your Email].

## Contributions

Contributions are welcome! If you find any bugs or want to suggest improvements, feel free to open an issue or submit a pull request on [GitHub](https://github.com/yourusername/html-editor-react).

## Acknowledgements

Special thanks to [Any Acknowledgements, if applicable].

## Support

If you need assistance or have any questions, please reach out to [Your Email] for support.
