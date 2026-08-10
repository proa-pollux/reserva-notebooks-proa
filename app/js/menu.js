const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sideNav = document.getElementById('side-nav');
const drawerOverlay = document.getElementById('drawer-overlay');

function toggleMenu() {
    const isClosed = sideNav.classList.contains('-translate-x-full');
    if (isClosed) {
        sideNav.classList.remove('-translate-x-full');
        drawerOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    } else {
        sideNav.classList.add('-translate-x-full');
        drawerOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

mobileMenuBtn.addEventListener('click', toggleMenu);
drawerOverlay.addEventListener('click', toggleMenu);
