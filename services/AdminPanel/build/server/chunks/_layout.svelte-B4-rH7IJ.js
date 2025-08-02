import { G as slot, w as push, I as ensure_array_like, y as pop, J as attr, K as attr_class, M as stringify, N as attr_style, O as escape_html, P as fallback, Q as bind_props } from './index-DTZO5Y9b.js';

function SVGArrow($$payload, $$props) {
  let isOpen = fallback($$props["isOpen"], false);
  $$payload.out.push(`<div${attr_class(`toggle ${isOpen ? "isOpen" : ""}`, "svelte-1q3e4d6")}><svg class="icon svelte-1q3e4d6"><use href="/sprite.svg#chevron-up"></use></svg></div>`);
  bind_props($$props, { isOpen });
}
function Accordion($$payload, $$props) {
  push();
  let { open = true, $$slots, $$events, ...props } = $$props;
  $$payload.out.push(`<div class="accordion svelte-krcg7y"${attr("aria-expanded", open)}><div class="header svelte-krcg7y"><div class="icon svelte-krcg7y">`);
  props.icon($$payload);
  $$payload.out.push(`<!----></div> <div class="text svelte-krcg7y">`);
  props.text($$payload);
  $$payload.out.push(`<!----></div> <div>`);
  SVGArrow($$payload, { isOpen: open });
  $$payload.out.push(`<!----></div></div> `);
  if (open) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="details svelte-krcg7y">`);
    props.details($$payload);
    $$payload.out.push(`<!----></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div>`);
  pop();
}
function link($$payload, text, link2, icon, isHeader = false) {
  $$payload.out.push(`<a${attr("href", link2)}${attr_class("link svelte-1r3dhz", void 0, { "is-header-link": isHeader })} style="display: flex; align-items: center;">`);
  if (icon) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<svg class="icon svelte-1r3dhz"><use${attr("href", `/sprite.svg#${stringify(icon)}`)}></use></svg>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <span${attr_style(`margin-left: ${stringify(icon ? ".5rem" : "0")};`)} class="svelte-1r3dhz">${escape_html(text)}</span></a>`);
}
function SideBar($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const each_array = ensure_array_like(props.config);
  $$payload.out.push(`<div class="sidebar svelte-1r3dhz">`);
  link($$payload, "Главная", "/", "home", true);
  $$payload.out.push(`<!----> <!--[-->`);
  for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
    let section = each_array[$$index_1];
    {
      let icon = function($$payload2) {
        $$payload2.out.push(`<svg class="icon svelte-1r3dhz"><use${attr("href", `/sprite.svg#${stringify(section.icon)}`)}></use></svg>`);
      }, text = function($$payload2) {
        $$payload2.out.push(`<span class="svelte-1r3dhz">${escape_html(section.header)}</span>`);
      }, details = function($$payload2) {
        const each_array_1 = ensure_array_like(section.items);
        $$payload2.out.push(`<!--[-->`);
        for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
          let subItem = each_array_1[$$index];
          link($$payload2, subItem.text, subItem.link, subItem.icon);
        }
        $$payload2.out.push(`<!--]-->`);
      };
      Accordion($$payload, {
        icon,
        text,
        details,
        $$slots: { icon: true, text: true, details: true }
      });
    }
  }
  $$payload.out.push(`<!--]--> <div class="bottom-panel svelte-1r3dhz"><a href="/all" class="panel-icon-link svelte-1r3dhz" title="Общие настройки"><svg class="icon svelte-1r3dhz"><use href="/sprite.svg#globe"></use></svg></a> <a href="/display-settings" class="panel-icon-link svelte-1r3dhz" title="Настройки отображения"><svg class="icon svelte-1r3dhz"><use href="/sprite.svg#adjustments-vertical"></use></svg></a> <a href="/app-settings" class="panel-icon-link svelte-1r3dhz" title="Настройки приложения"><svg class="icon svelte-1r3dhz"><use href="/sprite.svg#cog"></use></svg></a></div></div>`);
  pop();
}
function _layout($$payload, $$props) {
  let config = [
    {
      header: "Конструктор",
      icon: "cog",
      items: [
        { text: "Сообщения", link: "/messages", icon: "messages" },
        { text: "Кнопки", link: "/buttons", icon: "circle-plus" },
        { text: "Тригеры", link: "/handlers", icon: "fire" },
        { text: "Переменные", link: "/variables", icon: "terminal" },
        { text: "Клавиатура", link: "/keyboards", icon: "terminal" }
      ]
    },
    {
      header: "Рассылка",
      icon: "paper-plane",
      items: [
        { text: "Рассылка", link: "/newsletter", icon: "envelope-open" }
      ]
    },
    {
      header: "Статистика",
      icon: "chart-pie",
      items: [
        {
          text: "Тригеры",
          link: "/statistic/trigers",
          icon: "bell-ring"
        },
        {
          text: "Пользователи",
          link: "/statistic/users",
          icon: "briefcase"
        }
      ]
    },
    {
      header: "Управление",
      icon: "adjustments-vertical",
      items: [
        { text: "Пользователи", link: "/users", icon: "desktop-pc" },
        { text: "Иконки", link: "/icones", icon: "palette" },
        { text: "Картинки", link: "/images", icon: "image" }
      ]
    }
  ];
  $$payload.out.push(`<div class="wrap svelte-ylioab"><nav class="svelte-ylioab"></nav> `);
  SideBar($$payload, { config });
  $$payload.out.push(`<!----> <div class="window svelte-ylioab"><!---->`);
  slot($$payload, $$props, "default", {});
  $$payload.out.push(`<!----></div></div>`);
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-B4-rH7IJ.js.map
