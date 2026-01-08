console.log('main.js loaded');

// Load header component
async function loadHeader() {
    const response = await fetch('components/header.html');
    const html = await response.text();
    document.getElementById('header-placeholder').innerHTML = html;
    initMobileMenu();
    markActiveNavLink();
}

// Mark current page's nav link as active
function markActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a, .dropdown a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}

// Initialize mobile menu toggle
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const dropdown = document.querySelector('.dropdown');
    const MOBILE_BREAKPOINT = 850;

    if (menuToggle && dropdown) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
            menuToggle.textContent = dropdown.classList.contains('show') ? 'close' : 'menu';
        });

        dropdown.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                dropdown.classList.remove('show');
                menuToggle.textContent = 'menu';
            }
        });

        // Close dropdown when window expands past mobile breakpoint
        window.addEventListener('resize', () => {
            if (window.innerWidth > MOBILE_BREAKPOINT) {
                dropdown.classList.remove('show');
                menuToggle.textContent = 'menu';
            }
        });
    }
}

// Seeded random number generator
function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

// Shuffle array using seed
function shuffleArray(array, seed) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed + i) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Get number of columns based on window width
function getColumnCount() {
    const width = window.innerWidth;
    if (width < 600) return 2;
    if (width < 900) return 3;
    if (width < 1200) return 4;
    return 5;
}

// Load photo gallery from manifest
async function loadPhotoGallery() {
    console.log('loadPhotoGallery: starting');
    const galleryContainer = document.getElementById('photo-gallery');
    console.log('loadPhotoGallery: galleryContainer =', galleryContainer);
    if (!galleryContainer) {
        console.log('loadPhotoGallery: no gallery container found, exiting');
        return;
    }

    // Detect if we're on dictionary page (row layout) or home (column layout)
    const isRowLayout = galleryContainer.classList.contains('photo-gallery');

    try {
        console.log('loadPhotoGallery: fetching manifest.json');
        const response = await fetch('photos/manifest.json');
        console.log('loadPhotoGallery: fetch response status =', response.status);
        const manifest = await response.json();
        console.log('loadPhotoGallery: manifest loaded, folders =', Object.keys(manifest));

        if (isRowLayout) {
            // Row-based layout for dictionary page
            for (const [folder, photos] of Object.entries(manifest)) {
                console.log(`loadPhotoGallery: processing folder "${folder}" with ${photos.length} photos`);
                const row = document.createElement('div');
                row.className = 'gallery-row';

                const title = document.createElement('h2');
                title.className = 'gallery-row-title';
                title.textContent = folder;
                row.appendChild(title);

                const scroll = document.createElement('div');
                scroll.className = 'gallery-row-scroll';

                for (const photo of photos) {
                    const img = document.createElement('img');
                    img.src = `photos/${folder}/${photo}`;
                    img.alt = `${folder} photo`;
                    img.loading = 'lazy';
                    scroll.appendChild(img);
                }

                row.appendChild(scroll);
                galleryContainer.appendChild(row);
            }
        } else {
            // Column-based layout for home page
            const allPhotos = [];
            for (const [folder, photos] of Object.entries(manifest)) {
                for (const photo of photos) {
                    allPhotos.push({ folder, photo });
                }
            }
            console.log(`loadPhotoGallery: collected ${allPhotos.length} total photos`);

            // Randomize using timestamp seed (changes daily)
            const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
            const shuffledPhotos = shuffleArray(allPhotos, seed);
            console.log('loadPhotoGallery: photos shuffled with seed', seed);

            // Create column container
            const columnContainer = document.createElement('div');
            columnContainer.className = 'gallery-columns';

            // Get column count and create columns
            const columnCount = getColumnCount();
            const columns = [];
            for (let i = 0; i < columnCount; i++) {
                const column = document.createElement('div');
                column.className = 'gallery-column';
                columns.push(column);
                columnContainer.appendChild(column);
            }

            // Distribute photos across columns
            shuffledPhotos.forEach((item, index) => {
                const img = document.createElement('img');
                img.src = `photos/${item.folder}/${item.photo}`;
                img.alt = `${item.folder} photo`;
                img.loading = 'lazy';
                columns[index % columnCount].appendChild(img);
            });

            galleryContainer.appendChild(columnContainer);
        }
        console.log('loadPhotoGallery: finished successfully');
    } catch (error) {
        console.error('Failed to load photo gallery:', error);
    }
}

// Create and manage lightbox
function initLightbox() {
    // Create lightbox elements
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.textContent = 'close';
    closeBtn.setAttribute('aria-label', 'Close lightbox');

    const lightboxImg = document.createElement('img');
    lightboxImg.alt = 'Enlarged photo';

    lightbox.appendChild(closeBtn);
    lightbox.appendChild(lightboxImg);
    document.body.appendChild(lightbox);

    // Close lightbox function
    function closeLightbox() {
        lightbox.classList.remove('active');
    }

    // Event listeners
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    });

    // Add click handlers to gallery images
    document.querySelectorAll('.gallery-column img, .gallery-row-scroll img').forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
        });
    });
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    loadPhotoGallery().then(() => {
        initLightbox();
    });
});
