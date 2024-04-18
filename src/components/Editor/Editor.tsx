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
  const exportHTML = () => {
    // Perform some logic to get the return value
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

  const loadHTML = (fullHTML: string) => {
    var cssRegex = /<style>([\s\S]+?)<\/style>/i;
    var htmlRegex = /<\/head>([\s\S]+?)<\/html>/i;

    var cssMatch = cssRegex.exec(fullHTML);
    var cssContent = cssMatch ? cssMatch[1] : "";

    var htmlMatch = htmlRegex.exec(fullHTML);
    var htmlContent = htmlMatch ? htmlMatch[1] : "";

    // console.log("CSS Content:", cssContent);
    // console.log("HTML Content:", htmlContent);

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

  // Design MJML
  const editorContainerRef = useRef(null);
  const [modalopen, setmodalopen] = useState(false);
  const elementRef = useRef(null);
  const [templateHtml, setTemplateHtml] = useState("");
  const [isEditorLoaded, setIsEditorLoaded] = useState(false);
  const [editor, setEditor]: any = useState(null);
  const [userData, setUserData] = useState(null);
  let isFirstAssetAdded = false;
  {
    /* New */
  }

  const [linkModalOpen, setLinkModalOpen] = useState(false);

  const verify = async () => {
    try {
      setIsEditorLoaded(true);
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
        setIsEditorLoaded(false);
        return false;
      }
      const data = await res.json();
      // setAuthData(data);
      setIsEditorLoaded(false);
      console.log(data);
      return data;
    } catch (e) {
      console.log(e);
      setIsEditorLoaded(false);
      return false;
    }
  };
  useEffect(() => {
    const initEditor = async () => {
      if (editorContainerRef.current !== null) {
        const data = await verify();
        console.log(data);
        if (data && data.authenticated == true) {
          setUserData(data?.user);
          const editor: any = grapesJS.init({
            container: editorContainerRef.current,
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
            storageManager: false,
            assetManager: {
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
                  console.log("Data URL:", dataURL);
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
                  //     console.log(res);
                  //     editor?.AssetManager?.add(res);
                  //   }
                  // );
                };
                reader.readAsDataURL(file);
              },
              assets: data?.images ? data?.images : [],
            },
          });

          const panelManager = editor.Panels;
          const blockManager = editor.BlockManager;

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
            label: "4 Columns alt 1/3",
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
            label: "4 Columns alt 3/1",
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
            label: "2Columns 7/3",
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
          editor.Css.setRule(".col-3", { width: "30%" });
          editor.Css.setRule(".col-7", { width: "70%" });
          editor.Css.setRule(".col-33", { width: "33%" });

          editor.Css.setRule(".gjs-cell", {
            display: "table-cell",
            height: "75px",
          });
          editor.Css.setRule(".gjs-row", {
            display: "table",
            padding: "10px",
            width: "100%",
          });

          // blockManager.add("social-elements", {
          //   label: "Socials",
          //   content: `
          //  <mj-raw>
          //   <a class="headlink" href="https://www.google.com"style="font-size: 50px;">
          //   <img
          //   width="30px" style="margin: 5px 5px;"
          //   href="/"
          //   src="https://app-leadsx10.s3.ap-south-1.amazonaws.com/leadsx10/theme/v1/icons/ico-social/whatsapp.png"
          //   >
          //   </a>
          //   <a class="headlink" href="https://www.google.com"style="font-size: 50px;">
          //   <img
          //   width="30px" style="margin: 5px 5px;"
          //   href="/"
          //   src="https://app-leadsx10.s3.ap-south-1.amazonaws.com/leadsx10/theme/v1/icons/ico-social/linkedin.png"
          //   >
          //   </a> <a class="headlink" href="https://www.google.com"style="font-size: 50px;">
          //   <img
          //   width="30px" style="margin: 5px 5px;"
          //   href="/"
          //   src="https://app-leadsx10.s3.ap-south-1.amazonaws.com/leadsx10/theme/v1/icons/ico-social/youtube.png"
          //   >
          //   </a>
          //    <a class="headlink" href="https://www.google.com"style="font-size: 50px;">
          //   <img
          //   width="30px" style="margin: 5px 5px;"
          //   href="/"
          //   src="https://app-leadsx10.s3.ap-south-1.amazonaws.com/leadsx10/theme/v1/icons/ico-social/instagram.png"
          //   >
          //   </a>
          //   <a class="headlink" href="https://www.google.com"style="font-size: 50px;">
          //   <img
          //   width="30px" style="margin: 5px 5px;"
          //   href="/"
          //   src="https://app-leadsx10.s3.ap-south-1.amazonaws.com/leadsx10/theme/v1/icons/ico-social/twitter.png"
          //   >
          //   </a>   <a class="headlink" href="https://www.google.com"style="font-size: 50px;">
          //   <img
          //   width="30px" style="margin: 5px 5px;"
          //   href="/"
          //   src="https://app-leadsx10.s3.ap-south-1.amazonaws.com/leadsx10/theme/v1/icons/ico-social/facebook.png"
          //   >
          //   </a>
          //   </mj-raw>
          //   `,
          //   category: "section",
          //   attributes: {
          //     class: "fa fa-share-alt-square social-custom-icon text-center",
          //   },
          // });

          panelManager.removeButton("views", "open-sm");
          panelManager.removeButton("views", "open-tm");
          panelManager.removeButton("views", "open-layers");
          panelManager.removeButton("views", "open-blocks");
          panelManager.addButton("views", {
            id: "preview",
            label: "Blocks",
            command: "open-blocks",
            attributes: {
              title: "Blocks",
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

          document
            .getElementById("blocks-button")
            ?.addEventListener("click", () => {
              setLinkModalOpen(false);
            });
          document
            .getElementById("sm-button")
            ?.addEventListener("click", () => {
              setLinkModalOpen(false);
            });

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
          editor.Commands.add("customPreview", {
            run: (editor: any) => {
              setmodalopen(true);
              // alert("preview mode on")
            },
          });

          editor.Devices.add({
            id: "tablet2",
            name: "Mobilee",
            width: "400px",
            widthMedia: "810px",
            height: "100%",
          });

          editor.Commands.add("exportHTML", {
            run: async (editor: any, sender: any) => {
              console.log(editor.getHtml());
              console.log(editor.getCss());
            },
          });

          //Clear Button
          editor.Commands.add("cmd-clear", {
            run: (editor: any) => {
              editor.DomComponents.clear();
              editor.CssComposer.clear();
            },
          });

          editor.Commands.add("generateAiContent", {
            run: (editor: any) => {
              setmodalopen(true);
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

          console.log(panelManager.getPanels());

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

          const blocksWithCategory = [
            {
              customIcon: ``,
              name: "list-items",
              category: "Component",
              code: "T2",
            },
            {
              customIcon: ``,
              name: "button",
              category: "Component",
              code: "T1",
            },
            //customIcon: ``, { name: 'checkbox', category: 'Forms', id: '' },
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
              category: "Blocks",
              code: "T8",
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
              name: "grid-items",
              category: "Component",
              code: "T7",
            },

            {
              customIcon: ``,
              name: "countdown",
              category: "Component",
              code: "T3",
            },
            {
              customIcon: ``,
              name: "custom-code",
              category: "Component",
              code: "T4",
            },
            {
              customIcon: ``,
              name: "divider",
              category: "Component",
              code: "T5",
            },
            //customIcon: ``, { name: 'form', category: 'Forms', id: '' },
            {
              customIcon: ``,
              name: "image",
              category: "Component",
              code: "T6",
            },

            {
              customIcon: `<svg  xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-list"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6l11 0" /><path d="M9 12l11 0" /><path d="M9 18l11 0" /><path d="M5 6l0 .01" /><path d="M5 12l0 .01" /><path d="M5 18l0 .01" /></svg>`,
              name: "list",
              category: "Component",
              code: "T9",
            },
            //customIcon: ``, { name: 'input', category: 'Forms', id: '' },
            //customIcon: ``, { name: 'label', category: 'Forms', id: '' },
            {
              customIcon: ``,
              name: "link",
              category: "Component",
              code: "T10",
            },
            //customIcon: ``, { name: 'map', category: 'Component', id: '' },
            {
              customIcon: ``,
              name: "quote",
              category: "Component",
              code: "T11",
            },
            //customIcon: ``, { name: 'radio', category: 'Forms', id: '' },
            //customIcon: ``, { name: 'select', category: 'Forms', id: '' },
            {
              customIcon: `<svg  xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-share"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M8.7 10.7l6.6 -3.4" /><path d="M8.7 13.3l6.6 3.4" /></svg>`,
              name: "social-elements",
              category: "Component",
              code: "T12",
            },
            {
              customIcon: `<svg  xmlns="http://www.w3.org/2000/svg"   viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-space"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 10v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1 -1v-3" /></svg>`,
              name: "spacer",
              category: "Component",
              code: "T13",
            },

            {
              customIcon: ``,
              name: "tabs",
              category: "Component",
              code: "T14",
            },
            {
              customIcon: ``,
              name: "text",
              category: "Component",
              code: "T15",
            },
            {
              customIcon: ``,
              name: "text-basic",
              category: "Component",
              code: "T16",
            },
            //customIcon: ``, { name: 'textarea', category: 'Forms', id: '' },
            {
              customIcon: ``,
              name: "tooltip",
              category: "Component",
              code: "T17",
            },
            {
              customIcon: ``,
              name: "typed",
              category: "Component",
              code: "T18",
            },
            {
              customIcon: ``,
              name: "video",
              category: "Component",
              code: "T19",
            },
          ];

          const AllowedBlocks = blocksWithCategory.filter(
            (block) =>
              data?.user?.features?.tools?.includes(block.code) ||
              data?.user?.features?.blocks?.includes(block.code)
          );

          const bm = editor.BlockManager;
          editor.on("load", () => {
            editor.BlockManager.render(
              AllowedBlocks.map((block) => {
                if (bm.get(block.name)) {
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
                } else {
                  console.log(block.name);
                }
              })
            );

            editor.on("component:add", (comp: any) => {
              if (
                comp.attributes.tagName == "img" &&
                !data?.user?.storage?.access_key_id
              ) {
                // console.log(data.project);
                comp.remove();
                alert("S3 Bucket Not Configured!");
              }
            });
            editor.on("component:selected", (component: any) => {
              if (
                document.getElementById("sm-button") &&
                !document
                  ?.getElementById("sm-button")
                  ?.classList.contains("gjs-pn-active")
              ) {
                document.getElementById("sm-button")?.click();
              }
            });
            const sectors = editor.StyleManager.getSectors();
            console.log(sectors);
            for (let index = 0; index < sectors.models.length; index++) {
              sectors.models[index].attributes.open = true;
            }
            setIsEditorLoaded(true);
            props.onReady();
          });
          console.log(editor.StyleManager.getSectors());
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

          const mapp = editor.Blocks.getAll().map((block: any) => ({
            name: block.id,
            category: "Component",
          }));
          console.log(mapp);
          editor.runCommand("sw-visibility");
          document?.getElementById("blocks-button")?.click();
          setEditor(editor);
          const customPanel = document.getElementById("custompanel");
          console.log(customPanel?.children)
          if (customPanel && customPanel.children.length == 8) {
            const firstFourChildren = Array.from(customPanel.children).slice(
              0,
              4
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
      {!isEditorLoaded && (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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

          width: "100%",
          zIndex: "40",
          paddingLeft: "3.125rem",
          paddingRight: "3.125rem",
          height: props.minHeight ? props.minHeight : "80vh",
        }}
      >
        <div id="custompanel"></div>
        {userData && (
          <div
            style={{
              position: "absolute",
              right: "3.125rem",
              bottom: "1.8rem",
              width: "28%",
              height: "70px",
              backgroundColor: "white",
              zIndex: 100,
              display: "flex",
              justifyItems: "center",
              alignItems: "center",
              justifyContent: "center",
              // borderTop: "3px solid #009bff",
            }}
            id="leadsx10label"
          >
            <p
              style={{
                fontWeight: "bolder",
                color: "#009bff",
              }}
            >
              by LeadsX10 Editor
            </p>
          </div>
        )}

        <div
          ref={elementRef}
          dangerouslySetInnerHTML={{
            __html: templateHtml,
          }}
        />
        <div ref={editorContainerRef} id="gjs"></div>
      </div>
    </div>
  );
});

export default Editor;
