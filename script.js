function loadAlbums() {
    const savedAlbums = localStorage.getItem('photoAlbums');
    if (savedAlbums) {
        albums = JSON.parse(savedAlbums);
        showAlbums(); // Albümleri yeniden göster
    }
}

// Admin panelden gelen mesajları dinle
window.addEventListener('message', function(event) {
    if (event.data.type === 'albumsUpdated') {
        albums = event.data.albums;
        showAlbums(); // Albümleri güncelle
    }
});

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // LocalStorage'dan albümleri yükle
    const savedAlbums = localStorage.getItem('photoAlbums');
    if (savedAlbums) {
        albums = JSON.parse(savedAlbums);
    }
    showAlbums(); // Albümleri göster
    
    // LocalStorage değişikliklerini dinle
    window.addEventListener('storage', function(e) {
        if (e.key === 'photoAlbums') {
            const updatedAlbums = JSON.parse(e.newValue);
            albums = updatedAlbums;
            showAlbums();
        }
    });
});

// Albüm verilerini admin panelden al
let albums = window.albums || {
    'dugun-2024': {
        id: 'dugun-2024',
        title: 'Düğün 2024',
        category: 'wedding',
        coverImage: 'https://i.ibb.co/QQTSG6g/STL00553.jpg',
        photos: [
            {
                id: 'dugun-2024-1',
                url: 'https://i.ibb.co/QQTSG6g/STL00553.jpg',
                title: 'Düğün Çekimi 1',
                category: 'Düğün',
                featured: true
            },
            {
                id: 'dugun-2024-2',
                url: 'https://i.ibb.co/n7zpb8C/D61-2027-2.jpg',
                title: 'Düğün Çekimi 2',
                category: 'Düğün',
                featured: true
            }
        ]
    }
};

// Albümleri göster
function showAlbums() {
    const albumsContainer = document.querySelector('.albums-container');
    const photosContainer = document.querySelector('.photos-container');
    
    albumsContainer.style.display = 'block';
    photosContainer.style.display = 'none';
    
    // Albüm gridini güncelle
    const albumsGrid = document.querySelector('.albums-grid');
    albumsGrid.innerHTML = '';
    
    Object.values(albums).forEach(album => {
        const albumCard = createAlbumCard(album);
        albumsGrid.appendChild(albumCard);
    });
}

// Albüm kartı oluştur
function createAlbumCard(album) {
    const div = document.createElement('div');
    div.className = 'album-card';
    div.onclick = () => showAlbum(album.id);
    
    div.innerHTML = `
        <div class="album-cover">
            <img src="${album.coverImage}" alt="${album.title}">
            <div class="album-info">
                <h3>${album.title}</h3>
                <p>${album.photos.length} Fotoğraf</p>
            </div>
        </div>
    `;
    
    return div;
}

// Albüm içeriğini göster
function showAlbum(albumId) {
    const album = albums[albumId];
    if (!album) return;
    
    const albumsContainer = document.querySelector('.albums-container');
    const photosContainer = document.querySelector('.photos-container');
    const galleryGrid = document.getElementById('mainGallery');
    
    albumsContainer.style.display = 'none';
    photosContainer.style.display = 'block';
    galleryGrid.innerHTML = '';
    
    album.photos.forEach(photo => {
        const photoCard = createPhotoCard(photo);
        galleryGrid.appendChild(photoCard);
    });
}

// Fotoğraf kartı oluştur
function createPhotoCard(photo) {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    
    div.innerHTML = `
        <img src="${photo.url}" alt="${photo.title}">
        <div class="gallery-overlay" onclick="openLightbox(this.parentElement)">
            <i class="fas fa-search-plus"></i>
            <div class="gallery-info">
                <h3>${photo.title}</h3>
                <span class="category-badge">${photo.category}</span>
            </div>
        </div>
    `;
    
    return div;
}

// Lightbox fonksiyonları
function openLightbox(element) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const imgSrc = element.querySelector('img').src;
    
    lightboxImg.src = imgSrc;
    lightbox.style.display = 'block';
}

// Lightbox kapatma
document.querySelector('.close-lightbox').addEventListener('click', () => {
    document.getElementById('lightbox').style.display = 'none';
});

// Dışarı tıklandığında lightbox'ı kapat
document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') {
        document.getElementById('lightbox').style.display = 'none';
    }
});

// Filtreleme fonksiyonu
function filterGallery(searchText) {
    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => {
        const title = item.querySelector('h3').textContent.toLowerCase();
        const visible = title.includes(searchText.toLowerCase());
        item.style.display = visible ? 'block' : 'none';
    });
}

// Önceki ve sonraki fotoğraf için navigasyon
let currentPhotoIndex = 0;
let currentAlbumPhotos = [];

function showPrevPhoto() {
    if (currentPhotoIndex > 0) {
        currentPhotoIndex--;
        updateLightboxImage();
    }
}

function showNextPhoto() {
    if (currentPhotoIndex < currentAlbumPhotos.length - 1) {
        currentPhotoIndex++;
        updateLightboxImage();
    }
}

function updateLightboxImage() {
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = currentAlbumPhotos[currentPhotoIndex].url;
}

// Slideshow Yönetimi
let currentSlide = 0;
let slideInterval;
const SLIDE_INTERVAL_TIME = 5000; // 5 saniye

function initSlideshow() {
    const slideshow = document.querySelector('.slideshow');
    if (!slideshow) return;
    
    // LocalStorage'dan slaytları yükle
    const slides = JSON.parse(localStorage.getItem('homeSlides')) || getDefaultSlides();
    
    // Slaytları temizle ve yeniden oluştur
    slideshow.innerHTML = '';
    
    slides.forEach((slide, index) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'slide' + (index === 0 ? ' active' : '');
        
        // Resim yükleme kontrolü
        const img = new Image();
        img.src = slide.url;
        img.alt = slide.title;
        
        img.onload = () => {
            console.log(`Resim yüklendi: ${slide.title}`);
        };
        
        img.onerror = () => {
            console.error(`Resim yüklenemedi: ${slide.url}`);
            img.src = 'https://via.placeholder.com/800x600?text=Resim+Yüklenemedi';
        };
        
        slideDiv.appendChild(img);
        
        // Başlık ekle
        const caption = document.createElement('div');
        caption.className = 'slide-caption';
        caption.textContent = slide.title;
        slideDiv.appendChild(caption);
        
        slideshow.appendChild(slideDiv);
    });

    // İlk slaytı göster
    goToSlide(0);
    
    // Otomatik geçişi başlat
    startAutoSlide();
}

// Varsayılan slaytları getir
function getDefaultSlides() {
    return [
        {
            url: 'https://i.ibb.co/QQTSG6g/STL00553.jpg',
            title: 'Düğün Çekimi 1'
        },
        {
            url: 'https://i.ibb.co/n7zpb8C/D61-2027-2.jpg',
            title: 'Düğün Çekimi 2'
        },
        {
            url: 'https://i.ibb.co/hVTXRkF/wedding1.jpg',
            title: 'Düğün Çekimi 3'
        }
    ];
}

// LocalStorage'dan slaytları güncelle
function updateSlidesFromStorage() {
    const slides = JSON.parse(localStorage.getItem('homeSlides'));
    if (slides) {
        const slideshow = document.querySelector('.slideshow');
        if (slideshow) {
            // Mevcut slaytları temizle
            slideshow.innerHTML = '';
            // Yeni slaytları ekle
            slides.forEach((slide, index) => {
                const slideDiv = document.createElement('div');
                slideDiv.className = 'slide' + (index === 0 ? ' active' : '');
                slideDiv.innerHTML = `
                    <img src="${slide.url}" alt="${slide.title}">
                    <div class="slide-caption">${slide.title}</div>
                `;
                slideshow.appendChild(slideDiv);
            });
            // İlk slaytı göster
            goToSlide(0);
        }
    }
}

// Storage değişikliklerini dinle
window.addEventListener('storage', function(e) {
    if (e.key === 'homeSlides') {
        updateSlidesFromStorage();
        // Otomatik geçişi yeniden başlat
        if (slideInterval) {
            clearInterval(slideInterval);
        }
        startAutoSlide();
    }
});

// Slayt değiştirme fonksiyonları
function goToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    
    currentSlide = (index + slides.length) % slides.length;
    
    slides.forEach(slide => {
        slide.classList.remove('active');
        slide.style.opacity = '0';
    });
    
    slides[currentSlide].classList.add('active');
    slides[currentSlide].style.opacity = '1';
}

function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    goToSlide(currentSlide + 1);
}

function prevSlide() {
    const slides = document.querySelectorAll('.slide');
    goToSlide(currentSlide - 1);
}

function startAutoSlide() {
    // Önceki zamanlayıcıyı temizle
    if (slideInterval) {
        clearInterval(slideInterval);
    }
    
    // Yeni zamanlayıcıyı başlat
    slideInterval = setInterval(() => {
        nextSlide();
    }, SLIDE_INTERVAL_TIME);
}

// Video bölümünü yükle
function loadVideos() {
    const videosGrid = document.querySelector('.videos-grid');
    
    // Klip-2024 playlist videoları
    const videos = [
        { url: 'https://www.youtube.com/watch?v=itlKxvJr_Pw', index: '01', title: 'Klip-2024 #1' },
        { url: 'https://www.youtube.com/watch?v=dqJFM0txN3g', index: '02', title: 'Klip-2024 #2' },
        { url: 'https://www.youtube.com/watch?v=rjuGfgQTx5g', index: '03', title: 'Klip-2024 #3' },
        { url: 'https://www.youtube.com/watch?v=lAwttdfGUiE', index: '04', title: 'Klip-2024 #4' },
        { url: 'https://www.youtube.com/watch?v=_DPdSmGn2T0', index: '05', title: 'Klip-2024 #5' },
        { url: 'https://www.youtube.com/watch?v=DcWR6DZvjWk', index: '06', title: 'Klip-2024 #6' },
        { url: 'https://www.youtube.com/watch?v=HspdCH-MsoQ', index: '07', title: 'Klip-2024 #7' },
        { url: 'https://www.youtube.com/watch?v=RYouH_5kboE', index: '08', title: 'Klip-2024 #8' },
        { url: 'https://www.youtube.com/watch?v=l7sHLKx1GnI', index: '09', title: 'Klip-2024 #9' },
        { url: 'https://www.youtube.com/watch?v=vMqpaCWHfZs', index: '10', title: 'Klip-2024 #10' },
        { url: 'https://www.youtube.com/watch?v=xOmDjrgM5-0', index: '11', title: 'Klip-2024 #11' },
        { url: 'https://www.youtube.com/watch?v=aDXzN4JfTEc', index: '12', title: 'Klip-2024 #12' },
        { url: 'https://www.youtube.com/watch?v=oX8YXSMSdHM', index: '13', title: 'Klip-2024 #13' },
        { url: 'https://www.youtube.com/watch?v=cjo5O-mQ4yk', index: '14', title: 'Klip-2024 #14' },
        { url: 'https://www.youtube.com/watch?v=I4ZX_ZK214o', index: '15', title: 'Klip-2024 #15' },
        { url: 'https://www.youtube.com/watch?v=r2o-gCGSc4w', index: '16', title: 'Klip-2024 #16' },
        { url: 'https://www.youtube.com/watch?v=1BEHUStXLjc', index: '17', title: 'Klip-2024 #17' },
        { url: 'https://www.youtube.com/watch?v=wEKwdPVnK-o', index: '18', title: 'Klip-2024 #18' },
        { url: 'https://www.youtube.com/watch?v=O6aN89lNXRs', index: '19', title: 'Klip-2024 #19' },
        { url: 'https://www.youtube.com/watch?v=k4J6CSyyYL8', index: '20', title: 'Klip-2024 #20' },
        { url: 'https://www.youtube.com/watch?v=kj_R9u0UkWo', index: '21', title: 'Klip-2024 #21' },
        { url: 'https://www.youtube.com/watch?v=FKS90OQfMKk', index: '22', title: 'Klip-2024 #22' },
        { url: 'https://www.youtube.com/watch?v=4YymR4MUubk', index: '23', title: 'Klip-2024 #23' },
        { url: 'https://www.youtube.com/watch?v=qucRn6wum20', index: '24', title: 'Klip-2024 #24' },
        { url: 'https://www.youtube.com/watch?v=t7ARkVDqnvA', index: '25', title: 'Klip-2024 #25' },
        { url: 'https://www.youtube.com/watch?v=Oxa6O0gubWE', index: '26', title: 'Klip-2024 #26' },
        { url: 'https://www.youtube.com/watch?v=v9Lq6vdeRGQ', index: '27', title: 'Klip-2024 #27' },
        { url: 'https://www.youtube.com/watch?v=WHY94Pvsl0k', index: '28', title: 'Klip-2024 #28' },
        { url: 'https://www.youtube.com/watch?v=cLK3pCB69gc', index: '29', title: 'Klip-2024 #29' },
        { url: 'https://www.youtube.com/watch?v=bRkwsC7D1rM', index: '30', title: 'Klip-2024 #30' },
        { url: 'https://www.youtube.com/watch?v=EDVDd4xY_QI', index: '31', title: 'Klip-2024 #31' },
        { url: 'https://www.youtube.com/watch?v=tOOx1GQZZro', index: '32', title: 'Klip-2024 #32' },
        { url: 'https://www.youtube.com/watch?v=JeSPm5BsJ5Y', index: '33', title: 'Klip-2024 #33' },
        { url: 'https://www.youtube.com/watch?v=mZiOLDZSIwc', index: '34', title: 'Klip-2024 #34' },
        { url: 'https://www.youtube.com/watch?v=eM_8M8a7IR0', index: '35', title: 'Klip-2024 #35' },
        { url: 'https://www.youtube.com/watch?v=WMiFVWdjFJU', index: '36', title: 'Klip-2024 #36' },
        { url: 'https://www.youtube.com/watch?v=MDpcPuINbkk', index: '37', title: 'Klip-2024 #37' },
        { url: 'https://www.youtube.com/watch?v=1ieRDY6t3Eo', index: '38', title: 'Klip-2024 #38' },
        { url: 'https://www.youtube.com/watch?v=55N0KdY_E2w', index: '39', title: 'Klip-2024 #39' },
        { url: 'https://www.youtube.com/watch?v=VBxuTdAuSX4', index: '40', title: 'Klip-2024 #40' },
        { url: 'https://www.youtube.com/watch?v=0WhZh8WBHcw', index: '41', title: 'Klip-2024 #41' },
        { url: 'https://www.youtube.com/watch?v=mfpK0o13_J4', index: '42', title: 'Klip-2024 #42' },
        { url: 'https://www.youtube.com/watch?v=7dK4eEi8u04', index: '43', title: 'Klip-2024 #43' },
        { url: 'https://www.youtube.com/watch?v=JPvxC_Cz-I0', index: '44', title: 'Klip-2024 #44' },
        { url: 'https://www.youtube.com/watch?v=4hYQbTp3mtU', index: '45', title: 'Klip-2024 #45' },
        { url: 'https://www.youtube.com/watch?v=4a58ZiJ0lyc', index: '46', title: 'Klip-2024 #46' },
        { url: 'https://www.youtube.com/watch?v=erWUChA7VW8', index: '47', title: 'Klip-2024 #47' },
        { url: 'https://www.youtube.com/watch?v=gqS8Bah7MT8', index: '48', title: 'Klip-2024 #48' },
        { url: 'https://www.youtube.com/watch?v=1FlPxcJsIE4', index: '49', title: 'Klip-2024 #49' },
        { url: 'https://www.youtube.com/watch?v=zU9nGfxribQ', index: '50', title: 'Klip-2024 #50' },
        { url: 'https://www.youtube.com/watch?v=Q8KojeOr58g', index: '51', title: 'Klip-2024 #51' },
        { url: 'https://www.youtube.com/watch?v=nbHp3S7qwWI', index: '52', title: 'Klip-2024 #52' },
        { url: 'https://www.youtube.com/watch?v=Lpyy3vCfkB8', index: '53', title: 'Klip-2024 #53' },
        { url: 'https://www.youtube.com/watch?v=8l8ef_DTxH0', index: '54', title: 'Klip-2024 #54' },
        { url: 'https://www.youtube.com/watch?v=GHZ4YZMGUzg', index: '55', title: 'Klip-2024 #55' },
        { url: 'https://www.youtube.com/watch?v=23QcpCsKBZE', index: '56', title: 'Klip-2024 #56' },
        { url: 'https://www.youtube.com/watch?v=mHY2oIURJz8', index: '57', title: 'Klip-2024 #57' },
        { url: 'https://www.youtube.com/watch?v=57Ly4EvfIEk', index: '58', title: 'Klip-2024 #58' },
        { url: 'https://www.youtube.com/watch?v=10bMZurHV1o', index: '59', title: 'Klip-2024 #59' },
        { url: 'https://www.youtube.com/watch?v=PWWyQ3WhpXw', index: '60', title: 'Klip-2024 #60' },
        { url: 'https://www.youtube.com/watch?v=L_OK-ih2CNg', index: '61', title: 'Klip-2024 #61' },
        { url: 'https://www.youtube.com/watch?v=RzJLzyH58rA', index: '62', title: 'Klip-2024 #62' },
        { url: 'https://www.youtube.com/watch?v=KJtlHz5eGeU', index: '63', title: 'Klip-2024 #63' }
    ];
    
    videosGrid.innerHTML = videos.map(video => `
        <div class="video-card">
            <div class="video-thumbnail" onclick="openVideoModal('${video.url}')">
                <img src="https://img.youtube.com/vi/${getYouTubeId(video.url)}/maxresdefault.jpg" 
                     alt="${video.title}">
                <div class="video-play-button">
                    <i class="fas fa-play"></i>
                </div>
                <div class="video-badge">${video.index}</div>
            </div>
            <div class="video-info">
                <h3>${video.title}</h3>
            </div>
        </div>
    `).join('');
}

// Video modalını aç
function openVideoModal(url) {
    const videoId = getYouTubeId(url);
    if (!videoId) return;
    
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
        <div class="video-modal-content">
            <div class="video-wrapper">
                <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
            <div class="close-video" onclick="closeVideoModal(this)">
                <i class="fas fa-times"></i>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    
    // ESC tuşu ile kapatma
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeVideoModal(modal.querySelector('.close-video'));
    });
}

// Video modalını kapat
function closeVideoModal(element) {
    const modal = element.closest('.video-modal');
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
}

// YouTube URL'sinden ID çıkar
function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Sayfa yüklendiğinde videoları yükle
document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
});

// Erişim kodu kontrolü için fonksiyon
function checkAccessCode() {
    const accessCode = document.getElementById('sidebarAccessCode').value;
    if (!accessCode) {
        showNotification('Lütfen erişim kodunu giriniz', 'error');
        return;
    }

    // Local storage'dan drive linklerini al
    const driveLinks = JSON.parse(localStorage.getItem('driveLinks') || '[]');
    
    // Erişim kodunu kontrol et
    const link = driveLinks.find(link => {
        return link.accessCode === accessCode && 
               link.status === 'active' && 
               (!link.expiryDate || new Date(link.expiryDate) > new Date());
    });

    if (link) {
        // Geçerli kod - Drive linkine yönlendir
        window.open(link.driveLink, '_blank');
    } else {
        // Geçersiz kod
        showNotification('Geçersiz veya süresi dolmuş erişim kodu!', 'error');
    }
}

// Bildirim gösterme fonksiyonu
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);

    // 3 saniye sonra bildirimi kaldır
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Enter tuşu ile erişim kodu kontrolü
document.getElementById('sidebarAccessCode').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkAccessCode();
    }
}); 

// Özel Slideshow Fonksiyonları
document.addEventListener('DOMContentLoaded', function() {
    const slideshowContainer = document.querySelector('.special-slideshow-section .slideshow-container');
    const slideshowWrapper = slideshowContainer.querySelector('.slideshow-wrapper');
    const slides = slideshowWrapper.querySelectorAll('.slide');
    const prevButton = slideshowContainer.querySelector('.nav-prev');
    const nextButton = slideshowContainer.querySelector('.nav-next');
    const paginationContainer = slideshowContainer.querySelector('.slideshow-pagination');

    let currentSlide = 0;
    const totalSlides = slides.length;

    // Pagination noktalarını oluştur
    slides.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        paginationContainer.appendChild(dot);
    });

    const dots = paginationContainer.querySelectorAll('.dot');

    function goToSlide(slideIndex) {
        // Slide ve dot aktiflik durumunu güncelle
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        slides[slideIndex].classList.add('active');
        dots[slideIndex].classList.add('active');

        // Slide'ları kaydır
        slideshowWrapper.style.transform = `translateX(-${slideIndex * 100}%)`;
        currentSlide = slideIndex;
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        goToSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        goToSlide(currentSlide);
    }

    // İlk slaytı göster ve otomatik geçişi başlat
    goToSlide(0);
    startAutoSlide();

    // Buton event listener'ları
    nextButton.addEventListener('click', nextSlide);
    prevButton.addEventListener('click', prevSlide);
});

function startAutoSlide() {
    // Önceki zamanlayıcıyı temizle
    if (slideInterval) {
        clearInterval(slideInterval);
    }
    
    // Yeni zamanlayıcıyı başlat
    slideInterval = setInterval(() => {
        nextSlide();
    }, 5000);
}