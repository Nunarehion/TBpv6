import { w as push, I as ensure_array_like, S as store_get, U as maybe_selected, J as attr, O as escape_html, T as unsubscribe_stores, y as pop } from './index-DTZO5Y9b.js';
import { w as writable } from './index2-DgBjbq9f.js';

function _page($$payload, $$props) {
  push();
  var $$store_subs;
  let selectedMessageName = "";
  const messages = writable([]);
  const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$messages", messages));
  $$payload.out.push(`<main class="svelte-189to9f"><h1 class="svelte-189to9f">Панель управления рассылками</h1> <div class="broadcast-section svelte-189to9f"><h2 class="svelte-189to9f">Запустить новую рассылку</h2> <div class="form-group svelte-189to9f"><label for="message-select" class="svelte-189to9f">Выберите сообщение:</label> <select id="message-select" class="svelte-189to9f">`);
  $$payload.select_value = selectedMessageName;
  $$payload.out.push(`<option value=""${maybe_selected($$payload, "")}>-- Выберите сообщение --</option><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let doc = each_array[$$index];
    $$payload.out.push(`<option${attr("value", doc.name)}${maybe_selected($$payload, doc.name)}>${escape_html(doc.name)}</option>`);
  }
  $$payload.out.push(`<!--]-->`);
  $$payload.select_value = void 0;
  $$payload.out.push(`</select></div> <button${attr("disabled", !selectedMessageName, true)} class="broadcast-button svelte-189to9f">`);
  {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`Запустить рассылку`);
  }
  $$payload.out.push(`<!--]--></button> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div> <hr class="svelte-189to9f"/></main>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BEbBs6iK.js.map
