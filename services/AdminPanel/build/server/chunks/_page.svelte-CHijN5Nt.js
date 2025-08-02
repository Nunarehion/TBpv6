import { w as push, I as ensure_array_like, J as attr, O as escape_html, y as pop } from './index-DTZO5Y9b.js';

function _page($$payload, $$props) {
  push();
  let ids = [];
  const each_array = ensure_array_like(ids);
  $$payload.out.push(`<ul class="svelte-1cf9jg0"><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let id = each_array[$$index];
    $$payload.out.push(`<li class="svelte-1cf9jg0"><svg class="icon svelte-1cf9jg0"><use${attr("href", `/sprite.svg#${id}`)}></use></svg> <span class="svelte-1cf9jg0">${escape_html(`<svg class="icon"><use href="/sprite.svg#${id}"></use></svg>`)}</span></li>`);
  }
  $$payload.out.push(`<!--]--></ul>`);
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CHijN5Nt.js.map
