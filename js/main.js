/**
 * Fabulous Indeed Vacations by Angela
 * Interactive functionality: Navigation, Contact Form, Carousel & Smooth UX
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const mainNav = document.getElementById('mainNav');

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      mainNav.classList.toggle('active');
    });

    // Close mobile nav when clicking a link
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Header shadow on scroll
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
    } else {
      header.style.boxShadow = 'none';
    }
  });

  // 3. Contact Preference Radio Toggle
  const prefRadios = document.querySelectorAll('input[name="preferredContact"]');
  const toggleOptions = document.querySelectorAll('.toggle-option');
  const emailInput = document.getElementById('clientEmail');
  const phoneInput = document.getElementById('clientPhone');

  prefRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      toggleOptions.forEach(opt => opt.classList.remove('active'));
      const parentLabel = e.target.closest('.toggle-option');
      if (parentLabel) parentLabel.classList.add('active');

      if (e.target.value === 'phone') {
        phoneInput.required = true;
        phoneInput.placeholder = "Your best phone number *";
        emailInput.required = false;
        emailInput.placeholder = "Your email address (optional)";
      } else {
        emailInput.required = true;
        emailInput.placeholder = "Your email address *";
        phoneInput.required = false;
        phoneInput.placeholder = "Your phone number (optional)";
      }
    });
  });

  // 4. Contact Form Submission Handling
  //    Posts to a Google Apps Script Web App (invisible to the customer).
  //    The script logs the entry to a Google Sheet and emails Angela.
  const contactForm = document.getElementById('tripInquiryForm');
  const formFeedback = document.getElementById('formFeedback');

  // 👉 PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL BELOW
  const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxQTMEGV5h7C1yIG8-ydBdg8Dc1_e3B1PtXcC5Hq3d2GBjAS7X5cuxjNIFlqbeQrUs/exec';

  function showFeedback(ok, name) {
    if (!formFeedback) return;
    formFeedback.className = 'form-feedback ' + (ok ? 'success' : 'error');
    formFeedback.style.display = 'block';
    if (ok) {
      formFeedback.innerHTML = `
        <strong>Thank you, ${name}!</strong><br>
        Your vacation request has been received. Angela will be in touch within 24 hours
        to start dreaming up your perfect getaway.
      `;
    } else {
      formFeedback.innerHTML = `
        <strong>Something went wrong.</strong><br>
        Please try again in a moment, or call/text Angela directly at
        <a href="tel:+12086294229" style="font-weight:700;">+1-208-629-4229</a>.
      `;
    }
    formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('clientName').value.trim();
      const preferred = document.querySelector('input[name="preferredContact"]:checked')?.value || 'email';
      const email = document.getElementById('clientEmail').value.trim();
      const phone = document.getElementById('clientPhone').value.trim();
      const destination = document.getElementById('destination').value.trim();
      const timeframe = document.getElementById('timeframe').value.trim();
      const tripStyle = document.getElementById('tripStyle').value;
      const notes = document.getElementById('tripNotes').value.trim();

      // Honeypot: if a bot filled the hidden field, pretend success and drop it.
      const honeypot = document.getElementById('website_hp')?.value || '';

      // Simple validation
      if (!name) { alert('Please enter your name.'); return; }
      if (preferred === 'email' && !email) { alert('Please provide your email address.'); return; }
      if (preferred === 'phone' && !phone) { alert('Please provide your phone number.'); return; }

      const submitBtn = contactForm.querySelector('.form-submit-btn');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      try {
        if (honeypot) {
          // Bot detected — do NOT send, just show a fake success.
          contactForm.reset();
          showFeedback(true, name);
          return;
        }

        const payload = {
          name, preferred, email, phone,
          destination, timeframe, tripStyle, notes
        };

        // Use text/plain to trigger a "simple" CORS request (no preflight),
        // which Google Apps Script can handle without custom header setup.
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });

        contactForm.reset();
        showFeedback(true, name);
      } catch (err) {
        console.error('Form submission error:', err);
        showFeedback(false, name);
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send My Inquiry'; }
      }
    });
  }

  // 5. Testimonials Carousel
  const track = document.getElementById('reviewsTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');
  const carousel = document.getElementById('reviewsCarousel');

  if (track && prevBtn && nextBtn && dotsContainer) {
    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    const totalSlides = slides.length;
    let currentIndex = 0;
    let autoPlayTimer = null;

    function getVisibleCount() {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 640) return 2;
      return 1;
    }

    function getMaxIndex() {
      return Math.max(0, totalSlides - getVisibleCount());
    }

    function updateDots() {
      dotsContainer.innerHTML = '';
      const maxIdx = getMaxIndex();
      for (let i = 0; i <= maxIdx; i++) {
        const dot = document.createElement('button');
        dot.className = `carousel-dot ${i === currentIndex ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to review slide ${i + 1}`);
        dot.addEventListener('click', () => {
          goToSlide(i);
          resetAutoPlay();
        });
        dotsContainer.appendChild(dot);
      }
    }

    function updateCarousel() {
      const visibleCount = getVisibleCount();
      const maxIdx = getMaxIndex();
      if (currentIndex > maxIdx) {
        currentIndex = maxIdx;
      }

      const slideWidthPercent = 100 / visibleCount;
      track.style.transform = `translateX(-${currentIndex * slideWidthPercent}%)`;

      // Update active dot
      const dots = dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
    }

    function goToSlide(index) {
      const maxIdx = getMaxIndex();
      if (index < 0) {
        currentIndex = maxIdx;
      } else if (index > maxIdx) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }
      updateCarousel();
    }

    prevBtn.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
      resetAutoPlay();
    });

    nextBtn.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
      resetAutoPlay();
    });

    // Touch Swipe support
    let startX = 0;
    let isTouching = false;

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isTouching = true;
      stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      if (!isTouching) return;
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 45) {
        if (diff > 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1);
        }
      }
      isTouching = false;
      startAutoPlay();
    }, { passive: true });

    // Auto Play (pauses on hover)
    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(() => {
        goToSlide(currentIndex + 1);
      }, 5500);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    function resetAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    if (carousel) {
      carousel.addEventListener('mouseenter', stopAutoPlay);
      carousel.addEventListener('mouseleave', startAutoPlay);
    }

    // Responsive window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateDots();
        updateCarousel();
      }, 100);
    });

    // Initialize carousel
    updateDots();
    updateCarousel();
    startAutoPlay();
  }
});
