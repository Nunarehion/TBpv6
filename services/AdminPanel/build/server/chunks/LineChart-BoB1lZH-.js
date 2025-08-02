import { w as push, y as pop } from './index-DTZO5Y9b.js';
import 'chart.js/auto';

function LineChart($$payload, $$props) {
  push();
  let {
    data = [],
    label = "Количество кликов",
    title = "Статистика кликов по времени",
    yAxisMax = null
  } = $$props;
  getComputedStyle(document.documentElement).getPropertyValue("--main-text").trim();
  getComputedStyle(document.documentElement).getPropertyValue("--gray-text").trim();
  getComputedStyle(document.documentElement).getPropertyValue("--blue").trim();
  getComputedStyle(document.documentElement).getPropertyValue("--border-gray").trim();
  $$payload.out.push(`<div class="chart-wrapper svelte-5kmnu8"><canvas></canvas></div>`);
  pop();
}

export { LineChart as L };
//# sourceMappingURL=LineChart-BoB1lZH-.js.map
