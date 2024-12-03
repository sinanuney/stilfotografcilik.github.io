// Albüm verileri
let albums = {};
let currentAlbumId = null;

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    loadAlbums();
    renderAlbumGrid();
    setupModalEvents();
});

// Albümleri yükle
function loadAlbums() {
    const savedAlbums = localStorage.getItem('photoAlbums');
    if (savedAlbums) {
        albums = JSON.parse(savedAlbums);
    }
}

// Albüm grid'ini oluştur
function renderAlbumGrid() {
    const grid = document.getElementById('albumsGrid');
    grid.innerHTML = '';

    Object.values(albums).forEach(album => {
        const card = createAlbumCard(album);
        grid.appendChild(card);
    });
}

// Albüm kartı oluştur
function createAlbumCard(album) {
    const card = document.createElement('div');
    card.className = 'album-card';
    card.innerHTML = `
        <div class="album-main" onclick="editAlbum('${album.id}')">
            <div class="album-cover">
                <img src="${album.coverImage}" alt="${album.title}">
                <span class="photo-count">
                    <i class="fas fa-image"></i> ${album.photos.length} Fotoğraf
                </span>
            </div>
            <div class="album-info">
                <h3 class="album-title">${album.title}</h3>
                <div class="album-meta">
                    <span><i class="fas fa-folder"></i>${getCategoryName(album.category)}</span>
                    <span><i class="fas fa-calendar"></i>${formatDate(album.date)}</span>
                </div>
            </div>
        </div>
        <div class="album-actions">
            <button class="btn-view" onclick="viewAlbum('${album.id}')" oncontextmenu="window.open('viewAlbum.html?id=${album.id}', '_blank'); return false;">
                <i class="fas fa-eye"></i> Görüntüle
            </button>
            <button class="btn-edit" onclick="editAlbum('${album.id}')">
                <i class="fas fa-edit"></i> Düzenle
            </button>
            <button class="btn-delete" onclick="deleteAlbum('${album.id}')">
                <i class="fas fa-trash"></i> Sil
            </button>
        </div>
    `;

    // Kartın ana bölümüne tıklama efekti ekle
    const mainSection = card.querySelector('.album-main');
    mainSection.style.cursor = 'pointer';
    mainSection.addEventListener('mouseover', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
    });
    mainSection.addEventListener('mouseout', function() {
        this.style.transform = 'none';
        this.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    });

    // Görüntüle butonuna sağ tıklama özelliği ekle
    const viewButton = card.querySelector('.btn-view');
    viewButton.title = 'Sağ tık: Yeni sekmede aç';

    return card;
}

// Yeni albüm modalını göster
function showNewAlbumModal() {
    const modal = document.getElementById('newAlbumModal');
    modal.style.display = 'block';

    // Form resetleme
    document.getElementById('newAlbumForm').reset();
}

// Yeni albüm oluştur
document.getElementById('newAlbumForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const title = formData.get('title');
    const category = formData.get('category');
    const coverImage = formData.get('coverImage');

    // Boş alan kontrolü
    if (!title || !category || !coverImage) {
        showNotification('Lütfen tüm alanları doldurun!', 'error');
        return;
    }

    // URL kontrolü
    if (!coverImage.startsWith('http')) {
        showNotification('Lütfen geçerli bir URL girin!', 'error');
        return;
    }

    // Benzersiz ID oluştur
    const albumId = `${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;

    // Yeni albüm oluştur
    albums[albumId] = {
        id: albumId,
        title: title,
        category: category,
        coverImage: coverImage,
        description: '',
        date: new Date().toISOString(),
        photos: []
    };

    try {
        // Albümleri kaydet
        saveAlbums();
        
        // Grid'i güncelle
        renderAlbumGrid();
        
        // Formu temizle ve modalı kapat
        this.reset();
        document.getElementById('newAlbumModal').style.display = 'none';
        
        // Başarı bildirimi göster
        showNotification('Albüm başarıyla oluşturuldu!', 'success');
    } catch (error) {
        console.error('Albüm oluşturma hatası:', error);
        showNotification('Albüm oluşturulurken bir hata oluştu!', 'error');
    }
});

// Albüm görüntüle
function viewAlbum(albumId) {
    currentAlbumId = albumId;
    const album = albums[albumId];
    if (!album) return;

    const modal = document.getElementById('albumDetailModal');
    modal.innerHTML = `
        <div class="modal-content wide-modal">
            <span class="close" onclick="this.closest('.modal').style.display='none'">&times;</span>
            <div class="album-header">
                <div class="cover-section">
                    <img src="${album.coverImage}" alt="${album.title}" class="album-cover-preview">
                    <div class="cover-actions">
                        <button class="btn-secondary" onclick="changeCoverPhoto('${albumId}')">
                            <i class="fas fa-camera"></i> Kapak Fotoğrafını Değiştir
                        </button>
                        <div class="cover-options">
                            <div class="cover-fit">
                                <label>Görünüm:</label>
                                <select onchange="updateCoverStyle(this.value, '${albumId}')">
                                    <option value="cover">Kapla</option>
                                    <option value="contain">Sığdır</option>
                                    <option value="auto">Otomatik</option>
                                </select>
                            </div>
                            <div class="cover-position">
                                <label>Konum:</label>
                                <div class="position-controls">
                                    <div class="position-sliders">
                                        <div class="slider-group">
                                            <label>Yatay: <span class="x-value">50</span>%</label>
                                            <input type="range" class="position-x" min="0" max="100" value="50" 
                                                oninput="updatePositionPreview('${albumId}', this)">
                                        </div>
                                        <div class="slider-group">
                                            <label>Dikey: <span class="y-value">50</span>%</label>
                                            <input type="range" class="position-y" min="0" max="100" value="50" 
                                                oninput="updatePositionPreview('${albumId}', this)">
                                        </div>
                                    </div>
                                    <div class="position-actions">
                                        <div class="position-presets">
                                            <button type="button" onclick="setPosition('${albumId}', 50, 0)">Üst</button>
                                            <button type="button" onclick="setPosition('${albumId}', 50, 50)">Orta</button>
                                            <button type="button" onclick="setPosition('${albumId}', 50, 100)">Alt</button>
                                        </div>
                                        <button class="btn-primary save-position" onclick="savePosition('${albumId}')">
                                            <i class="fas fa-save"></i> Konumu Kaydet
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="album-info">
                    <h2>${album.title}</h2>
                    <div class="album-meta">
                        <span><i class="fas fa-folder"></i> ${getCategoryName(album.category)}</span>
                        <span><i class="fas fa-calendar"></i> ${formatDate(album.date)}</span>
                        <span><i class="fas fa-image"></i> ${album.photos.length} Fotoğraf</span>
                    </div>
                </div>
            </div>
            <div class="album-content">
                <div class="content-header">
                    <h3>Fotoğraflar</h3>
                    <button class="btn-primary" onclick="showPhotoUploadModal()">
                        <i class="fas fa-plus"></i> Fotoğraf Ekle
                    </button>
                </div>
                <div class="photos-grid" id="albumPhotos">
                    ${album.photos.map(photo => createPhotoCard(photo)).join('')}
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'block';

    // Mevcut ayarları uygula
    if (album.settings) {
        const coverImg = modal.querySelector('.album-cover-preview');
        if (album.settings.coverStyle) {
            coverImg.style.objectFit = album.settings.coverStyle;
            modal.querySelector('select').value = album.settings.coverStyle;
        }
        if (album.settings.coverPosition) {
            coverImg.style.objectPosition = album.settings.coverPosition;
            const positionBtn = modal.querySelector(`[data-position="${album.settings.coverPosition}"]`);
            if (positionBtn) positionBtn.classList.add('active');
        }
    }
}

// Fotoğraf kartı oluştur
function createPhotoCard(photo) {
    const img = new Image();
    img.src = photo.url;
    
    return `
        <div class="photo-item ${img.naturalHeight > img.naturalWidth ? 'vertical' : ''}" data-id="${photo.id}">
            <div class="photo-wrapper" onclick="openPhotoViewer('${photo.url}', '${photo.title}')">
                <img src="${photo.url}" alt="${photo.title}" onload="checkOrientation(this)">
                <div class="photo-hover-overlay">
                    <i class="fas fa-search-plus"></i>
                </div>
            </div>
            <div class="photo-overlay">
                <div class="photo-actions">
                    <button class="btn-icon" onclick="editPhoto('${photo.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deletePhoto('${photo.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="photo-info">
                <p class="photo-title" onclick="openPhotoViewer('${photo.url}', '${photo.title}')">${photo.title}</p>
            </div>
        </div>
    `;
}

// Fotoğraf yönnü kontrol et
function checkOrientation(img) {
    const photoItem = img.closest('.photo-item');
    if (img.naturalHeight > img.naturalWidth) {
        photoItem.classList.add('vertical');
    } else {
        photoItem.classList.remove('vertical');
    }
}

// Fotoğraf yükleme modalını göster
function showPhotoUploadModal() {
    if (!currentAlbumId) {
        showNotification('Lütfen önce bir albüm seçin!', 'error');
        return;
    }
    
    const modal = document.getElementById('photoUploadModal');
    modal.style.display = 'block';
    
    // Form ve önizlemeyi sıfırla
    document.getElementById('photoUploadForm').reset();
    document.querySelector('.preview-section').style.display = 'none';
    document.querySelector('.btn-add-photo').disabled = true;
}

// Fotoğraf önizleme
function previewPhotos() {
    const textarea = document.querySelector('textarea[name="photoUrls"]');
    const urls = textarea.value.trim().split('\n').filter(url => url.trim() !== '');
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = '';

    if (urls.length === 0) {
        preview.innerHTML = '<p class="no-preview">Önizleme için URL giriniz</p>';
        return;
    }

    urls.forEach((url, index) => {
        const img = document.createElement('img');
        img.src = url.trim();
        img.alt = `Önizleme ${index + 1}`;
        img.onload = () => checkPreviewOrientation(img);
        img.onerror = () => {
            img.src = 'placeholder.jpg';
            img.classList.add('error');
        };
        preview.appendChild(img);
    });

    // URL'ler geçerliyse ekle butonunu aktif et
    const addButton = document.getElementById('addPhotosBtn');
    addButton.disabled = urls.length === 0;
}

// Form gönderildiğinde
document.getElementById('photoUploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const urls = this.querySelector('textarea[name="photoUrls"]').value
        .trim()
        .split('\n')
        .filter(url => url.trim() !== '');
        
    const titleFormat = this.querySelector('input[name="titleFormat"]').value;

    if (urls.length === 0) {
        showNotification('Lütfen en az bir fotoğraf URL\'si girin', 'error');
        return;
    }

    // Fotoğrafları ekle
    urls.forEach((url, index) => {
        const title = titleFormat.replace('{sayı}', (index + 1));
        const photo = {
            id: Date.now() + index,
            url: url.trim(),
            title: title,
            date: new Date().toISOString()
        };
        
        if (currentAlbumId && albums[currentAlbumId]) {
            albums[currentAlbumId].photos.push(photo);
        }
    });

    // Albümü kaydet
    saveAlbums();
    
    // Formu temizle
    this.reset();
    document.getElementById('photoPreview').innerHTML = '';
    
    // Albüm görünümünü güncelle
    if (currentAlbumId) {
        viewAlbum(currentAlbumId);
    }

    showNotification('Fotoğraflar başarıyla eklendi');
});

// URL textarea'sını dinle
document.querySelector('textarea[name="photoUrls"]').addEventListener('input', function() {
    const addButton = document.getElementById('addPhotosBtn');
    const urls = this.value.trim().split('\n').filter(url => url.trim() !== '');
    addButton.disabled = urls.length === 0;
});

// Yardımcı fonksiyonlar
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getCategoryName(category) {
    const categories = {
        'wedding': 'Düğün',
        'engagement': 'Nişan',
        'savethedate': 'Save The Date',
        'story': 'Düğün Hikayesi',
        'special': 'Özel Çekim'
    };
    return categories[category] || category;
}

function saveAlbums() {
    localStorage.setItem('photoAlbums', JSON.stringify(albums));
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Modal olayları
function setupModalEvents() {
    // Modal kapatma düğmeleri
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.onclick = function() {
            this.closest('.modal').style.display = 'none';
            // Form resetleme
            const form = this.closest('.modal').querySelector('form');
            if (form) form.reset();
        };
    });

    // Modal dışına tıklama ile kapatma
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
            // Form resetleme
            const form = event.target.querySelector('form');
            if (form) form.reset();
        }
    };
}

// Albüm düzenleme
function editAlbum(albumId) {
    const album = albums[albumId];
    if (!album) return;

    // Mevcut modalı kapat
    const existingModal = document.querySelector('.modal');
    if (existingModal) existingModal.remove();

    // Yeni modal oluştur
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2>Albüm Düzenle</h2>
            <form id="editAlbumForm" class="admin-form">
                <div class="form-group">
                    <label>Albüm Adı</label>
                    <input type="text" name="title" value="${album.title}" required>
                </div>
                <div class="form-group">
                    <label>Kategori</label>
                    <select name="category" required>
                        <option value="wedding" ${album.category === 'wedding' ? 'selected' : ''}>Düğün</option>
                        <option value="engagement" ${album.category === 'engagement' ? 'selected' : ''}>Nişan</option>
                        <option value="savethedate" ${album.category === 'savethedate' ? 'selected' : ''}>Save The Date</option>
                        <option value="story" ${album.category === 'story' ? 'selected' : ''}>Düğün Hikayesi</option>
                        <option value="special" ${album.category === 'special' ? 'selected' : ''}>Özel Çekim</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Kapak Fotoğrafı URL'si</label>
                    <input type="url" name="coverImage" value="${album.coverImage}" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">
                        İptal
                    </button>
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-save"></i> Değişiklikleri Kaydet
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';

    // Form gönderimi
    const form = modal.querySelector('#editAlbumForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Albüm bilgilerini güncelle
        albums[albumId] = {
            ...albums[albumId], // Mevcut albüm bilgilerini koru
            title: this.querySelector('[name="title"]').value,
            category: this.querySelector('[name="category"]').value,
            coverImage: this.querySelector('[name="coverImage"]').value
        };

        // Değişiklikleri kaydet
        saveAlbums();
        
        // Grid'i güncelle
        renderAlbumGrid();
        
        // Modalı kapat
        modal.remove();
        
        // Bildirim göster
        showNotification('Albüm başarıyla güncellendi!', 'success');
    });
}

// Albüm silme
function deleteAlbum(albumId) {
    const album = albums[albumId];
    if (!album) return;

    if (confirm(`"${album.title}" albümünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
        delete albums[albumId];
        saveAlbums();
        renderAlbumGrid();
        showNotification('Albüm başarıyla silindi!', 'success');
    }
}

// Fotoğraf düzenleme
function editPhoto(photoId) {
    const album = albums[currentAlbumId];
    const photo = album.photos.find(p => p.id === photoId);
    if (!photo) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Fotoğraf Düzenle</h2>
            <form id="editPhotoForm" class="admin-form">
                <div class="form-group">
                    <label>Başlık</label>
                    <input type="text" name="title" value="${photo.title}" required>
                </div>
                <div class="form-group">
                    <label>URL</label>
                    <input type="url" name="url" value="${photo.url}" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">
                        İptal
                    </button>
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-save"></i> Kaydet
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Form gönderimi
    modal.querySelector('#editPhotoForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        // Fotoğraf bilgilerini güncelle
        const photoIndex = album.photos.findIndex(p => p.id === photoId);
        if (photoIndex !== -1) {
            album.photos[photoIndex] = {
                ...album.photos[photoIndex],
                title: formData.get('title'),
                url: formData.get('url')
            };
        }

        saveAlbums();
        viewAlbum(currentAlbumId);
        modal.remove();
        showNotification('Fotoğraf başarıyla güncellendi!', 'success');
    });
}

// Fotoğraf silme
function deletePhoto(photoId) {
    const album = albums[currentAlbumId];
    const photo = album.photos.find(p => p.id === photoId);
    
    if (confirm(`"${photo.title}" fotoğrafını silmek istediğinizden emin misiniz?`)) {
        album.photos = album.photos.filter(p => p.id !== photoId);
        saveAlbums();
        viewAlbum(currentAlbumId);
        showNotification('Fotoğraf başarıyla silindi!', 'success');
    }
}

// Fotoğraf görüntüleyici
function openPhotoViewer(url, title) {
    const viewer = document.createElement('div');
    viewer.className = 'photo-viewer';
    viewer.innerHTML = `
        <div class="viewer-content">
            <span class="close" onclick="this.closest('.photo-viewer').remove()">&times;</span>
            <img src="${url}" alt="${title}">
            <div class="viewer-info">
                <h3>${title}</h3>
            </div>
        </div>
    `;
    document.body.appendChild(viewer);

    // ESC tuşu ile kapatma
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            viewer.remove();
        }
    });

    // Dışarı tıklama ile kapatma
    viewer.addEventListener('click', function(e) {
        if (e.target === viewer) {
            viewer.remove();
        }
    });
}

// Kapak fotoğrafı değiştirme
function changeCoverPhoto(albumId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2>Kapak Fotoğrafını Değiştir</h2>
            <div class="imgbb-info">
                <h3>ImgBB'den Fotoğraf Ekleme</h3>
                <div class="imgbb-steps">
                    <div class="step">
                        <span class="step-number">1</span>
                        <a href="https://imgbb.com/upload" target="_blank" class="btn-upload">
                            <i class="fas fa-cloud-upload-alt"></i> ImgBB'ye Git
                        </a>
                    </div>
                    <div class="step">
                        <span class="step-number">2</span>
                        <p>"Get share links" butonuna tıklayın</p>
                    </div>
                    <div class="step">
                        <span class="step-number">3</span>
                        <p>"Direct link" URL'sini kopyalayın</p>
                    </div>
                </div>
            </div>
            <form id="coverPhotoForm" class="admin-form">
                <div class="form-group">
                    <label>Kapak Fotoğrafı URL'si</label>
                    <div class="url-input-area">
                        <input type="url" name="coverImage" value="${albums[albumId].coverImage}" 
                            placeholder="https://i.ibb.co/..." required>
                        <button type="button" class="btn-secondary preview-url" onclick="previewCoverUrl(this.form)">
                            <i class="fas fa-eye"></i> Önizle
                        </button>
                    </div>
                    <small>ImgBB'den aldığınız "Direct link" URL'sini yapıştırın</small>
                </div>
                <div class="cover-preview">
                    <img src="${albums[albumId].coverImage}" alt="Kapak önizleme">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">
                        İptal
                    </button>
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-save"></i> Kaydet
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // URL değiştiğinde otomatik önizleme
    const urlInput = modal.querySelector('input[name="coverImage"]');
    const preview = modal.querySelector('.cover-preview img');
    
    urlInput.addEventListener('input', () => {
        if (urlInput.value.startsWith('https://i.ibb.co/')) {
            preview.src = urlInput.value;
            urlInput.classList.remove('invalid');
        } else {
            urlInput.classList.add('invalid');
        }
    });

    // Form gönderimi
    modal.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        const newCoverUrl = this.querySelector('input[name="coverImage"]').value;
        
        // URL kontrolü
        if (!newCoverUrl.startsWith('https://i.ibb.co/')) {
            showNotification('Lütfen geçerli bir ImgBB URL\'si girin!', 'error');
            return;
        }

        albums[albumId].coverImage = newCoverUrl;
        saveAlbums();
        viewAlbum(albumId);
        modal.remove();
        showNotification('Kapak fotoğrafı başarıyla güncellendi!', 'success');
    });
}

// Kapak fotoğrafı URL önizleme
function previewCoverUrl(form) {
    const urlInput = form.querySelector('input[name="coverImage"]');
    const preview = form.querySelector('.cover-preview img');
    const url = urlInput.value;

    if (!url.startsWith('https://i.ibb.co/')) {
        showNotification('Lütfen geçerli bir ImgBB URL\'si girin!', 'error');
        urlInput.classList.add('invalid');
        return;
    }

    preview.src = url;
    urlInput.classList.remove('invalid');
}

// Kapak fotoğrafı görünümünü güncelle
function updateCoverStyle(style, albumId) {
    const coverImg = document.querySelector('.album-cover-preview');
    coverImg.style.objectFit = style;
    
    // Tercihi kaydet
    if (!albums[albumId].settings) {
        albums[albumId].settings = {};
    }
    albums[albumId].settings.coverStyle = style;
    saveAlbums();
}

// Kapak fotoğrafı konumunu güncelle
function updateCoverPosition(position, albumId) {
    const coverImg = document.querySelector('.album-cover-preview');
    const positionMap = {
        'top': '50% 0%',
        'center': '50% 50%',
        'bottom': '50% 100%'
    };
    
    coverImg.style.objectPosition = positionMap[position];
    
    // Aktif butonu güncelle
    document.querySelectorAll('.position-grid button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-position="${position}"]`).classList.add('active');
    
    // Tercihi kaydet
    if (!albums[albumId].settings) {
        albums[albumId].settings = {};
    }
    albums[albumId].settings.coverPosition = position;
    saveAlbums();
}

// Konum güncelleme fonksiyonu
function updatePosition(albumId, slider) {
    const coverImg = document.querySelector('.album-cover-preview');
    const xSlider = document.querySelector('.position-x');
    const ySlider = document.querySelector('.position-y');
    const xValue = document.querySelector('.x-value');
    const yValue = document.querySelector('.y-value');

    // Değerleri güncelle
    if (slider.classList.contains('position-x')) {
        xValue.textContent = slider.value;
    } else {
        yValue.textContent = slider.value;
    }

    // Konumu güncelle
    const position = `${xSlider.value}% ${ySlider.value}%`;
    coverImg.style.objectPosition = position;

    // Ayarları kaydet
    if (!albums[albumId].settings) {
        albums[albumId].settings = {};
    }
    albums[albumId].settings.coverPosition = position;
    saveAlbums();
}

// Hazır konum ayarları
function setPosition(albumId, x, y) {
    const xSlider = document.querySelector('.position-x');
    const ySlider = document.querySelector('.position-y');
    const xValue = document.querySelector('.x-value');
    const yValue = document.querySelector('.y-value');

    // Slider değerlerini güncelle
    xSlider.value = x;
    ySlider.value = y;
    xValue.textContent = x;
    yValue.textContent = y;

    // Konumu güncelle
    const coverImg = document.querySelector('.album-cover-preview');
    const position = `${x}% ${y}%`;
    coverImg.style.objectPosition = position;

    // Ayarları kaydet
    if (!albums[albumId].settings) {
        albums[albumId].settings = {};
    }
    albums[albumId].settings.coverPosition = position;
    saveAlbums();
}

// Konum önizleme
function updatePositionPreview(albumId, slider) {
    const coverImg = document.querySelector('.album-cover-preview');
    const xSlider = document.querySelector('.position-x');
    const ySlider = document.querySelector('.position-y');
    const xValue = document.querySelector('.x-value');
    const yValue = document.querySelector('.y-value');

    // Değerleri güncelle
    if (slider.classList.contains('position-x')) {
        xValue.textContent = slider.value;
    } else {
        yValue.textContent = slider.value;
    }

    // Konumu güncelle (geçici)
    const position = `${xSlider.value}% ${ySlider.value}%`;
    coverImg.style.objectPosition = position;
}

// Konum kaydetme
function savePosition(albumId) {
    const xSlider = document.querySelector('.position-x');
    const ySlider = document.querySelector('.position-y');
    const position = `${xSlider.value}% ${ySlider.value}%`;

    // Ayarları kaydet
    if (!albums[albumId].settings) {
        albums[albumId].settings = {};
    }
    albums[albumId].settings.coverPosition = position;
    saveAlbums();

    // Bildirim göster
    showNotification('Kapak fotoğrafı konumu kaydedildi!', 'success');

    // Kaydet butonunu geçici olarak devre dışı bırak
    const saveButton = document.querySelector('.save-position');
    saveButton.disabled = true;
    setTimeout(() => {
        saveButton.disabled = false;
    }, 1000);
}

// Slayt Yönetimi
function showSlideshowModal() {
    const modal = document.getElementById('slideshowModal');
    modal.style.display = 'block';
    loadSlides();
}

function loadSlides() {
    const slidesContainer = document.getElementById('slidesContainer');
    const slides = JSON.parse(localStorage.getItem('homeSlides')) || [];
    
    slidesContainer.innerHTML = '';
    
    slides.forEach((slide, index) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'slide-item';
        slideDiv.draggable = true;
        slideDiv.dataset.index = index;
        
        slideDiv.innerHTML = `
            <div class="slide-preview">
                <img src="${slide.url}" alt="${slide.title}">
                <div class="slide-caption">${slide.title}</div>
            </div>
            <div class="slide-actions">
                <button onclick="editSlide(${index})">
                    <i class="fas fa-edit"></i> Düzenle
                </button>
                <button onclick="deleteSlide(${index})">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        `;
        
        slidesContainer.appendChild(slideDiv);
    });
    
    setupDragAndDrop();
}

// Yeni slayt ekle
document.getElementById('newSlideForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const url = formData.get('slideUrl');
    const title = formData.get('slideTitle');
    
    if (!url || !title) {
        showNotification('Lütfen tüm alanları doldurun!', 'error');
        return;
    }
    
    const slides = JSON.parse(localStorage.getItem('homeSlides')) || [];
    slides.push({ url, title });
    
    localStorage.setItem('homeSlides', JSON.stringify(slides));
    loadSlides();
    
    this.reset();
    showNotification('Slayt başarıyla eklendi!', 'success');
});

// Slayt düzenle
function editSlide(index) {
    const slides = JSON.parse(localStorage.getItem('homeSlides')) || [];
    const slide = slides[index];
    
    if (!slide) return;
    
    const modal = document.getElementById('editSlideModal');
    modal.style.display = 'block';
    
    document.getElementById('editSlideIndex').value = index;
    document.getElementById('editSlideUrl').value = slide.url;
    document.getElementById('editSlideTitle').value = slide.title;
}

// Slayt düzenleme formunu kaydet
document.getElementById('editSlideForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const index = document.getElementById('editSlideIndex').value;
    const url = document.getElementById('editSlideUrl').value;
    const title = document.getElementById('editSlideTitle').value;
    
    const slides = JSON.parse(localStorage.getItem('homeSlides')) || [];
    
    if (slides[index]) {
        slides[index] = { url, title };
        localStorage.setItem('homeSlides', JSON.stringify(slides));
        loadSlides();
        
        document.getElementById('editSlideModal').style.display = 'none';
        showNotification('Slayt başarıyla güncellendi!', 'success');
    }
});

// Slayt sil
function deleteSlide(index) {
    if (!confirm('Bu slaytı silmek istediğinizden emin misiniz?')) return;
    
    const slides = JSON.parse(localStorage.getItem('homeSlides')) || [];
    slides.splice(index, 1);
    
    localStorage.setItem('homeSlides', JSON.stringify(slides));
    loadSlides();
    
    showNotification('Slayt başarıyla silindi!', 'success');
}

// Sürükle-bırak sıralama
function setupDragAndDrop() {
    const container = document.getElementById('slidesContainer');
    const items = container.getElementsByClassName('slide-item');
    
    Array.from(items).forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    draggedItem = this;
    this.style.opacity = '0.4';
}

function handleDragEnd(e) {
    draggedItem.style.opacity = '1';
    draggedItem = null;
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    
    if (this !== draggedItem) {
        const slides = JSON.parse(localStorage.getItem('homeSlides')) || [];
        const fromIndex = parseInt(draggedItem.dataset.index);
        const toIndex = parseInt(this.dataset.index);
        
        const [movedSlide] = slides.splice(fromIndex, 1);
        slides.splice(toIndex, 0, movedSlide);
        
        localStorage.setItem('homeSlides', JSON.stringify(slides));
        loadSlides();
    }
}

// Fotoğraf modalını kapat
function closePhotoModal() {
    const modal = document.getElementById('photoUploadModal');
    modal.style.display = 'none';
    
    // Formu temizle
    document.getElementById('photoUploadForm').reset();
    
    // Önizlemeyi temizle
    const preview = document.querySelector('.photo-preview');
    if (preview) {
        preview.innerHTML = '';
    }
    
    // Preview section'ı gizle
    document.querySelector('.preview-section').style.display = 'none';
    
    // Ekleme butonunu devre dışı bırak
    document.querySelector('.btn-add-photo').disabled = true;
}

// Fotoğraf yükleme formunu dinle
document.getElementById('photoUploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!currentAlbumId) {
        showNotification('Lütfen bir albüm seçin!', 'error');
        return;
    }
    
    try {
        const formData = new FormData(this);
        const urls = formData.get('photoUrls')
            .split('\n')
            .map(url => url.trim())
            .filter(url => url && url.startsWith('https://i.ibb.co/'));
        
        const titleFormat = formData.get('titleFormat') || 'Fotoğraf {sayı}';
        
        if (urls.length === 0) {
            showNotification('Geçerli ImgBB URL\'si bulunamadı!', 'error');
            return;
        }
        
        // Fotoğrafları oluştur
        const photos = urls.map((url, index) => ({
            id: `photo-${Date.now()}-${index}`,
            url: url,
            title: titleFormat.replace('{sayı}', (index + 1).toString()),
            date: new Date().toISOString()
        }));
        
        // Albüme fotoğrafları ekle
        if (!albums[currentAlbumId].photos) {
            albums[currentAlbumId].photos = [];
        }
        
        albums[currentAlbumId].photos.push(...photos);
        saveAlbums();
        
        // Modalı kapat
        closePhotoModal();
        
        // Albümü yeniden yükle
        loadAlbumPhotos(currentAlbumId);
        
        showNotification(`${photos.length} fotoğraf başarıyla eklendi!`, 'success');
        
    } catch (error) {
        console.error('Fotoğraf ekleme hatası:', error);
        showNotification('Fotoğraflar eklenirken bir hata oluştu!', 'error');
    }
});

// Albüm fotoğraflarını yükle
function loadAlbumPhotos(albumId) {
    const album = albums[albumId];
    const photosGrid = document.getElementById('albumPhotos');
    
    if (!album.photos || album.photos.length === 0) {
        photosGrid.innerHTML = '<p class="no-photos">Bu albümde henüz fotoğraf yok.</p>';
        return;
    }
    
    photosGrid.innerHTML = album.photos.map(photo => `
        <div class="photo-item">
            <img src="${photo.url}" alt="${photo.title}">
            <div class="photo-overlay">
                <h3>${photo.title}</h3>
                <div class="photo-actions">
                    <button onclick="deletePhoto('${albumId}', '${photo.id}')" class="btn-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Fotoğraf sil
function deletePhoto(albumId, photoId) {
    if (confirm('Bu fotoğrafı silmek istediğinizden emin misiniz?')) {
        const album = albums[albumId];
        album.photos = album.photos.filter(photo => photo.id !== photoId);
        saveAlbums();
        loadAlbumPhotos(albumId);
        showNotification('Fotoğraf başarıyla silindi!', 'success');
    }
}

// Albüm detaylarını göster
function showAlbumDetails(albumId) {
    currentAlbumId = albumId; // Seçili albüm ID'sini güncelle
    const album = albums[albumId];
    
    // Modal başlığını güncelle
    document.getElementById('albumTitle').textContent = album.title;
    document.getElementById('albumCategory').textContent = album.category;
    document.getElementById('photoCount').textContent = album.photos ? album.photos.length : 0;
    
    // Fotoğrafları yükle
    loadAlbumPhotos(albumId);
    
    // Modalı göster
    document.getElementById('albumDetailModal').style.display = 'block';
}

// Toplu fotoğraf önizleme
function previewBulkPhotos() {
    const textarea = document.querySelector('textarea[name="photoUrls"]');
    const previewSection = document.querySelector('.preview-section');
    const previewGrid = document.querySelector('.preview-grid');
    const addButton = document.querySelector('.btn-add-photos');
    
    // URL'leri satır satır ayır ve temizle
    const urls = textarea.value
        .split('\n')
        .map(url => url.trim())
        .filter(url => url && url.startsWith('https://i.ibb.co/'));
    
    if (urls.length === 0) {
        showNotification('Geçerli ImgBB URL\'si bulunamadı!', 'error');
        addButton.disabled = true;
        return;
    }
    
    // Önizleme grid'ini oluştur
    previewGrid.innerHTML = urls.map((url, index) => `
        <div class="preview-item">
            <img src="${url}" alt="Önizleme ${index + 1}">
            <span class="preview-number">#${index + 1}</span>
        </div>
    `).join('');
    
    previewSection.style.display = 'block';
    addButton.disabled = false;
} 

// URL önizleme ve doğrulama
function previewPhotoUrl(input) {
    const url = input.value;
    const previewSection = input.closest('form').querySelector('.preview-section');
    const preview = previewSection.querySelector('.photo-preview');
    const addButton = input.closest('form').querySelector('.btn-add-photo');

    if (!url.startsWith('https://i.ibb.co/')) {
        showNotification('Lütfen geçerli bir ImgBB URL\'si girin!', 'error');
        input.classList.add('invalid');
        addButton.disabled = true;
        return;
    }

    // URL doğruysa
    input.classList.remove('invalid');
    addButton.disabled = false;

    // Önizleme göster
    preview.innerHTML = `<img src="${url}" alt="Önizleme">`;
    previewSection.style.display = 'block';
}

// URL input alanını dinle
document.querySelector('input[name="photoUrl"]').addEventListener('input', function() {
    previewPhotoUrl(this);
});

// Slayt için fotoğraf seçme modalını göster
function showPhotoPickerModal() {
    const modal = document.getElementById('photoPickerModal');
    modal.style.display = 'block';
    loadGalleryPhotos();
}

// Galerideki tüm fotoğrafları yükle
function loadGalleryPhotos() {
    const photosGrid = document.getElementById('galleryPhotosGrid');
    photosGrid.innerHTML = '';
    
    // Tüm albümlerdeki fotoğrafları al
    Object.values(albums).forEach(album => {
        album.photos.forEach(photo => {
            const photoDiv = document.createElement('div');
            photoDiv.className = 'gallery-photo-item';
            
            photoDiv.innerHTML = `
                <div class="photo-preview">
                    <img src="${photo.url}" alt="${photo.title}">
                    <div class="photo-overlay">
                        <button onclick="selectPhotoForSlide('${photo.url}', '${photo.title}')">
                            <i class="fas fa-plus"></i> Seç
                        </button>
                    </div>
                </div>
                <div class="photo-info">
                    <span>${photo.title}</span>
                </div>
            `;
            
            photosGrid.appendChild(photoDiv);
        });
    });
}

// Seçilen fotoğrafı slayta ekle
function selectPhotoForSlide(url, title) {
    // URL'i ve başlığı forma yerleştir
    document.querySelector('input[name="slideUrl"]').value = url;
    document.querySelector('input[name="slideTitle"]').value = title;
    
    // Fotoğraf seçme modalını kapat
    document.getElementById('photoPickerModal').style.display = 'none';
    
    // Başarı mesajı göster
    showNotification('Fotoğraf seçildi! Slayt eklemek için formu doldurun.', 'success');
}