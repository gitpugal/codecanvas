import React, { useRef, useState, useEffect } from "react";
import grapesJS from "grapesjs";
import grapesJSMJML from "grapesjs-mjml";
import TypePlugin from "grapesjs-typed";

interface Props {
  children: React.ReactNode | React.ReactNode[];
}

const Editor: React.FC<Props> = ({ children }) => {
  const editorDevContainerRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>(null);

  const uploadEmailTemplateAssetsUrlToBucket = async () => {
    // implementation here
  };
  const getEmailTemplateAssetsUrlFromBucket = async () => {
    // implementation here
  };

  const uploadFileToBucket = async (base64: string, name: string) => {
    // implementation here
  };

  useEffect(() => {
    if (editorDevContainerRef.current !== null) {
      const editor: any = grapesJS.init({
        container: editorDevContainerRef.current,
        plugins: [grapesJSMJML, TypePlugin],
        blockManager: {
          blocks: [
            {
              id: "button",
              label: "Button",
              category: "MJML",
              activate: true,
              content: { type: "mj-button" },
            },
          ],
        },
        panels: {},
        styleManager: {
          sectors: [
            {
              name: "General",
              buildProps: [
                "float",
                "display",
                "position",
                "top",
                "right",
                "left",
                "bottom",
              ],
              properties: [
                // properties here
              ],
            },
          ],
        },
        storageManager: false,
        assetManager: {
          uploadFile: async (e: Event) => {
            // implementation here
          },
          assets: [],
        },
      });

      const updateAssets = async () => {
        try {
          const response: any = await getEmailTemplateAssetsUrlFromBucket();
          if (response.status === 200) {
            response.urls.forEach((url: any) => {
              editor?.AssetManager?.add(url);
            });
          }
        } catch (error) {
          console.log(error);
        }
      };
      updateAssets();

      editor.setComponents(`
            <mjml>
              <mj-body>
              </mj-body>
            </mjml>`);

      const panelManager = editor.Panels;
      const blockManager = editor.BlockManager;

      blockManager.add("unsubscribe-link", {
        label: "Unsubscribe",
        content: ` <mj-section>
          <mj-column>
            <mj-text align="center">
              If you don't want to receive our newsletters,
              <a href="{{Unsubscribe}}">Unsubscribe here</a>
            </mj-text>
          </mj-column>
        </mj-section>`,
        category: "section",
        attributes: {
          class: "fa fa-ban",
          // style: 'font-size:34px; padding:0px',
        },
      });

      // more code here
    }
  }, [editorDevContainerRef]);

  const exportHtml = () => {
    if (editor) {
      editor.runCommand("exportHTML");
    }
  };

  return (
    <div ref={editorDevContainerRef}>
      <h2>{children}</h2>
      <button onClick={exportHtml}>Export HTML</button>
    </div>
  );
};

export default Editor;
