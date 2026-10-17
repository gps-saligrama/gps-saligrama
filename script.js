document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Cache DOM Elements Once (Prevents Layout Thrashing) ---
  const menuToggleBtn = document.getElementById('menu-toggle-btn');
  const menuToggleIcon = document.getElementById('menu-toggle-icon');
  const fullMenuPanel = document.getElementById('full-menu-panel');
  const navItemLinks = document.querySelectorAll('.nav-item-link');

  const copyBtn = document.getElementById('copy-address-btn');
  const copyBtnText = document.getElementById('copy-btn-text');
  const copyToast = document.getElementById('copy-toast');

  const searchInput = document.getElementById('search-input');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  const topClock = document.getElementById('top-bar-clock');
  const storeClock = document.getElementById('store-ist-clock');
  const heroStatusText = document.getElementById('hero-status-sub');
  const liveBadge = document.getElementById('live-status-badge');
  const liveSubText = document.getElementById('live-status-subtext');
  const statusDayText = document.getElementById('live-status-day');
  const navTimingBadge = document.getElementById('nav-timing-badge');

  // --- 2. Smooth Navigation Toggle ---
  function toggleMenu(e) {
    if (e) e.preventDefault();
    if (!fullMenuPanel) return;

    const isOpen = fullMenuPanel.classList.toggle('open');
    if (isOpen) {
      menuToggleIcon.className = 'fa-solid fa-xmark text-2xl';
      document.body.style.overflow = 'hidden';
    } else {
      menuToggleIcon.className = 'fa-solid fa-bars text-2xl';
      document.body.style.overflow = '';
    }
  }

  function closeMenu() {
    if (!fullMenuPanel || !fullMenuPanel.classList.contains('open')) return;
    fullMenuPanel.classList.remove('open');
    menuToggleIcon.className = 'fa-solid fa-bars text-2xl';
    document.body.style.overflow = '';
  }

  if (menuToggleBtn) menuToggleBtn.addEventListener('click', toggleMenu);
  navItemLinks.forEach(link => link.addEventListener('click', closeMenu));

  // --- 3. Clipboard Copy ---
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const address = "GOPAL PUTTU SHANBHOGUE & SONS, Merchant, Opp. Shree Anjaneya Temple, Main Road, Saligrama - 576225";
      navigator.clipboard.writeText(address).then(() => {
        if (copyBtnText) copyBtnText.textContent = "Copied!";
        if (copyToast) {
          copyToast.classList.remove('opacity-0');
          setTimeout(() => {
            copyToast.classList.add('opacity-0');
            if (copyBtnText) copyBtnText.textContent = "Copy Address";
          }, 2000);
        }
      });
    });
  }

  // --- 4. Fast Catalog Filtering (Precomputed Cache) ---
  let activeFilter = 'all';
  const cardData = Array.from(productCards).map(card => ({
    element: card,
    category: card.getAttribute('data-category'),
    text: card.textContent.toLowerCase()
  }));

  function filterCatalog() {
    const term = searchInput ? searchInput.value.toLowerCase().trim() : '';

    for (let i = 0; i < cardData.length; i++) {
      const item = cardData[i];
      const matchCategory = activeFilter === 'all' || item.category === activeFilter;
      const matchSearch = term === '' || item.text.includes(term);

      if (matchCategory && matchSearch) {
        item.element.classList.remove('hidden');
      } else {
        item.element.classList.add('hidden');
      }
    }
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.className = 'filter-btn px-4 py-2 rounded-lg bg-white text-stone-700 border border-stone-200 text-xs font-semibold hover:bg-stone-50 transition cursor-pointer';
      });

      btn.className = 'filter-btn px-4 py-2 rounded-lg bg-[#0b3b24] text-white text-xs font-semibold shadow-sm transition cursor-pointer';
      activeFilter = btn.getAttribute('data-target');
      filterCatalog();
    });
  });

  // Debounced Search to eliminate keystroke lag
  let searchTimeout = null;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(filterCatalog, 50);
    });
  }

  // --- 5. High-Efficiency Store Clock & Status ---
  const daysArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let lastCheckedMinute = -1;

  function updateClockAndStatus() {
    const now = new Date();

    // Fast IST formatter without overhead
    const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istDate = new Date(istString);
    
    let hours = istDate.getHours();
    const minutes = istDate.getMinutes();
    const seconds = istDate.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${ampm} IST`;

    if (topClock) topClock.textContent = formattedTime;
    if (storeClock) storeClock.textContent = formattedTime;

    // Only recalculate business hours logic when the minute changes
    if (minutes !== lastCheckedMinute) {
      lastCheckedMinute = minutes;
      const day = istDate.getDay();
      const currentMinutes = istDate.getHours() * 60 + minutes;
      const todayName = daysArr[day];

      let isOpen = false;
      let nextScheduleText = '';

      if (day === 0) { // Sunday (7:00 AM - 1:15 PM)
        if (currentMinutes >= 420 && currentMinutes < 795) {
          isOpen = true;
          nextScheduleText = "Closes today at 1:15 PM (IST)";
        } else if (currentMinutes < 420) {
          nextScheduleText = "Opens today (Sunday) at 7:00 AM (IST)";
        } else {
          nextScheduleText = "Opens tomorrow (Monday) at 7:00 AM (IST)";
        }
      } else { // Monday - Saturday (7:00 AM - 8:30 PM)
        if (currentMinutes >= 420 && currentMinutes < 1230) {
          isOpen = true;
          nextScheduleText = "Closes today at 8:30 PM (IST)";
        } else if (currentMinutes < 420) {
          nextScheduleText = `Opens today (${todayName}) at 7:00 AM (IST)`;
        } else {
          nextScheduleText = day === 6 ? "Opens tomorrow (Sunday) at 7:00 AM (IST)" : "Opens tomorrow at 7:00 AM (IST)";
        }
      }

      if (statusDayText) statusDayText.textContent = `Today is ${todayName}`;
      if (liveSubText) liveSubText.textContent = nextScheduleText;

      if (isOpen) {
        if (liveBadge) {
          liveBadge.className = 'px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider bg-emerald-600 text-white uppercase';
          liveBadge.textContent = 'OPEN NOW';
        }
        if (navTimingBadge) {
          navTimingBadge.className = 'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-[#dcfce7] text-[#15803d]';
          navTimingBadge.textContent = 'Open Now';
        }
        if (heroStatusText) {
          heroStatusText.innerHTML = `<span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 pulse-badge-open"></span><strong class="text-emerald-700">Store Open Now</strong> • ${todayName}`;
        }
      } else {
        if (liveBadge) {
          liveBadge.className = 'px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider bg-rose-600 text-white uppercase';
          liveBadge.textContent = 'CLOSED NOW';
        }
        if (navTimingBadge) {
          navTimingBadge.className = 'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-[#fee2e2] text-[#991b1b]';
          navTimingBadge.textContent = 'Closed Now';
        }
        if (heroStatusText) {
          heroStatusText.innerHTML = `<span class="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 mr-2 pulse-badge"></span><strong class="text-rose-700">Store Closed Now</strong> • ${todayName}`;
        }
      }
    }
  }

  updateClockAndStatus();
  setInterval(updateClockAndStatus, 1000);
});