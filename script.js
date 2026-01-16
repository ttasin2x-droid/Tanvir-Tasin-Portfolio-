import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { apiKey: "AIzaSyDNtkM7hLeIsD2HzWxQKJFH8fsXOVKrv18", authDomain: "tanvir-gallery-free.firebaseapp.com", databaseURL: "https://tanvir-gallery-free-default-rtdb.firebaseio.com", projectId: "tanvir-gallery-free", storageBucket: "tanvir-gallery-free.firebasestorage.app", messagingSenderId: "442605910126", appId: "1:442605910126:web:b89792cb6204a5b7eb0e7f" };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- 1. PREMIUM SITE PRELOADER ---
const preloaderHTML = `<div id="site-preloader" style="position:fixed; top:0; left:0; width:100%; height:100%; background:#ffffff; z-index:99999; display:flex; flex-direction:column; justify-content:center; align-items:center; transition:opacity 0.6s ease-out;"><div class="loader-pulse"></div><div style="margin-top:20px; font-family:'Outfit', sans-serif; color:#64748b; font-size:0.9rem; letter-spacing:2px; font-weight:600; text-transform:uppercase; animation:fadeIn 1s infinite alternate;">Loading</div><style>.loader-pulse { position: relative; width: 60px; height: 60px; background: #2563eb; border-radius: 50%; animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; } .loader-pulse::after { content: ''; position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: #fff; border-radius: 50%; animation: pulse-dot 1.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite; } @keyframes pulse-ring { 0% { transform: scale(0.33); } 80%, 100% { opacity: 0; } } @keyframes pulse-dot { 0% { transform: scale(0.8); } 50% { transform: scale(1); } 100% { transform: scale(0.8); } } @keyframes fadeIn { from { opacity: 0.5; } to { opacity: 1; } }</style></div>`;
if (!document.getElementById('site-preloader')) { document.body.insertAdjacentHTML('afterbegin', preloaderHTML); }

// --- 2. PRO SCROLL PROGRESS BAR ---
const scrollBar = document.createElement('div');
scrollBar.id = 'pro-scroll-bar';
Object.assign(scrollBar.style, { position: 'fixed', top: '0', left: '0', height: '4px', background: 'linear-gradient(90deg, #2563eb, #ec4899)', zIndex: '9999', width: '0%', transition: 'width 0.1s' });
document.body.appendChild(scrollBar);
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    scrollBar.style.width = scrolled + "%";
});

// --- 3. ADVANCED VISITOR TRACKING (Location + Device) ---
if (!localStorage.getItem('admin_bypass')) {
    const visitRef = ref(db, 'site_stats/visits');
    // Count Total Visits
    runTransaction(visitRef, (currentVisits) => {
        return (currentVisits || 0) + 1;
    });

    // === NEW: Location & Detailed Device Info ===
    // Only logs once per session to avoid duplicates on refresh
    if (!sessionStorage.getItem('logged_device')) {
        // Fetch Location Data from Free API
        fetch('https://ipapi.co/json/')
            .then(response => response.json())
            .then(data => {
                const ua = navigator.userAgent;
                let deviceType = "Desktop";
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
                    deviceType = "Mobile";
                }

                push(ref(db, 'visit_logs'), {
                    // Location Info
                    ip: data.ip || 'Unknown',
                    city: data.city || 'Unknown City',
                    country: data.country_name || 'Unknown Country',
                    country_code: data.country_code ? data.country_code.toLowerCase() : 'bd',
                    org: data.org || 'Unknown ISP',
                    
                    // Device Info
                    device_type: deviceType,
                    raw_agent: ua, // Full string for Admin parsing
                    time: new Date().toLocaleString()
                });
                sessionStorage.setItem('logged_device', 'true');
            })
            .catch(error => {
                // Fallback if API fails (e.g. adblocker)
                console.log("Location fetch failed, logging basic info.");
                push(ref(db, 'visit_logs'), {
                    city: 'Unknown', 
                    country: 'Unknown',
                    raw_agent: navigator.userAgent,
                    time: new Date().toLocaleString()
                });
                sessionStorage.setItem('logged_device', 'true');
            });
    }
}

// --- MAINTENANCE MODE ---
let maintenanceInterval; 
onValue(ref(db, 'site_status'), (snapshot) => {
    const data = snapshot.val();
    if (maintenanceInterval) clearInterval(maintenanceInterval);
    const isAdminBypass = localStorage.getItem('admin_bypass') === 'true';

    if (data && data.isLive === false && !isAdminBypass) {
        const pl = document.getElementById('site-preloader'); if(pl) pl.remove();

        const reason = data.reason || "System Upgrade";
        const descText = data.desc ? data.desc : "We are currently improving our systems.";
        let retTime = data.returnTime;
        let isTimer = typeof retTime === 'number';
        if (!retTime && !isTimer) retTime = "Shortly";
        const showContact = data.showContact === undefined ? true : data.showContact;

        const socialHTML = showContact ? `<div class="m-socials"><a href="https://www.facebook.com/tanvir.tasin.940" target="_blank" class="m-link fb"><i class="fab fa-facebook"></i></a><a href="https://www.instagram.com/tanvir_tasin1/" target="_blank" class="m-link insta"><i class="fab fa-instagram"></i></a><a href="https://wa.me/+8801533327033" target="_blank" class="m-link wa"><i class="fab fa-whatsapp"></i></a></div>` : '';
        const footerText = showContact ? "Improving experience. Connect below." : "Improving experience. Back soon.";

        document.body.innerHTML = `
            <style>@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;800&display=swap'); body { margin: 0; padding: 0; background: #ffffff; font-family: 'Outfit', sans-serif; height: 100vh; width: 100vw; display: flex; flex-direction: column; justify-content: center; align-items: center; overflow: hidden; position: relative; color: #1e293b; } .blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.6; animation: floatBlob 10s infinite alternate cubic-bezier(0.4, 0, 0.2, 1); z-index: 0; } .b1 { width: 600px; height: 600px; background: #c084fc; top: -10%; left: -10%; animation-delay: 0s; opacity: 0.4; } .b2 { width: 500px; height: 500px; background: #60a5fa; bottom: -10%; right: -10%; animation-delay: -2s; opacity: 0.5; } .b3 { width: 400px; height: 400px; background: #f472b6; top: 40%; left: 40%; animation-delay: -4s; opacity: 0.3; } @keyframes floatBlob { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(40px, -60px) scale(1.1); } } .content-wrapper { z-index: 10; text-align: center; padding: 20px; max-width: 800px; } .icon-main { font-size: 4rem; margin-bottom: 10px; background: linear-gradient(135deg, #6366f1, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 10px 20px rgba(99, 102, 241, 0.2)); animation: bounceIcon 3s ease-in-out infinite; } h1 { font-size: 4rem; margin: 0 0 10px; font-weight: 800; color: #0f172a; letter-spacing: -2px; line-height: 1; background: linear-gradient(135deg, #0f172a 0%, #334155 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; } .sub-desc { font-size: 1.1rem; color: #475569; margin-bottom: 30px; font-weight: 300; max-width: 600px; margin-left: auto; margin-right: auto; } .status-msg { color: #64748b; font-size: 1rem; font-weight: 500; margin-bottom: 40px; letter-spacing: 0.5px; } .time-badge { background: rgba(255, 255, 255, 0.6); border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 10px 40px -10px rgba(99, 102, 241, 0.15); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); padding: 15px 40px; border-radius: 100px; display: inline-flex; flex-direction: column; align-items: center; margin-bottom: 30px; } .tb-label { color: #6366f1; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; } .tb-val { color: #1e293b; font-size: 1.8rem; font-weight: 800; font-variant-numeric: tabular-nums; } .progress-wrapper { width: 180px; height: 5px; background: rgba(0,0,0,0.05); border-radius: 10px; overflow: hidden; margin: 0 auto; } .progress-bar { width: 50%; height: 100%; background: linear-gradient(90deg, #6366f1, #ec4899); animation: loading 1.5s ease-in-out infinite; } .m-socials { margin-top: 40px; display: flex; justify-content: center; gap: 25px; } .m-link { font-size: 1.6rem; color: #94a3b8; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05); } .m-link:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); color: white; } .fb:hover { background: #1877f2; } .insta:hover { background: #E1306C; } .wa:hover { background: #25D366; } #weather-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; } .snowflake { position: absolute; top: -20px; color: #cbd5e1; user-select: none; pointer-events: none; animation-name: fall, sway; animation-iteration-count: infinite, infinite; filter: blur(1px); } @keyframes bounceIcon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } } @keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } } @keyframes fall { 0% { top: -10%; opacity: 0; } 20% { opacity: 1; } 100% { top: 110%; opacity: 0.3; } } @keyframes sway { 0% { transform: translateX(0px); } 50% { transform: translateX(25px); } 100% { transform: translateX(0px); } } @media (max-width: 600px) { h1 { font-size: 2.5rem; } .tb-val { font-size: 1.4rem; } }</style>
            <div id="weather-container"></div><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
            <div class="content-wrapper">
                <div class="icon-main"><i class="fas fa-layer-group"></i></div>
                <h1>${reason}</h1>
                <p class="sub-desc">${descText}</p>
                <div class="time-badge"><span class="tb-label">${isTimer ? 'Time Remaining' : 'Expected Return'}</span><span class="tb-val" id="timerDisplay">${isTimer ? 'Calculating...' : retTime}</span></div>
                <div class="progress-wrapper"><div class="progress-bar"></div></div><p class="status-msg" style="margin-top: 20px;">${footerText}</p>${socialHTML}
            </div>`;
        
        if (!document.querySelector('link[href*="font-awesome"]')) { const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'; document.head.appendChild(link); }
        createSoftSnowfall();
        if (isTimer) {
            const updateTimer = () => {
                const distance = retTime - new Date().getTime();
                if (distance < 0) { document.getElementById("timerDisplay").innerHTML = "Ready Soon"; clearInterval(maintenanceInterval); }
                else {
                    const h = Math.floor((distance % (86400000)) / 3600000); const m = Math.floor((distance % 3600000) / 60000); const s = Math.floor((distance % 60000) / 1000);
                    document.getElementById("timerDisplay").innerHTML = `${h<10?'0'+h:h} : ${m<10?'0'+m:m} : ${s<10?'0'+s:s}`;
                }
            };
            updateTimer(); maintenanceInterval = setInterval(updateTimer, 1000);
        }
    }
});

// --- DYNAMIC SITE CONTENT ---
onValue(ref(db, 'site_content'), (snap) => {
    const d = snap.val();
    if(d) {
        const setTxt = (id, val) => { const el = document.getElementById(id); if(el && val) el.innerText = val; };
        const setHref = (id, val) => { const el = document.getElementById(id); if(el && val) el.href = val; };
        if(d.hero) { setTxt('heroSubtitle', d.hero.subtitle); setTxt('heroTitle', d.hero.title); setTxt('heroDesc', d.hero.desc); }
        if(d.about) { setTxt('aboutTitle', d.about.title); setTxt('aboutSubtitle', d.about.subtitle); setTxt('aboutDesc', d.about.desc); setTxt('aboutLoc', d.about.location); setTxt('aboutPhone', d.about.phone); setTxt('aboutEmail', d.about.email); }
        if(d.links) { setHref('linkFB', d.links.fb); setHref('linkInsta', d.links.insta); setHref('linkWA', d.links.wa); }
    }
});

// --- STANDARD FEATURES ---
onValue(ref(db, 'hero'), (snap) => { if(snap.val()?.imageUrl) document.getElementById('dynamicHeroImg').src = snap.val().imageUrl; });
onValue(ref(db, 'profile'), (snap) => { if(snap.val()?.imageUrl) document.getElementById('dynamicProfileImg').src = snap.val().imageUrl; });
const galleryGrid = document.getElementById('galleryGrid');
if(galleryGrid) { onValue(ref(db, 'home_works'), (snap) => { const data = snap.val(); galleryGrid.innerHTML = ""; if(data) { const images = Object.values(data).reverse(); images.forEach((item, index) => { const div = document.createElement('div'); div.className = "gallery-item"; div.setAttribute('data-aos', 'fade-up'); div.setAttribute('data-aos-delay', (index % 4) * 150); div.setAttribute('onclick', `window.openLightboxFromURL('${item.url}')`); div.innerHTML = `<img src="${item.url}" loading="lazy"><div class="overlay"><i class="fas fa-expand"></i></div>`; galleryGrid.appendChild(div); }); initGalleryLogic(); setTimeout(() => { if(typeof AOS !== 'undefined') AOS.refreshHard(); }, 600); } }); }
const sdgGrid = document.getElementById('sdgGrid');
if(sdgGrid) { onValue(ref(db, 'sdgs'), (snap) => { const data = snap.val(); sdgGrid.innerHTML = ""; if(data) Object.values(data).reverse().forEach((item, index) => { sdgGrid.innerHTML += ` <a href="${item.link}" target="_blank" class="sdg-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}"> <div class="sdg-img"><img src="${item.image}"></div> <div class="sdg-text"><h3>${item.title}</h3></div> </a>`; }); }); }
window.openLightboxFromURL = (url) => { const lb = document.getElementById('lightbox'); document.getElementById('lightbox-img').src = url; lb.classList.add('active'); document.body.style.overflow = 'hidden'; }
window.openModal = (modalId) => { document.getElementById(modalId).style.display = 'flex'; }
window.closeModal = (event, modalId) => { if (event.target.id === modalId || event.target.tagName === 'BUTTON') { document.getElementById(modalId).style.display = 'none'; } }
const initialCount = 4; let visibleCount = initialCount;
function initGalleryLogic() { const items = document.querySelectorAll('.gallery-item'); const moreBtn = document.getElementById("view-more-btn"); for (let i = 0; i < items.length; i++) { if (i < initialCount) items[i].classList.add('visible'); } if(items.length > initialCount && moreBtn) moreBtn.style.display = 'inline-flex'; }
window.initGalleryLogic = initGalleryLogic;
window.loadMoreImages = () => { const items = document.querySelectorAll('.gallery-item'); let end = visibleCount + 4; let delay = 0; for (let i = visibleCount; i < end && i < items.length; i++) { items[i].removeAttribute('data-aos'); items[i].removeAttribute('data-aos-delay'); setTimeout(() => { items[i].classList.add('visible'); items[i].classList.add('animate-custom'); }, delay); delay += 150; } visibleCount = end; const moreBtn = document.getElementById("view-more-btn"); const lessBtn = document.getElementById("view-less-btn"); if (visibleCount >= items.length) moreBtn.style.display = 'none'; lessBtn.style.display = 'inline-flex'; }
window.viewLessImages = () => { const items = document.querySelectorAll('.gallery-item'); for (let i = initialCount; i < items.length; i++) { items[i].classList.remove('visible'); items[i].classList.remove('animate-custom'); } visibleCount = initialCount; document.getElementById("view-more-btn").style.display = 'inline-flex'; document.getElementById("view-less-btn").style.display = 'none'; document.getElementById('my-works').scrollIntoView({behavior: 'smooth'}); }
window.goToPage = (url) => { document.getElementById('pageTransition').classList.add('active'); setTimeout(() => { window.location.href = url; }, 500); }
window.closeLightbox = (event) => { if (event.target.id === 'lightbox' || event.target.tagName === 'I') { document.getElementById('lightbox').classList.remove('active'); document.body.style.overflow = 'auto'; } }
window.scrollToTop = () => { window.scrollTo({top: 0, behavior: 'smooth'}); }

window.onload = function() { 
    createSoftSnowfall(); 
    if(typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true }); 

    const loader = document.getElementById('site-preloader');
    if(loader) { loader.style.opacity = '0'; setTimeout(() => loader.remove(), 600); }
};

window.onscroll = function() { const btn = document.getElementById("backToTop"); if(btn) btn.style.display = (window.scrollY > 300) ? "flex" : "none"; };
function createSoftSnowfall() { const container = document.getElementById('weather-container'); if(!container) return; for (let i = 0; i < 35; i++) { const flake = document.createElement('div'); flake.classList.add('snowflake'); flake.innerHTML = '❄'; flake.style.left = Math.random() * 100 + 'vw'; flake.style.animationDuration = `${Math.random() * 10 + 5}s, ${Math.random() * 4 + 3}s`; flake.style.animationDelay = Math.random() * 5 + 's'; container.appendChild(flake); } setTimeout(() => { container.style.opacity = '0'; }, 6000); }