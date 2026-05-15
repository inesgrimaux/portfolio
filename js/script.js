document.addEventListener('DOMContentLoaded', () => {
    initLightbox();
    initMobileMenu();
});

function initMobileMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const sidebar = document.querySelector('.sidebar');
    
    if (hamburgerBtn && sidebar) {
        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-active');
        });
    }
}

function initLightbox() {
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    if (galleryItems.length === 0) return;

    let currentIndex = 0;

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <span class="close-lightbox">&times;</span>
        <span class="lightbox-arrow arrow-left">&#10094;</span>
        <span class="lightbox-arrow arrow-right">&#10095;</span>
        <div class="lightbox-content">
            <div class="lightbox-image-container">
                <img class="lightbox-image" src="" alt="">
            </div>
            <div class="lightbox-metadata">
                <div class="artwork-title"></div>
                <div class="artwork-details"></div>
                <div class="artwork-more"><a href="#" target="_blank">More details</a></div>
            </div>
        </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const imageContainer = lightbox.querySelector('.lightbox-image-container');
    const artworkTitle = lightbox.querySelector('.artwork-title');
    const artworkDetails = lightbox.querySelector('.artwork-details');
    const artworkMore = lightbox.querySelector('.artwork-more a');
    const closeBtn = lightbox.querySelector('.close-lightbox');
    const prevBtn = lightbox.querySelector('.arrow-left');
    const nextBtn = lightbox.querySelector('.arrow-right');

    const showImage = (index) => {
        if (index < 0) index = galleryItems.length - 1;
        if (index >= galleryItems.length) index = 0;
        currentIndex = index;

        const item = galleryItems[currentIndex];
        const img = item.querySelector('img');
        const title = item.dataset.title || 'Untitled Work';
        const size = item.dataset.size || 'Dimensions on request';
        const technique = item.dataset.technique || 'Digital Media';
        const year = item.dataset.year || '';
        const moreLink = item.dataset.more || '#';

        lightboxImage.src = img.src;
        artworkTitle.innerText = title;
        artworkDetails.innerText = `${technique}, ${size} ${year ? '– ' + year : ''}`;
        artworkMore.href = moreLink;

        // Reset zoom position
        lightboxImage.style.transform = 'scale(1)';
        lightboxImage.style.transformOrigin = 'center';
    };

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            showImage(index);
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Navigation
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex - 1); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex + 1); });

    // Touch Swipe Navigation for Mobile
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});

    lightbox.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {passive: true});

    const handleSwipe = () => {
        const threshold = 50; // minimum distance to trigger swipe
        if (touchEndX < touchStartX - threshold) {
            // swiped left (next image)
            showImage(currentIndex + 1);
        }
        if (touchEndX > touchStartX + threshold) {
            // swiped right (previous image)
            showImage(currentIndex - 1);
        }
    };

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
        if (e.key === 'ArrowRight') showImage(currentIndex + 1);
        if (e.key === 'Escape') closeLightbox();
    });

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Pan-on-hover logic
    imageContainer.addEventListener('mousemove', (e) => {
        if (window.innerWidth < 992) return; // Disable on mobile

        const rect = imageContainer.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        lightboxImage.style.transformOrigin = `${x}% ${y}%`;
        lightboxImage.style.transform = 'scale(3)';
    });

    imageContainer.addEventListener('mouseleave', () => {
        lightboxImage.style.transform = 'scale(1)';
        lightboxImage.style.transformOrigin = 'center';
    });
}
