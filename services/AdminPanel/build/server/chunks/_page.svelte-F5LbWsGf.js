import { w as push, S as store_get, O as escape_html, T as unsubscribe_stores, y as pop } from './index-DTZO5Y9b.js';
import { D as DocumentPreview } from './DocumentPreview-JtQOJxSG.js';
import { w as writable } from './index2-DgBjbq9f.js';

function _page($$payload, $$props) {
  push();
  var $$store_subs;
  const collectionName = "buttons";
  const documents = writable([]);
  const loadingDocuments = writable(false);
  const apiError = writable(null);
  $$payload.out.push(`<h1>Кнопки</h1> `);
  if (store_get($$store_subs ??= {}, "$apiError", apiError)) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<p style="color: red">Ошибка API: ${escape_html(store_get($$store_subs ??= {}, "$apiError", apiError))}</p>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  DocumentPreview($$payload, {
    documents: store_get($$store_subs ??= {}, "$documents", documents),
    loading: store_get($$store_subs ??= {}, "$loadingDocuments", loadingDocuments),
    selectedCollection: collectionName
  });
  $$payload.out.push(`<!---->`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-F5LbWsGf.js.map
