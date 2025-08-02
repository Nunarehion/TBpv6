import { w as push, O as escape_html, J as attr, S as store_get, I as ensure_array_like, T as unsubscribe_stores, y as pop } from './index-DTZO5Y9b.js';
import { w as writable } from './index2-DgBjbq9f.js';

function _page($$payload, $$props) {
  push();
  var $$store_subs;
  const images = writable([]);
  const loadingImages = writable(false);
  const loadingImageUpload = writable(false);
  const error = writable(null);
  let fileNameDisplay = "Файл не выбран";
  $$payload.out.push(`<div class="image-management-container svelte-5lo0zj"><h2 class="svelte-5lo0zj">Управление изображениями</h2> <div class="upload-section svelte-5lo0zj"><h3 class="svelte-5lo0zj">Загрузить новое изображение</h3> <div class="file-input-group svelte-5lo0zj"><input type="file" id="imageUploadInput" accept="image/*" hidden/> <label for="imageUploadInput" class="file-label-with-button svelte-5lo0zj"><span class="custom-file-button svelte-5lo0zj">Выбрать файл</span> <span class="file-name-display svelte-5lo0zj">${escape_html(fileNameDisplay)}</span></label></div> <button${attr("disabled", store_get($$store_subs ??= {}, "$loadingImageUpload", loadingImageUpload), true)} class="svelte-5lo0zj">`);
  if (store_get($$store_subs ??= {}, "$loadingImageUpload", loadingImageUpload)) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`Загрузка...`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`Загрузить изображение`);
  }
  $$payload.out.push(`<!--]--></button> `);
  if (store_get($$store_subs ??= {}, "$error", error) && store_get($$store_subs ??= {}, "$error", error).includes("загрузк")) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<p class="error-message svelte-5lo0zj">Ошибка: ${escape_html(store_get($$store_subs ??= {}, "$error", error))}</p>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div> <hr/> <div class="image-list-section svelte-5lo0zj"><div class="list-header svelte-5lo0zj"><h3 class="svelte-5lo0zj">Существующие изображения</h3> <button${attr("disabled", store_get($$store_subs ??= {}, "$loadingImages", loadingImages), true)} class="svelte-5lo0zj">`);
  if (store_get($$store_subs ??= {}, "$loadingImages", loadingImages)) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`Обновление...`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`Обновить список`);
  }
  $$payload.out.push(`<!--]--></button></div> `);
  if (store_get($$store_subs ??= {}, "$loadingImages", loadingImages)) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<p>Загрузка изображений...</p>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (store_get($$store_subs ??= {}, "$error", error) && !store_get($$store_subs ??= {}, "$error", error).includes("загрузк")) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<p class="error-message svelte-5lo0zj">Не удалось загрузить список изображений: ${escape_html(store_get($$store_subs ??= {}, "$error", error))}</p>`);
    } else {
      $$payload.out.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$images", images) && store_get($$store_subs ??= {}, "$images", images).length === 0) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<p>Изображений пока нет. Загрузите первое!</p>`);
      } else {
        $$payload.out.push("<!--[!-->");
        if (store_get($$store_subs ??= {}, "$images", images)) {
          $$payload.out.push("<!--[-->");
          const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$images", images));
          $$payload.out.push(`<div class="image-grid svelte-5lo0zj"><!--[-->`);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let image = each_array[$$index];
            $$payload.out.push(`<div class="image-item svelte-5lo0zj"><img${attr("src", image.url)}${attr("alt", image.filename)} class="svelte-5lo0zj"/> <div class="image-controls svelte-5lo0zj"><button class="copy-button svelte-5lo0zj">Копировать ссылку</button> <button class="delete-button svelte-5lo0zj"><svg class="icon svelte-5lo0zj"><use href="/sprite.svg#trash-bin"></use></svg></button></div></div>`);
          }
          $$payload.out.push(`<!--]--></div>`);
        } else {
          $$payload.out.push("<!--[!-->");
        }
        $$payload.out.push(`<!--]-->`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div></div> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-B9A-_TjK.js.map
