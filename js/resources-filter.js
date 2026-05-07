// Resources category filter
function filterPosts(cat, el) {
  document.querySelectorAll('.res-pill').forEach(function(p) {
    p.classList.remove('active');
  });
  el.classList.add('active');
  document.querySelectorAll('.post-card').forEach(function(card) {
    var show = cat === 'all' || card.dataset.cat === cat;
    card.style.display = show ? 'flex' : 'none';
  });
}