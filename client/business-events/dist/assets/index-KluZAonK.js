import { importShared } from './__federation_fn_import-MyXqb9Ne.js';
import App, { j as jsxRuntimeExports } from './__federation_expose_App-C7naUJhu.js';
import { r as reactDomExports } from './index-D9Af7wOI.js';

var createRoot;
var m = reactDomExports;
{
  createRoot = m.createRoot;
  m.hydrateRoot;
}

const {StrictMode} = await importShared('react');
createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
