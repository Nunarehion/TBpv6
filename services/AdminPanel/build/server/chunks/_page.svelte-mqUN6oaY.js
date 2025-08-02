import { w as push, S as store_get, J as attr, O as escape_html, U as maybe_selected, I as ensure_array_like, T as unsubscribe_stores, y as pop } from './index-DTZO5Y9b.js';
import { w as writable } from './index2-DgBjbq9f.js';
import { L as LineChart } from './LineChart-BoB1lZH-.js';
import 'chart.js/auto';

function _page($$payload, $$props) {
  push();
  var $$store_subs;
  const totalUsersStatistics = writable(null);
  const loadingTotalUsersStatistics = writable(false);
  const newUsersTimeSeriesData = writable([]);
  const loadingNewUsersTimeSeriesData = writable(false);
  const activeUsersTimeSeriesData = writable([]);
  const loadingActiveUsersTimeSeriesData = writable(false);
  const mostActiveUsersData = writable([]);
  const loadingMostActiveUsersData = writable(false);
  const apiError = writable(null);
  let startDate = "";
  let endDate = "";
  let interval = "day";
  let mostActiveUsersLimit = 10;
  let showLoadingMessage = false;
  let aggregatedNewUsersData = (() => {
    store_get($$store_subs ??= {}, "$newUsersTimeSeriesData", newUsersTimeSeriesData);
    {
      return [];
    }
  })();
  let aggregatedActiveUsersData = (() => {
    store_get($$store_subs ??= {}, "$activeUsersTimeSeriesData", activeUsersTimeSeriesData);
    {
      return [];
    }
  })();
  let newUsersYMax = (() => {
    if (!aggregatedNewUsersData || aggregatedNewUsersData.length === 0) {
      return 10;
    }
    const maxCount = Math.max(...aggregatedNewUsersData.map((d) => d.count));
    const buffer = 10;
    const percentageBuffer = maxCount * 0.1;
    return Math.max(1, Math.ceil(maxCount + buffer + percentageBuffer));
  })();
  let activeUsersYMax = (() => {
    if (!aggregatedActiveUsersData || aggregatedActiveUsersData.length === 0) {
      return 10;
    }
    const maxCount = Math.max(...aggregatedActiveUsersData.map((d) => d.count));
    const buffer = 10;
    const percentageBuffer = maxCount * 0.1;
    return Math.max(1, Math.ceil(maxCount + buffer + percentageBuffer));
  })();
  $$payload.out.push(`<h1 class="svelte-14x6c00">Статистика Пользователей</h1> <section class="stat-section control-panel svelte-14x6c00"><div class="stats-controls-row svelte-14x6c00"><div class="input-date-group svelte-14x6c00"><label for="statStartDate" class="svelte-14x6c00">Начальная дата:</label> <input type="date" id="statStartDate"${attr("value", startDate)} min="2020-01-01" max="2030-12-31" class="svelte-14x6c00"/></div> <div class="input-date-group svelte-14x6c00"><label for="statEndDate" class="svelte-14x6c00">Конечная дата:</label> <input type="date" id="statEndDate"${attr("value", endDate)} min="2020-01-01" max="2030-12-31" class="svelte-14x6c00"/></div> <button class="update-button svelte-14x6c00">Обновить статистику</button> <div class="summary-content-placeholder svelte-14x6c00">`);
  if (store_get($$store_subs ??= {}, "$apiError", apiError)) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<p class="error-message svelte-14x6c00">Ошибка: ${escape_html(store_get($$store_subs ??= {}, "$apiError", apiError))}</p>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (store_get($$store_subs ??= {}, "$loadingTotalUsersStatistics", loadingTotalUsersStatistics) || showLoadingMessage) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<p class="info-message svelte-14x6c00">Загрузка общей статистики пользователей...</p>`);
    } else {
      $$payload.out.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$totalUsersStatistics", totalUsersStatistics) && store_get($$store_subs ??= {}, "$totalUsersStatistics", totalUsersStatistics).count !== void 0) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<div class="user-stats-card svelte-14x6c00"><p class="stat-label svelte-14x6c00">Общее количество уникальных пользователей</p> <p class="stat-value svelte-14x6c00">${escape_html(store_get($$store_subs ??= {}, "$totalUsersStatistics", totalUsersStatistics).count)}</p></div>`);
      } else {
        $$payload.out.push("<!--[!-->");
        $$payload.out.push(`<p class="info-message svelte-14x6c00">Общая статистика пользователей пока не загружена. Выберите даты и нажмите "Обновить
					статистику".</p>`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div></div></section> <section class="stat-section svelte-14x6c00"><h2 class="svelte-14x6c00">Новые пользователи по времени (Линейный график)</h2> <div class="input-group-container svelte-14x6c00"><label for="intervalNewUsers" class="svelte-14x6c00">Интервал:</label> <select id="intervalNewUsers" class="svelte-14x6c00">`);
  $$payload.select_value = interval;
  $$payload.out.push(`<option value="hour"${maybe_selected($$payload, "hour")}>По часам</option><option value="day"${maybe_selected($$payload, "day")}>По дням</option><option value="month"${maybe_selected($$payload, "month")}>По месяцам</option>`);
  $$payload.select_value = void 0;
  $$payload.out.push(`</select></div> <div class="chart-container svelte-14x6c00">`);
  if (store_get($$store_subs ??= {}, "$loadingNewUsersTimeSeriesData", loadingNewUsersTimeSeriesData) || showLoadingMessage) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<p class="info-message svelte-14x6c00">Загрузка данных для графика новых пользователей...</p>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (store_get($$store_subs ??= {}, "$apiError", apiError) && aggregatedNewUsersData.length === 0) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<p class="error-message svelte-14x6c00">Ошибка загрузки данных для графика новых пользователей: ${escape_html(store_get($$store_subs ??= {}, "$apiError", apiError))}</p>`);
    } else {
      $$payload.out.push("<!--[!-->");
      if (aggregatedNewUsersData && aggregatedNewUsersData.length > 0) {
        $$payload.out.push("<!--[-->");
        LineChart($$payload, { data: aggregatedNewUsersData, yAxisMax: newUsersYMax });
      } else {
        $$payload.out.push("<!--[!-->");
        $$payload.out.push(`<p class="info-message svelte-14x6c00">Нет данных для отображения графика новых пользователей за выбранный период.</p>`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div></section> <section class="stat-section svelte-14x6c00"><h2 class="svelte-14x6c00">Активные пользователи по времени (Линейный график)</h2> <div class="input-group-container svelte-14x6c00"><label for="intervalActiveUsers" class="svelte-14x6c00">Интервал:</label> <select id="intervalActiveUsers" class="svelte-14x6c00">`);
  $$payload.select_value = interval;
  $$payload.out.push(`<option value="hour"${maybe_selected($$payload, "hour")}>По часам</option><option value="day"${maybe_selected($$payload, "day")}>По дням</option><option value="month"${maybe_selected($$payload, "month")}>По месяцам</option>`);
  $$payload.select_value = void 0;
  $$payload.out.push(`</select></div> <div class="chart-container svelte-14x6c00">`);
  if (store_get($$store_subs ??= {}, "$loadingActiveUsersTimeSeriesData", loadingActiveUsersTimeSeriesData) || showLoadingMessage) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<p class="info-message svelte-14x6c00">Загрузка данных для графика активных пользователей...</p>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (store_get($$store_subs ??= {}, "$apiError", apiError) && aggregatedActiveUsersData.length === 0) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<p class="error-message svelte-14x6c00">Ошибка загрузки данных для графика активных пользователей: ${escape_html(store_get($$store_subs ??= {}, "$apiError", apiError))}</p>`);
    } else {
      $$payload.out.push("<!--[!-->");
      if (aggregatedActiveUsersData && aggregatedActiveUsersData.length > 0) {
        $$payload.out.push("<!--[-->");
        LineChart($$payload, { data: aggregatedActiveUsersData, yAxisMax: activeUsersYMax });
      } else {
        $$payload.out.push("<!--[!-->");
        $$payload.out.push(`<p class="info-message svelte-14x6c00">Нет данных для отображения графика активных пользователей за выбранный период.</p>`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div></section> <section class="stat-section svelte-14x6c00"><h2 class="svelte-14x6c00">Самые активные пользователи</h2> <div class="input-group-container svelte-14x6c00"><div class="svelte-14x6c00"><label for="mostActiveLimit" class="svelte-14x6c00">Показать:</label> <input type="number" id="mostActiveLimit"${attr("value", mostActiveUsersLimit)} min="1" max="100" class="svelte-14x6c00"/></div> <button class="update-button svelte-14x6c00">Обновить список</button></div> `);
  if (store_get($$store_subs ??= {}, "$apiError", apiError)) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<p class="error-message svelte-14x6c00">Ошибка: ${escape_html(store_get($$store_subs ??= {}, "$apiError", apiError))}</p>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (store_get($$store_subs ??= {}, "$loadingMostActiveUsersData", loadingMostActiveUsersData) || showLoadingMessage) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<p class="info-message svelte-14x6c00">Загрузка данных о самых активных пользователях...</p>`);
    } else {
      $$payload.out.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$mostActiveUsersData", mostActiveUsersData) && store_get($$store_subs ??= {}, "$mostActiveUsersData", mostActiveUsersData).length > 0) {
        $$payload.out.push("<!--[-->");
        const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$mostActiveUsersData", mostActiveUsersData));
        $$payload.out.push(`<div class="table-container svelte-14x6c00"><table class="svelte-14x6c00"><thead><tr><th class="svelte-14x6c00">ID Пользователя</th><th class="svelte-14x6c00">Имя пользователя</th><th class="svelte-14x6c00">Имя</th><th class="svelte-14x6c00">Фамилия</th><th class="svelte-14x6c00">Количество взаимодействий</th></tr></thead><tbody class="svelte-14x6c00"><!--[-->`);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let user = each_array[$$index];
          $$payload.out.push(`<tr class="svelte-14x6c00"><td class="svelte-14x6c00">${escape_html(user.user_id)}</td><td class="svelte-14x6c00">${escape_html(user.username || "-")}</td><td class="svelte-14x6c00">${escape_html(user.first_name || "-")}</td><td class="svelte-14x6c00">${escape_html(user.last_name || "-")}</td><td class="svelte-14x6c00">${escape_html(user.interactionCount)}</td></tr>`);
        }
        $$payload.out.push(`<!--]--></tbody></table></div>`);
      } else {
        $$payload.out.push("<!--[!-->");
        $$payload.out.push(`<p class="info-message svelte-14x6c00">Нет данных о самых активных пользователях за выбранный период.</p>`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></section>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-mqUN6oaY.js.map
