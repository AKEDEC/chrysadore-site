/* ============================================
   CHRYSA DORÉ — Interactions & Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Theme: dark mode only (no toggle)

  // ---------- Preloader ----------
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('hidden');
      }, 2200);
    });

    // Fallback: hide preloader after 4s max
    setTimeout(() => {
      preloader.classList.add('hidden');
    }, 4000);
  }

  // ---------- Custom Cursor ----------
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';

      requestAnimationFrame(() => {
        follower.style.left = e.clientX + 'px';
        follower.style.top = e.clientY + 'px';
      });
    });
  }

  // ---------- Navigation Scroll ----------
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });

  // ---------- Mobile Menu ----------
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // ---------- Scroll Animations ----------
  const animateElements = document.querySelectorAll('[data-animate]');

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger animations for siblings
        const siblings = entry.target.parentElement.querySelectorAll('[data-animate]');
        let delay = 0;
        siblings.forEach((sibling) => {
          if (sibling === entry.target) {
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, delay);
          }
          delay += 120;
        });

        // Fallback: ensure it becomes visible
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, 150);

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animateElements.forEach(el => observer.observe(el));

  // ---------- Smooth Scroll for Anchor Links ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---------- Form Handling ----------
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit span');
      const originalText = btn.textContent;
      btn.textContent = 'Merci Beaucoup!';
      form.reset();
      setTimeout(() => {
        btn.textContent = originalText;
      }, 3000);
    });
  }

  // ---------- Parallax Effect on Hero ----------
  const heroContent = document.querySelector('.hero-content');
  const heroScroll = document.querySelector('.hero-scroll');
  if (heroContent && heroScroll) {
    window.addEventListener('scroll', () => {
      if (window.scrollY < window.innerHeight) {
        const progress = window.scrollY / window.innerHeight;
        heroContent.style.transform = `translateY(${window.scrollY * 0.3}px)`;
        heroContent.style.opacity = 1 - progress;
        heroScroll.style.opacity = 1 - progress * 3;
      }
    }, { passive: true });
  }

  // ---------- Stat Counter Animation ----------
  const stats = document.querySelectorAll('.stat-number');
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent;
        const hasPlus = text.includes('+');
        const target = parseInt(text);

        if (isNaN(target)) return;

        let current = 0;
        const duration = 2000;
        const step = target / (duration / 16);

        const counter = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(counter);
          }
          el.textContent = Math.floor(current) + (hasPlus ? '+' : '');
        }, 16);

        statsObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(stat => statsObserver.observe(stat));

});
