/* Balance gallery grids: never leave one photo alone in the last row.
   1) pick a column count whose last row has 2+ photos;
   2) if none exists (e.g. 2 columns and an odd count), the last photo spans the full row. */
(function () {
    const grids = document.querySelectorAll('.gallery-grid, [data-balance]');
    if (!grids.length) return;
    const balance = () => {
        grids.forEach(g => {
            g.style.gridTemplateColumns = '';
            const kids = g.children;
            const n = kids.length;
            if (n) {
                const last = kids[n - 1];
                last.style.gridColumn = '';
                last.style.aspectRatio = '';
            }
            const max = getComputedStyle(g).gridTemplateColumns.split(' ').length;
            if (max < 2 || n < 3) return;
            for (let c = max; c >= 2; c--) {
                if (n % c !== 1) {
                    g.style.gridTemplateColumns = 'repeat(' + c + ', 1fr)';
                    return;
                }
            }
            const last = kids[n - 1];
            last.style.gridColumn = '1 / -1';
            last.style.aspectRatio = '2 / 1';
        });
    };
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(balance, 120); });
    window.addEventListener('load', balance);
    balance();
})();
