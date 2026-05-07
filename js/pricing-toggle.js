// Pricing billing toggle
const prices = {
  basic: {
    yearly:  { amount: '$480', period: '/year',  save: 'Save $120 per year' },
    monthly: { amount: '$50',  period: '/month', save: '' }
  },
  premium: {
    yearly:  { amount: '$960', period: '/year',  save: 'Save $240 per year' },
    monthly: { amount: '$100', period: '/month', save: '' }
  },
  agentic: {
    yearly:  { amount: 'Coming', period: ' Soon', save: '' },
    monthly: { amount: 'Coming', period: ' Soon', save: '' }
  }
};

function setBilling(mode) {
  document.getElementById('lblMonthly').classList.toggle('active', mode === 'monthly');
  document.getElementById('lblYearly').classList.toggle('active', mode === 'yearly');
  var p = prices.premium[mode];
  var a = prices.agentic[mode];
  document.getElementById('premiumPrice').textContent  = p.amount;
  document.getElementById('premiumPeriod').textContent = p.period;
  document.getElementById('premiumSave').textContent   = p.save;
  document.getElementById('agenticPrice').textContent  = a.amount;
  document.getElementById('agenticPeriod').textContent = a.period;
  document.getElementById('agenticSave').textContent   = a.save;
}

document.addEventListener('DOMContentLoaded', function() {
  setBilling('monthly');
});