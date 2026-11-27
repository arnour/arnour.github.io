(function () {
    const catalogUrl = new URL('assets/data/books.json', window.location.href);

    fetch(catalogUrl)
        .then((res) => res.json())
        .then((data) => {
            const book = data.books[0];
            if (!book) return;

            document.getElementById('book-meta').textContent =
                `Current Selection • Chapter ${book.spotlight_chapter} Spotlight`;
            document.getElementById('book-cover-publisher').textContent = book.publisher_label;
            document.getElementById('book-cover-title').textContent = book.title_short;
            document.getElementById('book-title').textContent = book.title;
            document.getElementById('book-authors').textContent = `by ${book.authors}`;
            document.getElementById('book-description').textContent = book.description;

            const container = document.getElementById('chapter-actions');
            container.innerHTML = '';

            const chapters = [...book.chapters].sort((a, b) => b.number - a.number);
            chapters.forEach((chapter) => {
                const isSpotlight = chapter.number === book.spotlight_chapter;
                const summaryHref = `${book.base_path}/${chapter.id}/index.html`;
                const quizHref = `${book.base_path}/${chapter.id}/quiz.html`;
                const quizClass = isSpotlight ? 'btn btn-secondary' : 'btn btn-third';

                const row = document.createElement('div');
                row.className = 'action-buttons';
                row.innerHTML = `
                    <a href="${summaryHref}" class="btn">Read Chapter ${chapter.number} Summary →</a>
                    <a href="${quizHref}" class="${quizClass}">Take Chapter ${chapter.number} Quiz 🎯</a>
                `;
                container.appendChild(row);
            });
        })
        .catch((err) => console.error('Could not load books catalog', err));
})();