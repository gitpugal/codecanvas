import "grapesjs/dist/css/grapes.min.css";
import grapesJS from "grapesjs";
import { useEffect, useRef, useState } from "react";
import blocks from "grapesjs-blocks-basic";
import forms from "grapesjs-plugin-forms";
import countdown from "grapesjs-component-countdown";
import exportPlugin from "grapesjs-plugin-export";
// @ts-ignore
import tabs from "grapesjs-tabs";
import customCOde from "grapesjs-custom-code";
// @ts-ignore
import tooltip from "grapesjs-tooltip";
// @ts-ignore
import tuiEditor from "grapesjs-tui-image-editor";
import typed from "grapesjs-typed";
// @ts-ignore
import presetWebpage from "grapesjs-preset-webpage";
import { LuLoader2 } from "react-icons/lu";
import newsLetter from "grapesjs-preset-newsletter";

import React, { forwardRef, useImperativeHandle } from "react";

const Editor = forwardRef((props: any, ref: any) => {
  //  export html function code
  const exportHTML = () => {
    const html: any = editor.getHtml();
    const css: any = editor.getCss();
    const result = `<html>
    <head>
    <style>
    ${css}
    </style>
    </head>
    ${html}
    </html>`;

    // incrementing export count by one using API
    fetch("https://backend.editor.leadsx10.io/api/auth/html-exports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: props.apiKey,
      }),
    });
    return result;
  };

  // This function is used for rendering intial html provided by the user
  const loadHTML = (fullHTML: string) => {
    var cssRegex = /<style>([\s\S]+?)<\/style>/i;
    var htmlRegex = /<\/head>([\s\S]+?)<\/html>/i;

    var cssMatch = cssRegex.exec(fullHTML);
    var cssContent = cssMatch ? cssMatch[1] : "";

    var htmlMatch = htmlRegex.exec(fullHTML);
    var htmlContent = htmlMatch ? htmlMatch[1] : "";

    // // console.log("CSS Content:", cssContent);
    // // console.log("HTML Content:", htmlContent);

    editor.setComponents(htmlContent);
    editor.setStyle(cssContent);
  };

  const [errMessage, setErrMessage] = useState(null);

  // Expose handleReturnValue function through ref
  useImperativeHandle(ref, () => ({
    exportHTML: () => {
      return exportHTML();
    },
    loadHTML: (val: string) => {
      if (val && val.length > 0) {
        loadHTML(val);
      }
    },
  }));

  const editorContainerRef = useRef(null);
  const [isEditorLoaded, setIsEditorLoaded] = useState(false);
  const [editor, setEditor]: any = useState(null);
  const [userData, setUserData] = useState(null);

  // this function is used verify the user API_key using the backend and gets the user data uses it to render user project
  // information like allowed blocks, domains etc,.
  const verify = async () => {
    try {
      // setIsEditorLoaded(true);
      const res = await fetch(
        "https://backend.editor.leadsx10.io/api/auth/init",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            api_key: props.apiKey,
            domain: window.location.hostname,
          }),
        }
      );
      if (res.status >= 400) {
        const data = await res.json();
        setErrMessage(data.message);
        return false;
      }
      const data = await res.json();
      // setAuthData(data);
      return data;
    } catch (e) {
      // console.log(e);
      setIsEditorLoaded(false);
      return false;
    }
  };

  // This is the main useEffect where all the user verification and grapesjs editor initialisation is done.
  useEffect(() => {
    // This is the main function used to initialse the editor.
    const initEditor = async () => {
      if (editorContainerRef.current !== null) {
        // First we are calling the verify function to get the user details for the given API_KEY by the user in editor props.
        const data = await verify();

        // So now if the user is authenticated and verified we are proceeding to initialse the grapesjs editor with the user data
        // we got from the verify function
        if (data && data.authenticated == true) {
          setUserData(data?.user);
          console.log(data?.user);
          // This is where the actual grapesjs initialsation starts using grapesjs.init()
          const editor: any = grapesJS.init({
            // this is the container where will display the editor.
            container: editorContainerRef.current,

            // mentioning external plugins that we used in the editor
            plugins: [
              blocks,
              // forms,
              countdown,
              exportPlugin,
              tabs,
              customCOde,
              tooltip,
              tuiEditor,
              typed,
              presetWebpage,
              newsLetter,
            ],

            // options for the customising the external plugins that we had used
            pluginsOpts: {
              blocks: { flexGrid: true },
              tuiEditor: {
                script: [
                  // 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/1.6.7/fabric.min.js',
                  "https://uicdn.toast.com/tui.code-snippet/v1.5.2/tui-code-snippet.min.js",
                  "https://uicdn.toast.com/tui-color-picker/v2.2.7/tui-color-picker.min.js",
                  "https://uicdn.toast.com/tui-image-editor/v3.15.2/tui-image-editor.min.js",
                ],
                style: [
                  "https://uicdn.toast.com/tui-color-picker/v2.2.7/tui-color-picker.min.css",
                  "https://uicdn.toast.com/tui-image-editor/v3.15.2/tui-image-editor.min.css",
                ],
              },
              tabs: {
                tabsBlock: { category: "Extra" },
              },
              typed: {
                block: {
                  category: "Extra",
                  content: {
                    type: "typed",
                    "type-speed": 40,
                    strings: ["Text row one", "Text row two", "Text row three"],
                  },
                },
              },
              presetWebpage: {
                modalImportTitle: "Import Template",
                modalImportLabel:
                  '<div style="margin-bottom: 10px; font-size: 13px;">Paste here your HTML/CSS and click Import</div>',
                modalImportContent: function (editor: any) {
                  return (
                    editor.getHtml() + "<style>" + editor.getCss() + "</style>"
                  );
                },
              },
            },

            // we set the storage manager to false because we dont want backup of the design on reload of the window.
            storageManager: false,

            assetManager: {
              // this function uploads the assets that are imported by the user using the assetmanager the API that we provide
              // and use our API as storage bucket
              uploadFile: (e: any) => {
                const file = e.dataTransfer
                  ? e.dataTransfer.files[0]
                  : e.target.files[0];
                const maxFileSize = 2 * 1024 * 1024; // 2 MB
                if (
                  (data?.user?.plan?.name == "free" ||
                    data?.user?.plan?.name == "Free") &&
                  file &&
                  file?.size > maxFileSize
                ) {
                  alert(
                    "File size exceeds the maximum limit (2MB). Please choose a smaller file."
                  );
                  return;
                }
                const reader = new FileReader();
                reader.onload = async (e) => {
                  const dataURL: any = e?.target?.result;
                  // console.log("Data URL:", dataURL);
                  const base64Data = dataURL?.split(",")[1];
                  const jsonBlob = new Blob([JSON.stringify(base64Data)], {
                    type: "application/json",
                  });
                  let formData = new FormData();
                  const name = file?.name
                    ?.replace(/\.[^.]+$/, "")
                    .replace(" ", "_");
                  formData.append("file", jsonBlob);
                  formData.append("name", name);
                  formData.append("api_key", data?.user?.api_key);
                  const res = await fetch(
                    "https://backend.editor.leadsx10.io/api/bucket/upload",
                    {
                      method: "POST",
                      body: formData,
                    }
                  );
                  if (res && res?.status == 200) {
                    const data = await res.json();
                    editor?.AssetManager?.add(data.url);
                  } else {
                    alert("Unauthorised Access or domain not allowed!");
                  }

                  // uploadFile(dataURL.split(",")[1], name + ".jpeg").then(
                  //   (res) => {
                  //     // console.log(res);
                  //     editor?.AssetManager?.add(res);
                  //   }
                  // );
                };
                reader.readAsDataURL(file);
              },

              // default assets that must be displayed at the initialisation of the editor.
              assets: data?.images ? data?.images : [],
            },
            canvasCss: `
            .gjs-selected {
                border-radius: 8px !important;
                outline-width: 3px !important;
            }
       `,
          });

          const panelManager = editor.Panels;
          const blockManager = editor.BlockManager;

          // Below code is used to add custom blocks to the editor

          blockManager.add("custom-link", {
            label: "Link Button",
            content: `<a class="custom-button">Link Button</a>`,
            category: "section",
            attributes: { class: "fa " },
          });

          blockManager.add("custom-button", {
            label: "Button",
            content: `<button class="custom-button">Send</button>`,
            category: "section",
            attributes: { class: "fa " },
          });
          blockManager.add("columns-4", {
            label: "4 Columns",
            content: `<div class="gjs-row">
        <div class="gjs-cell col-4" ></div>
        <div class="gjs-cell col-4" ></div>
        <div class="gjs-cell col-4" ></div>
        <div class="gjs-cell col-4" ></div>
      </div>`,
            category: "section",
            media: `<svg style="width:40px;height:40px" viewBox="0 0 40 40">
      <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
  </svg>`,
            attributes: {
              style: {},
            },
          });

          blockManager.add("columns-4a", {
            label: "2/4/2/4 Columns",
            content: `<div class="gjs-row">
        <div class="gjs-cell col-17" ></div>
        <div class="gjs-cell col-33" ></div>
        <div class="gjs-cell col-17" ></div>
        <div class="gjs-cell col-33" ></div>
      </div>`,
            category: "section",

            attributes: { class: "fa  text-center" },
            appendTo: "#editMenu",
          });

          blockManager.add("columns-a4", {
            label: "4/2/4/2 Columns",
            content: `<div class="gjs-row">
      <div class="gjs-cell col-33" ></div>
        <div class="gjs-cell col-17" ></div>
        <div class="gjs-cell col-33" ></div>
        <div class="gjs-cell col-17" ></div>
      </div>`,
            category: "section",

            attributes: { class: "fa  text-center" },
          });
          blockManager.add("columns-3/7", {
            label: "8/4 Columns",
            content: `<div class="gjs-row">
        <div class="gjs-cell col-7" ></div>
        <div class="gjs-cell col-3" ></div>
      </div>`,
            category: "section",
            attributes: { class: "fa " },
          });

          blockManager.add("hero", {
            label: "Hero",
            content: `<div class="gjs-hero">
        <h2 class="gjs-hero-h2">Your Title</h2>
      </div>`,
            category: "Component",
            attributes: { class: "fa fa-box" },
          });

          blockManager.add("list", {
            label: "List",
            content: `<ul class="gjs-list">
          <h3><b>List Title</b></h3>
        <li>List Items</li>
        <li>List Items</li>
        <li>List Items</li>
        <li>List Items</li>
      </div>`,
            category: "section",
            media: `<svg style="width:40px;height:40px" viewBox="0 0 40 40">
      <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
  </svg>`,
            attributes: {
              style: {},
            },
          });

          blockManager.add("spacer", {
            label: "Spacer",
            content: `<div class="gjs-spacer">
      </div>`,
            category: "section",
          });

          blockManager.add("social-elements", {
            label: "Socials",
            content: `
         <div class="social-icons-container">
          <a class="headlink" href="https://www.google.com"style="font-size: 50px;">
          <img
          width="30px" style="margin: 5px 5px;"
          href="/"
          src="https://app-leadsx10.s3.ap-south-1.amazonaws.com/leadsx10/theme/v1/icons/ico-social/whatsapp.png"
          >
          </a>
          <a class="headlink" href="https://www.google.com"style="font-size: 50px;">
          <img
          width="30px" style="margin: 5px 5px;"
          href="/"
          src="https://app-leadsx10.s3.ap-south-1.amazonaws.com/leadsx10/theme/v1/icons/ico-social/linkedin.png"
          >
          </a> <a class="headlink" href="https://www.google.com"style="font-size: 50px;">
          <img
          width="30px" style="margin: 5px 5px;"
          href="/"
          src="https://app-leadsx10.s3.ap-south-1.amazonaws.com/leadsx10/theme/v1/icons/ico-social/youtube.png"
          >
          </a>
           <a class="headlink" href="https://www.google.com"style="font-size: 50px;">
          <img
          width="30px" style="margin: 5px 5px;"
          href="/"
          src="https://app-leadsx10.s3.ap-south-1.amazonaws.com/leadsx10/theme/v1/icons/ico-social/instagram.png"
          >
          </a>
          <a class="headlink" href="https://www.google.com"style="font-size: 50px;">
          <img
          width="30px" style="margin: 5px 5px;"
          href="/"
          src="https://app-leadsx10.s3.ap-south-1.amazonaws.com/leadsx10/theme/v1/icons/ico-social/twitter.png"
          >
          </a>   <a class="headlink" href="https://www.google.com"style="font-size: 50px;">
          <img
          width="30px" style="margin: 5px 5px;"
          href="/"
          src="https://app-leadsx10.s3.ap-south-1.amazonaws.com/leadsx10/theme/v1/icons/ico-social/facebook.png"
          >
          </a>
          </div>
          `,
            category: "components",
            attributes: {
              class: "fa social-custom-icon",
            },
          });

          editor.Css.setRule(".gjs-spacer", {
            height: "75px",
            width: "100%",
            "pointer-events": "none",
          });

          editor.Css.setRule(".custom-button", {
            "background-color": "#3b82f6",
            "font-size": "15px",
            padding: "7px 20px",
            "border-radius": "5px",
            border: "none",
            color: "white",
            display: "inline-block",
            "text-decoration": "none",
            "line-height": 1.5,
          });
          editor.Css.setRule(".social-icons-container", {
            display: "flex",
            "align-items": "center",
            "justify-items": "center",
            "justify-content": "center",
            gap: "5px",
          });

          editor.Css.setRule(".gjs-hero", {
            "background-image": "url('https://placehold.co/600x400')",
            "background-size": "cover",
            "background-position": "center",
            height: "350px",
            width: "100%",
            display: "flex",
            "align-items": "center",
            "justify-items": "center",
            "justify-content": "center",
          });

          editor.Css.setRule(".gjs-hero-h2", {
            "font-size": "100px",
            "font-family": "sans-serif",
          });
          editor.Css.setRule(".col-4", { width: "25%" });
          editor.Css.setRule(".gjs-custom-form", { padding: "10px" });
          editor.Css.setRule(".col-3", { width: "30%" });
          editor.Css.setRule(".col-7", { width: "70%" });
          editor.Css.setRule(".col-33", { width: "33%" });

          editor.Css.setRule(".gjs-cell", {
            "min-height": "75px",
            "flex-grow": 1,
            "flex-basis": "100%",
          });
          editor.Css.setRule(".gjs-row", {
            display: "flex",
            "justify-content": "flex-start",
            "align-items": "stretch",
            "flex-wrap": "nowrap",
            padding: "10px",
          });

          editor.Css.addRules(
            `@media (max-width: 768px) {
        .gjs-row {
          flex-wrap: wrap !important;
        }
      }`
          );
          panelManager.removeButton("views", "open-sm");
          panelManager.removeButton("views", "open-tm");
          panelManager.removeButton("views", "open-layers");
          panelManager.removeButton("views", "open-blocks");

          // These are the panel button that appear in right corner of the editor which are Blocks, Styles and settings panel button.
          panelManager.addButton("views", {
            id: "preview",
            label: "Components",
            command: "open-blocks",
            attributes: {
              title: "Components",
              id: "blocks-button",
              class: "tabButtons",
            },
          });
          panelManager.addButton("views", {
            id: "styles",
            label: "Styles",
            command: "open-sm",
            attributes: {
              title: "Style Manager",
              id: "sm-button",
              class: "tabButtons",
            },
          });
          panelManager.addButton("views", {
            id: "trait",
            command: "open-tm",
            label: "Settings",
            attributes: {
              title: "Trait Manager",
              id: "trait-button",
              class: "tabButtons",
            },
          });

          // The Below code is used add custom functions to the editor which then can be called by the blocks in the editor.
          editor.Commands.add("set-device-desktop", {
            run: (editor: any) => {
              editor.setDevice("Desktop");
            },
          });

          editor.Commands.add("sayHello", {
            run: (editor: any) => {
              alert("Hello!");
            },
          });
          editor.Commands.add("set-device-tablet", {
            run: (editor: any) => {
              editor.setDevice("Tablet");
            },
          });
          editor.Commands.add("set-device-mobile", {
            run: (editor: any) => {
              editor.setDevice("Mobilee");
            },
          });

          // The below code is used to add devices sizes for the user responsive styling the HTML design by the end user.
          editor.Devices.add({
            id: "tablet2",
            name: "Mobilee",
            width: "400px",
            widthMedia: "810px",
            height: "100%",
          });

          editor.Commands.add("exportHTML", {
            run: async (editor: any, sender: any) => {
              // console.log(editor.getHtml());
              // console.log(editor.getCss());
            },
          });

          //Clear Button
          editor.Commands.add("cmd-clear", {
            run: (editor: any) => {
              editor.DomComponents.clear();
              editor.CssComposer.clear();
            },
          });

          //Undo
          editor.Commands.add("undo", {
            run: (editor: any) => editor.UndoManager.undo(),
          });

          // Redo
          editor.Commands.add("redo", {
            run: (editor: any) => editor.UndoManager.redo(),
          });

          const rte = editor.RichTextEditor;
          rte.remove("wrap");
          rte.remove("link");

          rte.add("link", {
            icon: "<b>L</b>",
            attributes: { title: "Link", name: "link" },
            result: (rte: any, action: any) => {
              editor
                .getSelected()
                .append(`<span>  </span><a href="#">Link</a>`);
              if (
                !document
                  ?.getElementById("trait-button")
                  ?.classList.contains("gjs-pn-active")
              ) {
                document?.getElementById("trait-button")?.click();
              }
              return;
            },
          });

          editor.Components.addType("button", {
            isComponent: (el: any) => el.tagName === "button",
            model: {
              defaults: {
                traits: [
                  {
                    type: "text",
                    name: "text",
                    changeProp: true,
                    label: "Text",
                  },
                  "id",
                  "href",
                ],
              },
            },
          });

          editor.Components.addType("custom-button", {
            isComponent: (el: any) => el.tagName === "a",
            model: {
              defaults: {
                traits: [
                  {
                    type: "text",
                    name: "text",
                    changeProp: true,
                    label: "Text",
                  },
                  "id",
                  "href",
                ],
              },
            },
          });
          rte.add("Shortcodes", {
            name: "Shortcodes",
            icon: `
              <select >
                  <option selected="true" disabled="disabled" id="defaultPlaceholder">Shortcodes</option>
                  <option value="{{Name}}">{{Name}}</option>
                  <option value="{{First_name}}">{{First_name}}</option>
                  <option value="{{Last_name}}">{{Last_name}}</option>
                  <option value="{{Email}}">{{Email}}</option>
                  <option value="{{Phone}}">{{Phone}}</option>
                  <option value="{{Age}}">{{Age}}</option>
                  <option value="{{Gender}}">{{Gender}}</option>
                  <option value="{{City}}">{{City}}</option>
                  <option value="{{State}}">{{State}}</option>
                  <option value="{{Country}}">{{Country}}</option>
                  <option value="{{Pincode}}">{{Pincode}}</option>
                  <option value="{{Personalization_a}}">{{Personalization_a}}</option>
                  <option value="{{Personalization_b}}">{{Personalization_b}}</option>
                  <option value="{{Personalization_c}}">{{Personalization_c}}</option>
                  <option value="{{Personalization_d}}">{{Personalization_d}}</option>
                  <option value="{{Personalization_e}}">{{Personalization_e}}</option>
              </select>
          `,
            event: "change",
            result: (rte: any, action: any) => {
              editor
                .getSelected()
                .append(
                  " " + action.btn.children[0].selectedOptions[0].value + " "
                );
            },
          });

          if (!panelManager.getPanel("db")) {
            panelManager.addPanel({
              id: "db",
              appendTo: "#custompanel",

              buttons: [
                {
                  id: "redo",
                  label: '<i class="fa fa-repeat"></i>',
                  command: "redo",
                  attributes: { title: "redo" },
                },
                {
                  id: "undo",
                  label: '<i class="fa fa-undo"></i>',
                  command: "undo",
                  attributes: { title: "undo" },
                },
                // {
                //   id: "visibility",
                //   label: '<i class="fa fa-eye"></i>',
                //   command: "sw-visibility",
                //   toggle: false,
                //   attributes: { title: "visibility" },
                // },
              ],
            });
          }
          if (!panelManager.getPanel("devices")) {
            panelManager.addPanel({
              id: "devices",
              appendTo: "#custompanel",

              buttons: [
                {
                  id: "device-desktop",
                  label: '<i class="fa fa-television cus"></i>',
                  command: "set-device-tablet",
                  togglable: true,
                  active: true,
                },

                {
                  id: "device-mobile",
                  label: '<i class="fa fa-mobile"></i>',
                  command: "set-device-mobile",
                  togglable: true,
                },
              ],
            });
          }

          panelManager.removePanel("command");
          panelManager.removePanel("options");
          panelManager.removePanel("devices-c");

          if (document.getElementsByClassName("gjs-mdl-dialog") != undefined) {
            document
              .getElementsByClassName("gjs-mdl-dialog")[0]
              .classList.remove("gjs-one-bg");
          }

          // These are all of the available block that are in the editor.
          const blocksWithCategory = [
            { customIcon: ``, name: "column1", category: "Blocks", code: "B1" },
            { customIcon: ``, name: "column2", category: "Blocks", code: "B2" },
            { customIcon: ``, name: "column3", category: "Blocks", code: "B3" },
            {
              customIcon: `  <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M2 3h20v16H2V3zM6 3v16M12 3v16M17 3v16"
                stroke="currentColor"
                fill="none"
              />
            </svg>`,
              name: "columns-4",
              category: "Blocks",
              code: "B4",
            },

            {
              customIcon: ``,
              name: "column3-7",
              category: "Blocks",
              code: "B5",
            },
            {
              customIcon: `<svg viewBox="0 0 24 24" transform="scale(-1, 1)">
              <g>
                <path fill="currentColor" d="M2 20h5V4H2v16Zm-1 0V4a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1Z"></path>
                <path fill="currentColor" d="M10 20h12V4H10v16Zm-1 0V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1Z"></path>
              </g>
            </svg>
            `,
              name: "columns-3/7",
              category: "Blocks",
              code: "B6",
            },
            {
              customIcon: `<svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M2 3h20v16H2V3zM5 3v16M12 3v16M15 3v16"
                stroke="currentColor"
                fill="none"
              />
            </svg>`,
              name: "columns-4a",
              category: "Blocks",
              code: "B7",
            },
            {
              customIcon: `
              <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M2 3h20v16H2V3zM9 3v16M12 3v16M19 3v16"
                stroke="currentColor"
                fill="none"
              />
            </svg>
              `,
              name: "columns-a4",
              category: "Blocks",
              code: "B8",
            },

            {
              customIcon: ``,
              name: "list-items",
              category: "Tools",
              code: "T2",
            },
            // {
            //   customIcon: `<svg viewBox="0 0 24 24">
            //   <path fill="currentColor" d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z"></path>
            // </svg>`,
            //   name: "button",
            //   category: "Tools",
            //   code: "T1",
            // },
            {
              customIcon: `<svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M20 20.5C20 21.3 19.3 22 18.5 22H13C12.6 22 12.3 21.9 12 21.6L8 17.4L8.7 16.6C8.9 16.4 9.2 16.3 9.5 16.3H9.7L12 18V9C12 8.4 12.4 8 13 8S14 8.4 14 9V13.5L15.2 13.6L19.1 15.8C19.6 16 20 16.6 20 17.1V20.5M20 2H4C2.9 2 2 2.9 2 4V12C2 13.1 2.9 14 4 14H8V12H4V4H20V12H18V14H20C21.1 14 22 13.1 22 12V4C22 2.9 21.1 2 20 2Z"></path>
          </svg>`,
              name: "custom-button",
              category: "Tools",
              code: "T1",
            },

            {
              customIcon: ``,
              name: "grid-items",
              category: "Tools",
              code: "T7",
            },

            // {
            //   customIcon: ``,
            //   name: "countdown",
            //   category: "Tools",
            //   code: "T3",
            // },
            // {
            //   customIcon: ``,
            //   name: "custom-code",
            //   category: "Tools",
            //   code: "T4",
            // },
            {
              customIcon: ``,
              name: "divider",
              category: "Tools",
              code: "T5",
            },
            {
              customIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <rect width="24" height="24" fill="white"/>
              <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" />
              <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 3l-6 6" />
              <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M14 3l-7 7" />
              <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M19 3l-7 7" />
              <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 6l-4 4" />
              <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 10h18" />
              <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M10 10v11" />
          </svg>
          `,
              name: "hero",
              category: "Tools",
              code: "T8",
            },
            {
              customIcon: ``,
              name: "image",
              category: "Tools",
              code: "T6",
            },

            {
              customIcon: `
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="icon icon-tabler icons-tabler-outline icon-tabler-list"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M9 6l11 0" />
                  <path d="M9 12l11 0" />
                  <path d="M9 18l11 0" />
                  <path d="M5 6l0 .01" />
                  <path d="M5 12l0 .01" />
                  <path d="M5 18l0 .01" />
                </svg>
              `,
              name: "list",
              category: "Tools",
              code: "T9",
            },
            // {
            //   customIcon: ``,
            //   name: "link",
            //   category: "Tools",
            //   code: "T10",
            // },
            {
              customIcon: `<svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z"></path>
            </svg>`,
              name: "custom-link",
              category: "Tools",
              code: "T10",
            },
            {
              customIcon: ``,
              name: "quote",
              category: "Tools",
              code: "T11",
            },
            {
              customIcon: `
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="icon icon-tabler icons-tabler-outline icon-tabler-share"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                  <path d="M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                  <path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                  <path d="M8.7 10.7l6.6 -3.4" />
                  <path d="M8.7 13.3l6.6 3.4" />
                </svg>
              `,
              name: "social-elements",
              category: "Tools",
              code: "T12",
            },
            {
              customIcon: `
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="icon icon-tabler icons-tabler-outline icon-tabler-space"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M4 10v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1 -1v-3" />
                </svg>
              `,
              name: "spacer",
              category: "Tools",
              code: "T13",
            },

            {
              customIcon: ``,
              name: "tabs",
              category: "Tools",
              code: "T14",
            },
            {
              customIcon: ``,
              name: "text",
              category: "Tools",
              code: "T15",
            },
            {
              customIcon: ``,
              name: "text-basic",
              category: "Tools",
              code: "T16",
            },
            {
              customIcon: ``,
              name: "tooltip",
              category: "Tools",
              code: "T17",
            },
            {
              customIcon: ``,
              name: "typed",
              category: "Tools",
              code: "T18",
            },
            {
              customIcon: ``,
              name: "video",
              category: "Tools",
              code: "T19",
            },
          ];

          // in the below map funciton we are only taking the blocks that are allowed for the current user or API_KEY
          const AllowedBlocks = blocksWithCategory.filter(
            (block) =>
              data?.user?.features?.tools?.includes(block.code) ||
              data?.user?.features?.blocks?.includes(block.code)
          );

          const bm = editor.BlockManager;
          // We are here rendering the allowed blocks alone in the editor
          editor.on("load", () => {
            editor.runCommand("sw-visibility");
            editor.BlockManager.render(
              AllowedBlocks.map((block) => {
                if (bm.get(block.name)) {
                  if (block.name == "column3-7") {
                    bm.get(block.name).set("label", "4/8 Columns");
                  }
                  if (block.name == "list-items") {
                    bm.get(block.name).set("label", "Articles");
                  }
                  if (block.name == "grid-items") {
                    bm.get(block.name).set("label", "Cards");
                  }
                  if (block.customIcon.length > 0) {
                    bm.get(block.name).set("media", block.customIcon);
                  }
                  return bm.get(block.name).set("category", block.category);
                }
              })
            );
            const sectors = editor.StyleManager.getSectors();
            // console.log(sectors);
            for (let index = 0; index < sectors.models.length; index++) {
              sectors.models[index].attributes.open = true;
            }
            setIsEditorLoaded(true);
            const gjsDiv = document.getElementById("gjs");
            if (gjsDiv && gjsDiv.clientWidth < 1200) {
              var elements = document.getElementsByClassName("gjs-blocks-c");
              for (var i = 0; i < elements.length; i++) {
                var element = elements[i] as HTMLElement;
                element.style.gridTemplateColumns = "repeat(2, 1fr)";
                element.style.padding = "0px 30px";
              }
            }
            props.onReady();
          });

          editor.on("component:add", (comp: any) => {
            // Here we are checking whether the user bucket is configured and then allowing to add the image block.
            if (
              comp?.attributes?.attributes?.src ==
                `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3R5bGU9ImZpbGw6IHJnYmEoMCwwLDAsMC4xNSk7IHRyYW5zZm9ybTogc2NhbGUoMC43NSkiPgogICAgICAgIDxwYXRoIGQ9Ik04LjUgMTMuNWwyLjUgMyAzLjUtNC41IDQuNSA2SDVtMTYgMVY1YTIgMiAwIDAgMC0yLTJINWMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMnoiPjwvcGF0aD4KICAgICAgPC9zdmc+` &&
              !data?.user?.storage?.access_key_id
            ) {
              comp.remove();
              alert("S3 Bucket Not Configured!");
              // document.getElementById("blocks-button")?.click();
            }
          });
          editor.on("component:selected", (component: any) => {
            if (
              document.getElementById("sm-button") &&
              !document
                ?.getElementById("sm-button")
                ?.classList.contains("gjs-pn-active") &&
              !(
                component?.attributes?.attributes?.src ==
                  `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3R5bGU9ImZpbGw6IHJnYmEoMCwwLDAsMC4xNSk7IHRyYW5zZm9ybTogc2NhbGUoMC43NSkiPgogICAgICAgIDxwYXRoIGQ9Ik04LjUgMTMuNWwyLjUgMyAzLjUtNC41IDQuNSA2SDVtMTYgMVY1YTIgMiAwIDAgMC0yLTJINWMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMnoiPjwvcGF0aD4KICAgICAgPC9zdmc+` &&
                !data?.user?.storage?.access_key_id
              )
            ) {
              document.getElementById("sm-button")?.click();
            }
          });
          // console.log(editor.StyleManager.getSectors());
          editor.StyleManager.removeProperty(
            editor.StyleManager.getSectors().models[0].cid,
            "margin"
          );
          editor.StyleManager.removeProperty(
            editor.StyleManager.getSectors().models[0].cid,
            "margin-top"
          );
          editor.StyleManager.removeProperty(
            editor.StyleManager.getSectors().models[0].cid,
            "margin-bottom"
          );
          editor.StyleManager.removeProperty(
            editor.StyleManager.getSectors().models[0].cid,
            "margin-left"
          );
          editor.StyleManager.removeProperty(
            editor.StyleManager.getSectors().models[0].cid,
            "margin-right"
          );

          //   editor.runCommand("sw-visibility");
          document?.getElementById("blocks-button")?.click();
          setEditor(editor);
          const customPanel = document.getElementById("custompanel");
          if (customPanel && customPanel.children.length == 4) {
            const firstFourChildren = Array.from(customPanel.children).slice(
              0,
              2
            );
            firstFourChildren.forEach((child) => {
              customPanel.removeChild(child);
            });
          }
        }
      } else {
        return <div>Not Autheticated</div>;
      }
    };

    initEditor();
  }, [editorContainerRef]);

  // this initial useEffect is used to add an unmount eventlistener to our editor component that calls the
  // backend API telling that one editor instance had stopped
  useEffect(() => {
    const alertUser = (e: Event) => {
      e.preventDefault();
      fetch("https://backend.editor.leadsx10.io/api/auth/exit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain: window.location.hostname,
          api_key: props.apiKey,
        }),
      });
    };

    window.addEventListener("beforeunload", alertUser, { capture: true });

    return () => {
      window.removeEventListener("beforeunload", alertUser, { capture: true });
    };
  }, []);

  return (
    <div style={{ height: "100%", width: "100%", overflow: "hidden" }}>
      {/* If the current user is not authenticated the below div shows the error message */}
      {errMessage && (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: "600",
              backgroundColor: "#fff",
              color: "#000",
            }}
          >
            {errMessage}
          </h2>
        </div>
      )}

      {/* If the editor is fetching user information the loader is displayed */}
      {!isEditorLoaded && (
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: props.minHeight ? "100%" : "80vh",
          }}
        >
          <LuLoader2 size={50} color="#009bff" className="animate-spin" />
        </div>
      )}
      <div
        style={{
          overflow: "hidden",
          position: "relative",
          paddingTop: "1.565rem",
          paddingBottom: "1.565rem",
          width: "99%",
          zIndex: "40",
          paddingRight: "10px",
          height: props.minHeight ? props.minHeight : "80vh",
        }}
      >
        <div
          style={{
            visibility: isEditorLoaded ? "visible" : "hidden",
          }}
          id="custompanel"
        ></div>

        {/* This is the leadsx10 label that is displayed on the right corner of the editor */}
        {userData && (
          <div
            style={{
              position: "absolute",
              right: "1.5rem",
              bottom: "1.8rem",
              width: "28%",
              height: "50px",
              backgroundColor: "white",
              zIndex: 100,
              display: "flex",
              justifyItems: "center",
              alignItems: "center",
              justifyContent: "center",
              // borderTop: "1px solid #009bff",
            }}
            id="leadsx10label"
          >
            <p
              style={{
                fontWeight: "500",
                color: "#009bff",
              }}
            >
              <span
                style={{
                  color: "gray",
                  fontSize: "small",
                }}
              >
                by
              </span>{" "}
              LeadsX10
            </p>
          </div>
        )}

        {/* This is the container where editor is rendered */}
        <div
          style={{
            visibility: isEditorLoaded ? "visible" : "hidden",
          }}
          ref={editorContainerRef}
          id="gjs"
        ></div>
      </div>
    </div>
  );
});

export default Editor;
