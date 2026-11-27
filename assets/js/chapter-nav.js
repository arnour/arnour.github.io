(function () {
    const body = document.body;
    const bookSlug = body.dataset.bookSlug;
    const chapterId = body.dataset.chapterId;
    const nav = document.getElementById('chapter-nav');
    if (!nav || !bookSlug || !chapterId) return;

    const catalogUrl = new URL('../../assets/data/books.json', window.location.href);

    fetch(catalogUrl)
        .then((res) => res.json())
        .then((data) => {
            const book = data.books.find((b) => b.slug === bookSlug);
            if (!book) return;

            const chapters = [...book.chapters].sort((a, b) => a.number - b.number);
            const current = chapters.find((c) => c.id === chapterId);
            if (!current) return;

            const prev = chapters.find((c) => c.number === current.number - 1);
            const next = chapters.find((c) => c.number === current.number + 1);

            const prevHtml = prev
                ? `<a href="../${prev.id}/index.html">&larr; Capítulo ${prev.number}</a>`
                : '<span class="disabled">&larr; Capítulo anterior</span>';
            const nextHtml = next
                ? `<a href="../${next.id}/index.html">Capítulo ${next.number} &rarr;</a>`
                : '<span class="disabled">Próximo capítulo &rarr;</span>';

            nav.innerHTML = `
                <span>${prevHtml}</span>
                <a href="../../index.html">Beyond the Chapter</a>
                <span>${nextHtml}</span>
            `;
        })
        .catch((err) => console.error('Could not load chapter navigation', err));
})();