document.addEventListener('DOMContentLoaded', () => {
    initLightbox();
    initMobileMenu();
    initSlideshow();
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
    let isZoomed = false;
    let currentScale = 1;
    let panX = 0;
    let panY = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let lastTapTime = 0;
    let lastTapX = 0;
    let lastTapY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let initialPinchDist = 0;
    let pinchStartScale = 1;

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <span class="close-lightbox" aria-label="Close image modal">&times;</span>
        <span class="lightbox-arrow arrow-left" aria-label="Previous image">&#10094;</span>
        <span class="lightbox-arrow arrow-right" aria-label="Next image">&#10095;</span>
        <div class="lightbox-content">
            <div class="lightbox-image-container">
                <img class="lightbox-image" src="" alt="">
            </div>
            <div class="lightbox-metadata">
                <div class="artwork-title"></div>
                <div class="artwork-details"></div>
                <div class="artwork-more"><a href="#" target="_blank" rel="noopener noreferrer">More details</a></div>
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

    const resetZoom = () => {
        isZoomed = false;
        currentScale = 1;
        panX = 0;
        panY = 0;
        isDragging = false;
        lightboxImage.style.transition = 'transform 0.25s cubic-bezier(0.2, 1, 0.3, 1)';
        lightboxImage.style.transform = 'translate3d(0, 0, 0) scale(1)';
        lightboxImage.style.transformOrigin = 'center center';
    };

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

        resetZoom();
    };

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            showImage(index);
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Navigation Buttons (Desktop)
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex - 1); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex + 1); });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
        if (e.key === 'ArrowRight') showImage(currentIndex + 1);
        if (e.key === 'Escape') closeLightbox();
    });

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
        resetZoom();
    };

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Desktop Fine Pointer Hover Pan (Mouse only)
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (isFinePointer) {
        imageContainer.addEventListener('mousemove', (e) => {
            if (window.innerWidth < 992) return;
            const rect = imageContainer.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            lightboxImage.style.transformOrigin = `${x}% ${y}%`;
            lightboxImage.style.transform = 'scale(3)';
        });

        imageContainer.addEventListener('mouseleave', () => {
            resetZoom();
        });
    }

    // Touch Gestures for Mobile & Tablets
    const handleSwipe = () => {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const threshold = 45;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
            if (deltaX < 0) {
                showImage(currentIndex + 1);
            } else {
                showImage(currentIndex - 1);
            }
        } else if (deltaY > 90 && Math.abs(deltaX) < 50) {
            closeLightbox();
        }
    };

    imageContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            initialPinchDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            pinchStartScale = currentScale;
            return;
        }

        if (e.touches.length === 1) {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchEndX = touch.clientX;
            touchEndY = touch.clientY;

            if (isZoomed) {
                isDragging = true;
                dragStartX = touch.clientX - panX;
                dragStartY = touch.clientY - panY;
                lightboxImage.style.transition = 'none';
            }
        }
    }, { passive: true });

    imageContainer.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && initialPinchDist > 0) {
            const currentDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            currentScale = Math.min(Math.max(pinchStartScale * (currentDist / initialPinchDist), 1), 3.5);
            lightboxImage.style.transition = 'none';
            lightboxImage.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${currentScale})`;
            isZoomed = currentScale > 1.05;
            return;
        }

        if (e.touches.length === 1) {
            const touch = e.touches[0];
            touchEndX = touch.clientX;
            touchEndY = touch.clientY;

            if (isZoomed && isDragging) {
                panX = touch.clientX - dragStartX;
                panY = touch.clientY - dragStartY;
                lightboxImage.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${currentScale})`;
            }
        }
    }, { passive: true });

    imageContainer.addEventListener('touchend', (e) => {
        if (e.touches.length === 0) {
            initialPinchDist = 0;
            if (isDragging) {
                isDragging = false;
                lightboxImage.style.transition = 'transform 0.2s cubic-bezier(0.2, 1, 0.3, 1)';
            }

            if (currentScale < 1.05) {
                resetZoom();
            }

            // Double Tap Detection
            const now = Date.now();
            const deltaX = Math.abs(touchEndX - touchStartX);
            const deltaY = Math.abs(touchEndY - touchStartY);

            if (deltaX < 15 && deltaY < 15) {
                const timeDiff = now - lastTapTime;
                const distFromLastTap = Math.hypot(touchEndX - lastTapX, touchEndY - lastTapY);

                if (timeDiff > 0 && timeDiff < 320 && distFromLastTap < 35) {
                    if (isZoomed) {
                        resetZoom();
                    } else {
                        const rect = imageContainer.getBoundingClientRect();
                        const originX = ((touchEndX - rect.left) / rect.width) * 100;
                        const originY = ((touchEndY - rect.top) / rect.height) * 100;
                        lightboxImage.style.transformOrigin = `${originX}% ${originY}%`;
                        currentScale = 2.4;
                        isZoomed = true;
                        panX = 0;
                        panY = 0;
                        lightboxImage.style.transition = 'transform 0.28s cubic-bezier(0.2, 1, 0.3, 1)';
                        lightboxImage.style.transform = `translate3d(0, 0, 0) scale(${currentScale})`;
                    }
                    lastTapTime = 0;
                    return;
                }
                lastTapTime = now;
                lastTapX = touchEndX;
                lastTapY = touchEndY;
            }

            // Swipe navigation when NOT zoomed
            if (!isZoomed) {
                handleSwipe();
            }
        }
    }, { passive: true });
}

// Back to Top Button Logic
const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const jumpLinks = document.querySelector('.jump-links');
        if (jumpLinks) {
            const offset = 80;
            const elementPosition = jumpLinks.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        } else {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
}

// Hero Slideshow Logic
function initSlideshow() {
    const slides = document.querySelectorAll('#heroSlideshow .slide');
    if (slides.length === 0) return;

    const loadSlide = (slide) => {
        if (!slide || !slide.dataset.srcset || slide.querySelector('img')) return;
        const source = document.createElement('source');
        source.srcset = slide.dataset.srcset;
        source.sizes = '(max-width: 800px) 800px, 100vw';
        source.type = 'image/webp';
        
        const img = document.createElement('img');
        img.src = slide.dataset.src;
        img.alt = slide.dataset.alt || '';
        img.width = slide.dataset.width || 1159;
        img.height = slide.dataset.height || 869;
        img.decoding = 'async';
        
        slide.appendChild(source);
        slide.appendChild(img);
    };

    let currentSlide = 0;
    setTimeout(() => {
        if (slides.length > 1) loadSlide(slides[1]);
    }, 4000);
    
    setInterval(() => {
        const nextSlideIndex = (currentSlide + 1) % slides.length;
        loadSlide(slides[nextSlideIndex]);
        
        slides[currentSlide].classList.remove('active');
        slides[nextSlideIndex].classList.add('active');
        currentSlide = nextSlideIndex;
        
        const followingSlideIndex = (currentSlide + 1) % slides.length;
        loadSlide(slides[followingSlideIndex]);
    }, 5000);
}
