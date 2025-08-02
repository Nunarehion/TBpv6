import { w as push, y as pop, I as ensure_array_like, O as escape_html, N as attr_style, J as attr, K as attr_class, P as fallback, G as slot, Q as bind_props, M as stringify } from './index-DTZO5Y9b.js';

function Checkbox($$payload, $$props) {
  let checked = fallback($$props["checked"], false);
  let disabled = fallback($$props["disabled"], false);
  let id = fallback($$props["id"], "");
  let name = fallback($$props["name"], "");
  $$payload.out.push(`<label class="checkbox-wrapper svelte-35b4c8"${attr("for", id)}><input type="checkbox"${attr("checked", checked, true)}${attr("disabled", disabled, true)}${attr("id", id)}${attr("name", name)} class="svelte-35b4c8"/> <span class="custom-checkbox"></span> <!---->`);
  slot($$payload, $$props, "default", {});
  $$payload.out.push(`<!----></label>`);
  bind_props($$props, { checked, disabled, id, name });
}
function DocumentRow($$payload, $$props) {
  push();
  let {
    doc,
    columns = [],
    editingId = null
  } = $$props;
  let isEditing = doc && editingId === doc._id;
  if (doc) {
    $$payload.out.push("<!--[-->");
    const each_array = ensure_array_like(columns);
    $$payload.out.push(`<tr class="table-row svelte-h5ftc9"><td class="table-cell select-cell svelte-h5ftc9">`);
    Checkbox($$payload, { disabled: isEditing });
    $$payload.out.push(`<!----></td><!--[-->`);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let col = each_array[$$index];
      $$payload.out.push(`<td${attr_class("table-cell svelte-h5ftc9", void 0, { "name-text": col.trim() === "name" })}${attr("title", doc[col] ?? "")}>`);
      if (col.trim() === "text") {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<span>${escape_html(doc[col]?.length > 15 ? doc[col].slice(0, 15) + "…" : doc[col] ?? "-")}</span>`);
      } else {
        $$payload.out.push("<!--[!-->");
        if (col === "_id") {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`${escape_html(typeof doc[col] === "string" ? "…" + doc[col].slice(-5) : doc[col])}`);
        } else {
          $$payload.out.push("<!--[!-->");
          if (col === "buttons") {
            $$payload.out.push("<!--[-->");
            if (Array.isArray(doc[col]) && doc[col].length > 0) {
              $$payload.out.push("<!--[-->");
              $$payload.out.push(`${escape_html(`buttons (${doc[col].flatMap((row) => Array.isArray(row) ? row.length : 0).reduce((sum, count) => sum + count, 0)})`)}`);
            } else {
              $$payload.out.push("<!--[!-->");
              $$payload.out.push(`-`);
            }
            $$payload.out.push(`<!--]-->`);
          } else {
            $$payload.out.push("<!--[!-->");
            if (col === "images") {
              $$payload.out.push("<!--[-->");
              $$payload.out.push(`${escape_html(Array.isArray(doc[col]) && doc[col].length > 0 ? `${doc[col].length} image(s)` : "-")}`);
            } else {
              $$payload.out.push("<!--[!-->");
              if (col === "created_at") {
                $$payload.out.push("<!--[-->");
                $$payload.out.push(`${escape_html(doc[col] ? new Date(doc[col]).toLocaleDateString("ru-RU") : "-")}`);
              } else {
                $$payload.out.push("<!--[!-->");
                $$payload.out.push(`${escape_html(doc[col] ?? "-")}`);
              }
              $$payload.out.push(`<!--]-->`);
            }
            $$payload.out.push(`<!--]-->`);
          }
          $$payload.out.push(`<!--]-->`);
        }
        $$payload.out.push(`<!--]-->`);
      }
      $$payload.out.push(`<!--]--></td>`);
    }
    $$payload.out.push(`<!--]--><td class="table-cell actions-cell svelte-h5ftc9"><button aria-label="Редактировать" class="action-button edit-button svelte-h5ftc9"><svg class="icon svelte-h5ftc9"><use href="/sprite.svg#pen"></use></svg></button> <button aria-label="Удалить" class="action-button delete-button svelte-h5ftc9"><svg class="icon svelte-h5ftc9"><use href="/sprite.svg#trash-bin"></use></svg></button></td></tr> `);
    {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> `);
    {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]-->`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
function SearchInput($$payload, $$props) {
  push();
  let searchQuery = "";
  $$payload.out.push(`<div class="search-input-container svelte-19u0fv4"><input type="text" placeholder="Поиск..."${attr("value", searchQuery)} class="search-input svelte-19u0fv4"/> <svg class="icon svelte-19u0fv4"><use href="/sprite.svg#search"></use></svg></div>`);
  pop();
}
function DocumentsTable($$payload, $$props) {
  push();
  let {
    documents,
    orderedFields,
    isMessageRoute = false,
    $$slots,
    $$events,
    ...props
  } = $$props;
  let editingId = null;
  let sortKey = null;
  function getColumns(docs, fields) {
    if (fields.length === 0) return [];
    return fields;
  }
  let columns = (() => getColumns(documents, orderedFields))();
  function sortDocuments(docs) {
    return docs;
  }
  function filterDocuments(docs, cols, query) {
    return docs;
  }
  let displayedDocuments = (() => {
    const filtered = filterDocuments(documents);
    return sortDocuments(filtered);
  })();
  if (documents.length === 0) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<p>Документы отсутствуют</p>`);
  } else {
    $$payload.out.push("<!--[!-->");
    const each_array = ensure_array_like(columns);
    const each_array_1 = ensure_array_like(displayedDocuments);
    $$payload.out.push(`<div class="table-container svelte-1x4x36k"><div class="tools-panel svelte-1x4x36k">`);
    SearchInput($$payload);
    $$payload.out.push(`<!----> <button class="create-button svelte-1x4x36k"><svg class="icon svelte-1x4x36k"><use href="/sprite.svg#circle-plus"></use></svg> <span class="svelte-1x4x36k">Добавить</span></button></div> <div class="table-wrapper svelte-1x4x36k"><table class="svelte-1x4x36k"><thead class="svelte-1x4x36k"><tr><th class="id-column-header svelte-1x4x36k"></th><!--[-->`);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let col = each_array[$$index];
      $$payload.out.push(`<th class="uppercase-header svelte-1x4x36k">${escape_html(col)} <span class="sort-icon svelte-1x4x36k"${attr_style(`opacity: ${stringify(sortKey === col ? 1 : 0.2)};`)}>${escape_html(sortKey == col ? "▲" : "▲")}</span></th>`);
    }
    $$payload.out.push(`<!--]--><th class="actions-column-header uppercase-header svelte-1x4x36k">Действия</th></tr></thead><tbody class="svelte-1x4x36k"><!--[-->`);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let doc = each_array_1[$$index_1];
      DocumentRow($$payload, {
        doc,
        columns,
        editingId,
        selectedCollection: props.selectedCollection
      });
    }
    $$payload.out.push(`<!--]--></tbody></table></div></div>`);
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
function DocumentPreview($$payload, $$props) {
  push();
  let {
    documents = [],
    loading = false,
    selectedCollection,
    isMessageRoute = false,
    displayFields = [],
    $$slots,
    $$events,
    ...props
  } = $$props;
  function getTableColumns(docs, fieldsToFilter, fieldsToOrder) {
    if (docs.length === 0) return [];
    const allKeys = Array.from(new Set(docs.flatMap((doc) => Object.keys(doc))));
    let finalColumns = [];
    if (fieldsToFilter && fieldsToFilter.length > 0) {
      finalColumns = fieldsToFilter.filter((key) => allKeys.includes(key));
    } else {
      finalColumns = allKeys;
    }
    if (fieldsToOrder && fieldsToOrder.length > 0) {
      const ordered = fieldsToOrder.filter((key) => finalColumns.includes(key));
      const remaining = finalColumns.filter((key) => !ordered.includes(key));
      return [...ordered, ...remaining];
    } else {
      return finalColumns;
    }
  }
  let orderedFields = documents.length > 0 ? getTableColumns(documents, displayFields, props.orderFields) : [];
  if (selectedCollection) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="wrap svelte-bzuro2">`);
    if (loading) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<p>Загрузка документов...</p>`);
    } else {
      $$payload.out.push("<!--[!-->");
      if (documents.length === 0) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<p>Документы отсутствуют.</p>`);
      } else {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]--> `);
    DocumentsTable($$payload, {
      documents,
      orderedFields,
      isMessageRoute,
      selectedCollection: props.selectedCollection
    });
    $$payload.out.push(`<!----></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}

export { DocumentPreview as D };
//# sourceMappingURL=DocumentPreview-JtQOJxSG.js.map
