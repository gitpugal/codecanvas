interface EditorRef {
  exportHTML: () => string;
  loadHTML: (args: string) => void;
}

export default EditorRef;
