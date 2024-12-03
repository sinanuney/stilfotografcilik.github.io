// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
});

// Videoları yükle
function loadVideos() {
    const videosList = document.querySelector('.videos-list');
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    
    videosList.innerHTML = videos.map((video, index) => `
        <div class="video-item" data-index="${index}">
            <div class="video-thumbnail">
                <img src="https://img.youtube.com/vi/${getYouTubeId(video.url)}/mqdefault.jpg" alt="${video.title}">
                <div class="video-duration"></div>
            </div>
            <div class="video-info">
                <h4 contenteditable="true" 
                    onblur="updateVideoText(${index}, 'title', this.textContent)"
                    onkeydown="handleEnterKey(event, this)">${video.title}</h4>
                <p contenteditable="true"
                    onblur="updateVideoText(${index}, 'description', this.textContent)"
                    onkeydown="handleEnterKey(event, this)">${video.description}</p>
            </div>
            <div class="video-actions">
                <button onclick="deleteVideo(${index})" title="Sil">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// YouTube URL'sinden ID çıkar
function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Video önizleme
function previewVideo(input) {
    const url = input.value;
    const videoId = getYouTubeId(url);
    const previewSection = input.closest('form').querySelector('.preview-section');
    const preview = previewSection.querySelector('.video-preview');
    
    if (!videoId) {
        showNotification('Geçerli bir YouTube URL\'si girin!', 'error');
        return;
    }
    
    preview.innerHTML = `
        <iframe width="100%" height="315" 
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;
    previewSection.style.display = 'block';
}

// Video modalını göster
function showNewVideoModal() {
    const modal = document.getElementById('newVideoModal');
    modal.style.display = 'block';
}

// Video modalını kapat
function closeVideoModal() {
    const modal = document.getElementById('newVideoModal');
    modal.style.display = 'none';
    document.getElementById('newVideoForm').reset();
    document.querySelector('.preview-section').style.display = 'none';
}

// Video ekle
document.getElementById('newVideoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const videoId = getYouTubeId(formData.get('videoUrl'));
    
    if (!videoId) {
        showNotification('Geçerli bir YouTube URL\'si girin!', 'error');
        return;
    }
    
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    
    const newVideo = {
        id: `video-${Date.now()}`,
        url: formData.get('videoUrl'),
        title: formData.get('title'),
        description: formData.get('description'),
        date: new Date().toISOString()
    };
    
    videos.push(newVideo);
    localStorage.setItem('videos', JSON.stringify(videos));
    
    loadVideos();
    closeVideoModal();
    showNotification('Video başarıyla eklendi!', 'success');
});

// Video sil
function deleteVideo(index) {
    if (confirm('Bu videoyu silmek istediğinizden emin misiniz?')) {
        const videos = JSON.parse(localStorage.getItem('videos')) || [];
        videos.splice(index, 1);
        localStorage.setItem('videos', JSON.stringify(videos));
        loadVideos();
        showNotification('Video başarıyla silindi!', 'success');
    }
} 