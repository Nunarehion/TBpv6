import { w as push, S as store_get, U as maybe_selected, O as escape_html, J as attr, T as unsubscribe_stores, y as pop } from './index-DTZO5Y9b.js';
import { w as writable } from './index2-DgBjbq9f.js';
import { L as LineChart } from './LineChart-BoB1lZH-.js';
import 'chart.js/auto';

function PieChart($$payload, $$props) {
  push();
  getComputedStyle(document.documentElement).getPropertyValue("--gray-text").trim() || "#9ca3af";
  getComputedStyle(document.documentElement).getPropertyValue("--main-text").trim() || "#ffffff";
  getComputedStyle(document.documentElement).getPropertyValue("--second-color").trim() || "#374151";
  getComputedStyle(document.documentElement).getPropertyValue("--border-gray").trim() || "#4b556399";
  $$payload.out.push(`<div class="chart-wrapper svelte-1y6qpxw"><canvas></canvas></div>`);
  pop();
}
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  const clickStatistics = writable(null);
  const loadingClickStatistics = writable(false);
  const timeSeriesData = writable([]);
  const loadingTimeSeriesData = writable(false);
  const clicksByPatternData = writable([]);
  const loadingClicksByPatternData = writable(false);
  const apiError = writable(null);
  let startDate = "";
  let endDate = "";
  let interval = "hour";
  let selectedPattern = "";
  let showLoadingMessage = false;
  let aggregatedTimeSeriesData = (() => {
    store_get($$store_subs ??= {}, "$timeSeriesData", timeSeriesData);
    {
      return [];
    }
  })();
  let lineChartYMax = (() => {
    if (!aggregatedTimeSeriesData || aggregatedTimeSeriesData.length === 0) {
      return 10;
    }
    const maxCount = aggregatedTimeSeriesData.reduce((max, d) => Math.max(max, d.count), 0);
    const buffer = 10;
    const percentageBuffer = maxCount * 0.1;
    return Math.max(1, Math.ceil(maxCount + buffer + percentageBuffer));
  })();
  let pieChartData = (() => {
    return store_get($$store_subs ??= {}, "$clicksByPatternData", clicksByPatternData);
  })();
  $$payload.out.push(`<h1 class="svelte-ubnqvv">Статистика Бота</h1> <section class="stat-section svelte-ubnqvv"><h2 class="svelte-ubnqvv">Статистика кликов по времени (Линейный график)</h2> <div class="input-group-container svelte-ubnqvv"><label for="interval" class="svelte-ubnqvv">Интервал:</label> <select id="interval" class="svelte-ubnqvv">`);
  $$payload.select_value = interval;
  $$payload.out.push(`<option value="minute"${maybe_selected($$payload, "minute")}>По минутам</option><option value="10_minutes"${maybe_selected($$payload, "10_minutes")}>По 10 минут</option><option value="half_hour"${maybe_selected($$payload, "half_hour")}>По полчаса</option><option value="12_hours"${maybe_selected($$payload, "12_hours")}>По 12 часов</option><option value="hour"${maybe_selected($$payload, "hour")}>По часам</option><option value="day"${maybe_selected($$payload, "day")}>По дням</option><option value="week"${maybe_selected($$payload, "week")}>По неделям</option><option value="month"${maybe_selected($$payload, "month")}>По месяцам</option>`);
  $$payload.select_value = void 0;
  $$payload.out.push(`</select></div> <div class="chart-container svelte-ubnqvv">`);
  if (store_get($$store_subs ??= {}, "$loadingTimeSeriesData", loadingTimeSeriesData) || showLoadingMessage) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<p class="info-message transition-fade svelte-ubnqvv">Загрузка данных для линейного графика...</p>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (store_get($$store_subs ??= {}, "$apiError", apiError) && aggregatedTimeSeriesData.length === 0) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<p class="error-message transition-fade svelte-ubnqvv">Ошибка загрузки данных для линейного графика: ${escape_html(store_get($$store_subs ??= {}, "$apiError", apiError))}</p>`);
    } else {
      $$payload.out.push("<!--[!-->");
      if (aggregatedTimeSeriesData && aggregatedTimeSeriesData.length > 0) {
        $$payload.out.push("<!--[-->");
        LineChart($$payload, { data: aggregatedTimeSeriesData, yAxisMax: lineChartYMax });
      } else {
        $$payload.out.push("<!--[!-->");
        $$payload.out.push(`<p class="info-message transition-fade svelte-ubnqvv">Нет данных для отображения линейного графика за выбранный период.</p>`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div></section> <section class="stat-section svelte-ubnqvv"><h2 class="svelte-ubnqvv">Общая статистика</h2> <div class="input-group-container svelte-ubnqvv"><div class="svelte-ubnqvv"><label for="statStartDate" class="svelte-ubnqvv">Начальная дата:</label> <input type="date" id="statStartDate"${attr("value", startDate)} min="2020-01-01" max="2030-12-31" class="svelte-ubnqvv"/></div> <div class="svelte-ubnqvv"><label for="statEndDate" class="svelte-ubnqvv">Конечная дата:</label> <input type="date" id="statEndDate"${attr("value", endDate)} min="2020-01-01" max="2030-12-31" class="svelte-ubnqvv"/></div> <div class="svelte-ubnqvv"><label for="statPattern" class="svelte-ubnqvv">Паттерн (опционально):</label> <input type="text" id="statPattern"${attr("value", selectedPattern)} placeholder="Например, query/button_1" class="svelte-ubnqvv"/></div> <button class="update-button svelte-ubnqvv">Обновить статистику</button></div> <div class="summary-content-placeholder svelte-ubnqvv">`);
  if (store_get($$store_subs ??= {}, "$apiError", apiError)) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<p class="error-message transition-fade svelte-ubnqvv">Ошибка: ${escape_html(store_get($$store_subs ??= {}, "$apiError", apiError))}</p>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (store_get($$store_subs ??= {}, "$loadingClickStatistics", loadingClickStatistics) || showLoadingMessage) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<p class="info-message transition-fade svelte-ubnqvv">Загрузка общей статистики...</p>`);
    } else {
      $$payload.out.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$clickStatistics", clickStatistics) && store_get($$store_subs ??= {}, "$clickStatistics", clickStatistics).count !== void 0) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<div class="stats-card transition-fade svelte-ubnqvv"><p class="stat-value svelte-ubnqvv">${escape_html(store_get($$store_subs ??= {}, "$clickStatistics", clickStatistics).count)}</p> <p class="stat-label svelte-ubnqvv">Количество кликов</p></div>`);
      } else {
        $$payload.out.push("<!--[!-->");
        $$payload.out.push(`<p class="info-message transition-fade svelte-ubnqvv">Общая статистика пока не загружена. Выберите даты и нажмите "Обновить статистику".</p>`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div></section> <section class="stat-section svelte-ubnqvv"><h2 class="svelte-ubnqvv">Статистика кликов по паттернам (Круговой график)</h2> <div class="input-group-container svelte-ubnqvv"></div> <div class="chart-container svelte-ubnqvv">`);
  if (store_get($$store_subs ??= {}, "$loadingClicksByPatternData", loadingClicksByPatternData) || showLoadingMessage) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<p class="info-message transition-fade svelte-ubnqvv">Загрузка данных для кругового графика...</p>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (store_get($$store_subs ??= {}, "$apiError", apiError) && pieChartData.length === 0) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<p class="error-message transition-fade svelte-ubnqvv">Ошибка загрузки данных для кругового графика: ${escape_html(store_get($$store_subs ??= {}, "$apiError", apiError))}</p>`);
    } else {
      $$payload.out.push("<!--[!-->");
      if (pieChartData && pieChartData.length > 0) {
        $$payload.out.push("<!--[-->");
        PieChart($$payload);
      } else {
        $$payload.out.push("<!--[!-->");
        $$payload.out.push(`<p class="info-message transition-fade svelte-ubnqvv">Нет данных для отображения кругового графика за выбранный период.</p>`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div></section>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-C_LUhp6D.js.map
