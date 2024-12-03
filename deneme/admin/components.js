// Admin sidebar bileşenini oluşturan fonksiyon
function createAdminSidebar() {
    const currentPage = window.location.pathname.split('/').pop().split('.')[0];
    
    const sidebarHTML = `
        <div class="admin-logo">
            <img src="../images/logo.svg" alt="Logo">
            <span>Admin Panel</span>
        </div>
        <ul class="admin-menu">
            <li class="${currentPage === 'gallery' ? 'active' : ''}">
                <a href="gallery.html"><i class="fas fa-images"></i> Galeri Yönetimi</a>
            </li>
            <li class="${currentPage === 'videos' ? 'active' : ''}">
                <a href="videos.html"><i class="fas fa-video"></i> Video Yönetimi</a>
            </li>
            <li class="${currentPage === 'slideshow' ? 'active' : ''}">
                <a href="slideshow.html"><i class="fas fa-play"></i> Slideshow Yönetimi</a>
            </li>
            <li class="${currentPage === 'drive' ? 'active' : ''}">
                <a href="drive.html"><i class="fab fa-google-drive"></i> Drive Yönetimi</a>
            </li>
            <li>
                <a href="../index.html"><i class="fas fa-arrow-left"></i> Siteye Dön</a>
            </li>
        </ul>
    `;

    document.querySelector('.admin-sidebar').innerHTML = sidebarHTML;
}

// Sayfa yüklendiğinde sidebar'ı oluştur
document.addEventListener('DOMContentLoaded', createAdminSidebar); 