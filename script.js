const elements = {
  language: document.getElementById('language'),
  currency: document.getElementById('currency'),
  campaignStart: document.getElementById('campaignStart'),
  campaignEnd: document.getElementById('campaignEnd'),
  totalRevenue: document.getElementById('totalRevenue'),
  avgOrderValue: document.getElementById('avgOrderValue'),
  leadResponseRate: document.getElementById('leadResponseRate'),
  prospectResponseRate: document.getElementById('prospectResponseRate'),
  currencySymbolTop: document.getElementById('currencySymbolTop'),
  currencySymbolBottom: document.getElementById('currencySymbolBottom'),
  leadResponseValue: document.getElementById('leadResponseValue'),
  prospectResponseValue: document.getElementById('prospectResponseValue'),
  prospectsValue: document.getElementById('prospectsValue'),
  leadsValue: document.getElementById('leadsValue'),
  customersValue: document.getElementById('customersValue'),
  prospectsPercent: document.getElementById('prospectsPercent'),
  leadsPercent: document.getElementById('leadsPercent'),
  customersPercent: document.getElementById('customersPercent'),
  prospectsFill: document.getElementById('prospectsFill'),
  leadsFill: document.getElementById('leadsFill'),
  customersFill: document.getElementById('customersFill'),
  chartBody: document.getElementById('chartBody'),
  chartTicks: document.getElementById('chartTicks'),
  chartMeta: document.getElementById('chartMeta'),
};

const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$'
};

const currencyLocales = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  CAD: 'en-CA'
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function parseNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatWhole(value) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(Math.round(value));
}

function formatCurrency(value) {
  const currency = elements.currency.value;
  return new Intl.NumberFormat(currencyLocales[currency] || 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

function getMonthCount() {
  const startDate = new Date(`${elements.campaignStart.value}T00:00:00`);
  const endDate = new Date(`${elements.campaignEnd.value}T00:00:00`);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 6;
  }

  const monthSpan = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
  return clamp(monthSpan > 0 ? monthSpan : 1, 3, 6);
}

function renderTicks(maxValue) {
  const tickCount = 6;
  const tickStep = maxValue / tickCount;
  const ticks = Array.from({ length: tickCount + 1 }, (_, index) => Math.round(tickStep * index));

  elements.chartTicks.innerHTML = ticks
    .slice()
    .reverse()
    .map((tick) => `<div class="chart-tick">${formatWhole(tick)} people</div>`)
    .join('');
}

function renderChart(prospects, leads, customers) {
  const months = getMonthCount();
  const maxValue = Math.max(prospects, 1);
  const bars = [];

  for (let index = 0; index < months; index += 1) {
    const progress = months === 1 ? 1 : (index + 1) / months;
    const monthlyValue = maxValue * (0.3 + 0.7 * progress);
    const segmentWidth = monthlyValue / maxValue * 100;
    const customerWidth = segmentWidth * 0.18;
    const leadWidth = segmentWidth * 0.32;
    const prospectWidth = Math.max(segmentWidth - customerWidth - leadWidth - 0.6, 2);

    bars.push(`
      <div class="chart-row">
        <div class="chart-label">${index + 1}</div>
        <div class="chart-bar" data-value="${formatWhole(monthlyValue)}">
          <span class="chart-segment customers" style="width:${customerWidth}%;"></span>
          <span class="chart-segment leads" style="left:${customerWidth + 0.6}%; width:${leadWidth}%;"></span>
          <span class="chart-segment prospects" style="left:${customerWidth + leadWidth + 1.2}%; width:${prospectWidth}%;"></span>
        </div>
      </div>
    `);
  }

  elements.chartBody.innerHTML = bars.join('');
  elements.chartMeta.textContent = `${months} month${months > 1 ? 's' : ''}`;
  renderTicks(maxValue);
}

function update() {
  const revenue = Math.max(parseNumber(elements.totalRevenue.value), 0);
  const orderValue = Math.max(parseNumber(elements.avgOrderValue.value), 1);
  const leadRate = clamp(parseNumber(elements.leadResponseRate.value), 1, 100);
  const prospectRate = clamp(parseNumber(elements.prospectResponseRate.value), 1, 100);

  const customers = revenue / orderValue;
  const leads = (customers * 100) / leadRate;
  const prospects = (leads * 100) / prospectRate;

  const leadsToProspects = prospects > 0 ? (leads / prospects) * 100 : 0;
  const customersToProspects = prospects > 0 ? (customers / prospects) * 100 : 0;

  elements.currencySymbolTop.textContent = currencySymbols[elements.currency.value] || '$';
  elements.currencySymbolBottom.textContent = currencySymbols[elements.currency.value] || '$';
  elements.leadResponseValue.textContent = `${leadRate.toFixed(0)}%`;
  elements.prospectResponseValue.textContent = `${prospectRate.toFixed(0)}%`;

  elements.prospectsValue.textContent = formatWhole(prospects);
  elements.leadsValue.textContent = formatWhole(leads);
  elements.customersValue.textContent = formatWhole(customers);

  elements.prospectsPercent.textContent = '100%';
  elements.leadsPercent.textContent = `${Math.round(leadsToProspects)}%`;
  elements.customersPercent.textContent = `${Math.round(customersToProspects)}%`;

  elements.prospectsFill.style.width = '100%';
  elements.leadsFill.style.width = `${Math.max(5, leadsToProspects)}%`;
  elements.customersFill.style.width = `${Math.max(5, customersToProspects)}%`;

  renderChart(prospects, leads, customers);
}

['input', 'change'].forEach((eventName) => {
  document.addEventListener(eventName, (event) => {
    if (event.target.matches('input, select')) {
      update();
    }
  });
});

update();
