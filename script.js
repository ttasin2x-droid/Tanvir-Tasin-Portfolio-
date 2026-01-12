import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyDNtkM7hLeIsD2HzWxQKJFH8fsXOVKrv18",
    authDomain: "tanvir-gallery-free.firebaseapp.com",
    databaseURL: "https://tanvir-gallery-free-default-rtdb.firebaseio.com",
    projectId: "tanvir-gallery-free",
    storageBucket: "tanvir-gallery-free.firebasestorage.app",
    messagingSenderId: "442605910126",
    appId: "1:442605910126:web:b89792cb6204a5b7eb0e7f"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- DYNAMIC CONTENT LOADING ---

// 1. Dynamic Hero & Profile
onValue(ref(db, 'hero'), (snap) => { if(snap.val()?.imageUrl) document.getElementById('dynamicHeroImg').src = snap.val().imageUrl; });
onValue(ref(db, 'profile'), (snap) => { if(snap.val()?.imageUrl) document.getElementById('dynamicProfileImg').src = snap.val().imageUrl; });

// 2. Home Works
const galleryGrid = document.getElementById('galleryGrid');
onValue(ref(db, 'home_works'), (snap) => {
    const data = snap.val();
    galleryGrid.innerHTML = "";
    if(data) {
        const images = Object.values(data).reverse();
        images.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = "gallery-item"; 
            
            // AOS settings
            div.setAttribute('data-aos', 'fade-up');
            div.setAttribute('data-aos-delay', (index % 4) * 150); 
            
            div.setAttribute('onclick', `window.openLightboxFromURL('${item.url}')`);
            div.innerHTML = `<img src="${item.url}" loading="lazy"><div class="overlay"><i class="fas fa-expand"></i></div>`;
            galleryGrid.appendChild(div);
        });
        initGalleryLogic();
        // Refresh AOS to catch new elements
        setTimeout(() => { if(typeof AOS !== 'undefined') AOS.refreshHard(); }, 600);
    }
});

// 3. Dynamic SDGs
const sdgGrid = document.getElementById('sdgGrid');
onValue(ref(db, 'sdgs'), (snap) => {
    const data = snap.val();
    sdgGrid.innerHTML = "";
    if(data) Object.values(data).reverse().forEach((item, index) => {
        sdgGrid.innerHTML += `
            <a href="${item.link}" target="_blank" class="sdg-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
                <div class="sdg-img"><img src="${item.image}"></div>
                <div class="sdg-text"><h3>${item.title}</h3></div>
            </a>`;
    });
});

// --- UI LOGIC & FUNCTIONS ---

window.openLightboxFromURL = (url) => {
    const lb = document.getElementById('lightbox');
    document.getElementById('lightbox-img').src = url;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
}

window.openModal = (modalId) => { 
    document.getElementById(modalId).style.display = 'flex'; 
}

window.closeModal = (event, modalId) => { 
    if (event.target.id === modalId || event.target.tagName === 'BUTTON') {
        document.getElementById(modalId).style.display = 'none'; 
    }
}

const initialCount = 4;
let visibleCount = initialCount;

function initGalleryLogic() {
    const items = document.querySelectorAll('.gallery-item');
    const moreBtn = document.getElementById("view-more-btn");
    for (let i = 0; i < items.length; i++) { if (i < initialCount) items[i].classList.add('visible'); }
    if(items.length > initialCount && moreBtn) moreBtn.style.display = 'inline-flex';
}
window.initGalleryLogic = initGalleryLogic;

// --- FIXED LOAD MORE FUNCTION ---
window.loadMoreImages = () => {
    const items = document.querySelectorAll('.gallery-item');
    let end = visibleCount + 4;
    let delay = 0;
    
    for (let i = visibleCount; i < end && i < items.length; i++) {
        // FIX: Remove AOS attribute to prevent conflict with custom animation
        items[i].removeAttribute('data-aos');
        items[i].removeAttribute('data-aos-delay'); // Also remove delay to be safe
        
        setTimeout(() => {
            items[i].classList.add('visible');
            items[i].classList.add('animate-custom');
        }, delay);
        delay += 150;
    }
    
    visibleCount = end;
    const moreBtn = document.getElementById("view-more-btn");
    const lessBtn = document.getElementById("view-less-btn");
    
    if (visibleCount >= items.length) moreBtn.style.display = 'none';
    lessBtn.style.display = 'inline-flex';
}

window.viewLessImages = () => {
    const items = document.querySelectorAll('.gallery-item');
    for (let i = initialCount; i < items.length; i++) {
        items[i].classList.remove('visible');
        items[i].classList.remove('animate-custom');
        // Optional: Re-add AOS if needed, but not strictly necessary for hidden items
    }
    visibleCount = initialCount;
    document.getElementById("view-more-btn").style.display = 'inline-flex';
    document.getElementById("view-less-btn").style.display = 'none';
    document.getElementById('my-works').scrollIntoView({behavior: 'smooth'});
}

window.goToPage = (url) => { 
    document.getElementById('pageTransition').classList.add('active'); 
    setTimeout(() => { window.location.href = url; }, 500); 
}

window.closeLightbox = (event) => { 
    if (event.target.id === 'lightbox' || event.target.tagName === 'I') { 
        document.getElementById('lightbox').classList.remove('active'); 
        document.body.style.overflow = 'auto'; 
    } 
}

window.scrollToTop = () => { 
    window.scrollTo({top: 0, behavior: 'smooth'}); 
}

// --- INITIALIZATION ---
window.onload = function() { 
    createSoftSnowfall(); 
    if(typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true }); 
};

window.onscroll = function() { 
    const btn = document.getElementById("backToTop"); 
    if(btn) btn.style.display = (window.scrollY > 300) ? "flex" : "none"; 
};

function createSoftSnowfall() {
    const container = document.getElementById('weather-container');
    if(!container) return;
    for (let i = 0; i < 35; i++) {
        const flake = document.createElement('div');
        flake.classList.add('snowflake'); flake.innerHTML = '❄';
        flake.style.left = Math.random() * 100 + 'vw';
        flake.style.animationDuration = `${Math.random() * 10 + 5}s, ${Math.random() * 4 + 3}s`;
        flake.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(flake);
    }
    setTimeout(() => { container.style.opacity = '0'; }, 6000);
}
