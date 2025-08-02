import { w as push, S as store_get, O as escape_html, T as unsubscribe_stores, Q as bind_props, y as pop, P as fallback, I as ensure_array_like, J as attr, K as attr_class } from './index-DTZO5Y9b.js';
import { w as writable } from './index2-DgBjbq9f.js';

function CollectionList($$payload, $$props) {
  push();
  let collections = fallback($$props["collections"], () => [], true);
  let selected = fallback($$props["selected"], null);
  let loadingDocuments = fallback($$props["loadingDocuments"], false);
  const each_array = ensure_array_like(collections);
  $$payload.out.push(`<ul class="svelte-coqzwe"><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let name = each_array[$$index];
    $$payload.out.push(`<li><button${attr("disabled", loadingDocuments && selected === name, true)}${attr_class("svelte-coqzwe", void 0, { "selected": selected === name })}>${escape_html(name)}</button></li>`);
  }
  $$payload.out.push(`<!--]--></ul>`);
  bind_props($$props, { collections, selected, loadingDocuments });
  pop();
}
function DocumentCard($$payload, $$props) {
  push();
  let doc = $$props["doc"];
  let localDoc = structuredClone(doc);
  let saving = false;
  const each_array = ensure_array_like(Object.entries(localDoc));
  $$payload.out.push(`<div class="card svelte-tqmjph"><form class="svelte-tqmjph"><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let [key, value] = each_array[$$index];
    $$payload.out.push(`<div class="field svelte-tqmjph"><label${attr("for", "field-" + key)} class="svelte-tqmjph">${escape_html(key)}</label> <input${attr("id", "field-" + key)} type="text"${attr("value", localDoc[key])}${attr("readonly", key === "_id", true)} class="svelte-tqmjph"/></div>`);
  }
  $$payload.out.push(`<!--]--> <div class="card-footer actions svelte-tqmjph"><button type="submit"${attr("disabled", saving, true)} class="svelte-tqmjph">💾 Сохранить</button> <button type="button"${attr("disabled", saving, true)} class="svelte-tqmjph">Отмена</button> <button type="button" class="svelte-tqmjph">${escape_html("▼ Показать JSON")}</button></div></form> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div>`);
  bind_props($$props, { doc });
  pop();
}
function DocumentsSection($$payload, $$props) {
  push();
  let documents = fallback($$props["documents"], () => [], true);
  let loading = fallback($$props["loading"], false);
  let selectedCollection = $$props["selectedCollection"];
  if (selectedCollection) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<h2>Документы из коллекции: ${escape_html(selectedCollection)}</h2> `);
    if (loading) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<p>Загрузка документов...</p>`);
    } else {
      $$payload.out.push("<!--[!-->");
      if (documents.length === 0) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<p>Документы отсутствуют</p>`);
      } else {
        $$payload.out.push("<!--[!-->");
        const each_array = ensure_array_like(documents);
        $$payload.out.push(`<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;"><!--[-->`);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let doc = each_array[$$index];
          DocumentCard($$payload, { doc });
        }
        $$payload.out.push(`<!--]--></div>`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]-->`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { documents, loading, selectedCollection });
  pop();
}
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  let data = $$props["data"];
  const selectedCollection = writable(null);
  const documents = writable([]);
  const loadingDocuments = writable(false);
  const fetchError = writable(null);
  $$payload.out.push(`<h1>Список коллекций из MongoDB</h1> `);
  if (store_get($$store_subs ??= {}, "$fetchError", fetchError)) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<p style="color: red">Ошибка загрузки документов: ${escape_html(store_get($$store_subs ??= {}, "$fetchError", fetchError))}</p>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (data.collections.length === 0) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<p>Загрузка коллекций...</p>`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<div class="wrap">`);
      CollectionList($$payload, {
        collections: data.collections,
        selected: store_get($$store_subs ??= {}, "$selectedCollection", selectedCollection),
        loadingDocuments: store_get($$store_subs ??= {}, "$loadingDocuments", loadingDocuments)
      });
      $$payload.out.push(`<!----></div> `);
      if (store_get($$store_subs ??= {}, "$selectedCollection", selectedCollection)) {
        $$payload.out.push("<!--[-->");
        DocumentsSection($$payload, {
          documents: store_get($$store_subs ??= {}, "$documents", documents),
          loading: store_get($$store_subs ??= {}, "$loadingDocuments", loadingDocuments),
          selectedCollection: store_get($$store_subs ??= {}, "$selectedCollection", selectedCollection)
        });
      } else {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]-->`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  bind_props($$props, { data });
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-ByOgDSjJ.js.map
