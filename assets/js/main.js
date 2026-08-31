(function(){
  "use strict";

  // Mobile nav toggle
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  if (toggle && header) {
    toggle.addEventListener("click", function(){
      header.classList.toggle("nav-open");
    });
    document.querySelectorAll(".nav a").forEach(function(link){
      link.addEventListener("click", function(){ header.classList.remove("nav-open"); });
    });
  }

  // Missing-image graceful fallback: label the placeholder instead of a broken icon
  document.querySelectorAll(".img-frame img").forEach(function(img){
    var frame = img.closest(".img-frame");
    var label = frame ? frame.getAttribute("data-label") : "";
    function markMissing(){ if (frame) frame.classList.add("img-missing"); }
    if (img.complete && img.naturalWidth === 0) { markMissing(); }
    img.addEventListener("error", markMissing);
  });

  // Animated stat counters
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var seen = new WeakSet();
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (!entry.isIntersecting || seen.has(entry.target)) return;
        seen.add(entry.target);
        var el = entry.target;
        var target = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "";
        var duration = 1400;
        var start = null;
        function step(ts){
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var value = Math.round(target * eased);
          el.textContent = value.toLocaleString("en-IN") + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    counters.forEach(function(el){ io.observe(el); });
  }

  // Contact form -> Email submission to pcncommunicationpvtltd@proton.me
  var form = document.getElementById("enquiry-form");
  if (form) {
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var name = form.querySelector("#f-name").value.trim();
      var phone = form.querySelector("#f-phone") ? form.querySelector("#f-phone").value.trim() : "";
      var email = form.querySelector("#f-email") ? form.querySelector("#f-email").value.trim() : "";
      var interest = form.querySelector("#f-interest") ? form.querySelector("#f-interest").value : "General Telecom Enquiry";
      var message = form.querySelector("#f-message") ? form.querySelector("#f-message").value.trim() : "";

      var targetEmail = "pcncommunicationpvtltd@proton.me";
      var subject = encodeURIComponent("Website Enquiry: " + interest + " - " + name);
      var body = encodeURIComponent(
        "Hello PCNC Team,\n\n" +
        "You have received a new enquiry via the PCNC website:\n\n" +
        "Full Name: " + name + "\n" +
        "Phone Number: " + phone + "\n" +
        (email ? "Email: " + email + "\n" : "") +
        "Service Interest: " + interest + "\n" +
        "Message / Location Details:\n" + (message || "None provided") + "\n\n" +
        "-----------------------------------------\n" +
        "Sent from PCNC Website Contact Form"
      );

      window.location.href = "mailto:" + targetEmail + "?subject=" + subject + "&body=" + body;
    });
  }

  // Right-sliding Testimonial Carousel
  var track = document.getElementById("testiTrack");
  var prevBtn = document.getElementById("testiPrev");
  var nextBtn = document.getElementById("testiNext");
  var dotsContainer = document.getElementById("testiDots");
  if (track) {
    var cards = track.querySelectorAll(".testi-card");
    var totalCards = cards.length;
    var currentIndex = 0;

    function getVisibleCount(){
      if (window.innerWidth <= 640) return 1;
      if (window.innerWidth <= 960) return 2;
      return 3;
    }

    function getMaxIndex(){
      return Math.max(0, totalCards - getVisibleCount());
    }

    function updateDots(){
      if (!dotsContainer) return;
      dotsContainer.innerHTML = "";
      var max = getMaxIndex();
      for (var i = 0; i <= max; i++) {
        var dot = document.createElement("span");
        dot.className = "testi-dot" + (i === currentIndex ? " active" : "");
        (function(idx){
          dot.addEventListener("click", function(){
            currentIndex = idx;
            slide();
          });
        })(i);
        dotsContainer.appendChild(dot);
      }
    }

    function slide(){
      var max = getMaxIndex();
      if (currentIndex > max) currentIndex = 0;
      if (currentIndex < 0) currentIndex = max;
      var cardWidth = cards[0] ? (cards[0].offsetWidth + 24) : 320;
      track.style.transform = "translateX(-" + (currentIndex * cardWidth) + "px)";
      updateDots();
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function(){
        currentIndex++;
        if (currentIndex > getMaxIndex()) currentIndex = 0;
        slide();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function(){
        currentIndex--;
        if (currentIndex < 0) currentIndex = getMaxIndex();
        slide();
      });
    }

    var autoSlide = setInterval(function(){
      currentIndex++;
      if (currentIndex > getMaxIndex()) currentIndex = 0;
      slide();
    }, 4500);

    track.addEventListener("mouseenter", function(){ clearInterval(autoSlide); });
    track.addEventListener("mouseleave", function(){
      clearInterval(autoSlide);
      autoSlide = setInterval(function(){
        currentIndex++;
        if (currentIndex > getMaxIndex()) currentIndex = 0;
        slide();
      }, 4500);
    });

    window.addEventListener("resize", function(){ slide(); });
    updateDots();
  }

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Sticky header shadow once the page has scrolled
  (function () {
    if (!header) return;
    function onScroll() {
      if (window.scrollY > 8) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    }
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();

  // Scroll-reveal: fade + rise repeating cards and section intros into view
  var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    var revealSelectors = [
      ".svc-card", ".mv-card", ".district-card", ".eco-card", ".support-card",
      ".testi-card", ".equip-card", ".team-card", ".pricing-card", ".icon2-card",
      ".expertise-item", ".t-row", ".stat2-card", ".lead-card"
    ];
    var revealGroups = document.querySelectorAll(revealSelectors.join(","));
    revealGroups.forEach(function (el, i) {
      el.setAttribute("data-reveal", "");
      el.style.animationDelay = (i % 3) * 90 + "ms";
    });

    var revealBlocks = document.querySelectorAll(
      ".section-top, .split-copy, .split-media, .founder-wrap, .stat-float, .cta-banner, .form-card, .contact-info-list"
    );
    revealBlocks.forEach(function (el) { el.setAttribute("data-reveal", ""); });

    var revealIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealIO.unobserve(entry.target);
          }
        });
      },
      // threshold 0 + generous rootMargin: catches elements even on a fast/jumpy
      // scroll, where a stricter threshold could skip past the visible window
      { threshold: 0, rootMargin: "150px 0px 150px 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach(function (el) { revealIO.observe(el); });

    // Safety net: force-reveal anything still hidden after scrolling stops or on load,
    // so a very fast scroll (or an observer that never fires) never leaves content stuck invisible.
    function catchUpReveal() {
      document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight + 300 && r.bottom > -300) {
          el.classList.add("is-visible");
          revealIO.unobserve(el);
        }
      });
    }
    var catchUpTimer;
    document.addEventListener(
      "scroll",
      function () {
        clearTimeout(catchUpTimer);
        catchUpTimer = setTimeout(catchUpReveal, 200);
      },
      { passive: true }
    );
    window.addEventListener("load", catchUpReveal);
  }

  // Live coverage map (Leaflet + OpenStreetMap, no API key required)
  var DISTRICTS = [
    { name: "Darjeeling", lat: 27.041, lng: 88.264 },
    { name: "Jalpaiguri", lat: 26.541, lng: 88.729 },
    { name: "Cooch Behar", lat: 26.322, lng: 89.446 },
    { name: "Uttar Dinajpur", lat: 25.617, lng: 88.125, hq: true },
    { name: "Dakshin Dinajpur", lat: 25.215, lng: 88.761 },
    { name: "Malda", lat: 25.002, lng: 88.141 }
  ];

  function buildPinIcon(isHq) {
    return L.divIcon({
      className: "",
      html: '<span class="map-pin-icon' + (isHq ? " hq" : "") + '"></span>',
      iconSize: isHq ? [20, 20] : [16, 16],
      iconAnchor: isHq ? [10, 20] : [8, 16],
      popupAnchor: [0, -16]
    });
  }

  function initLiveMap(elId) {
    var el = document.getElementById(elId);
    if (!el || typeof L === "undefined") return;
    var map = L.map(elId, { scrollWheelZoom: false }).setView([26.0, 88.5], 8);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    DISTRICTS.forEach(function (d) {
      // shaded zone so the map reads as "coverage area", not just a point
      L.circle([d.lat, d.lng], {
        radius: d.hq ? 26000 : 20000,
        color: d.hq ? "#188a4f" : "#f2892e",
        weight: 1.5,
        opacity: 0.55,
        fillColor: d.hq ? "#1fa15c" : "#f2892e",
        fillOpacity: 0.16
      }).addTo(map);
      L.marker([d.lat, d.lng], { icon: buildPinIcon(!!d.hq) })
        .addTo(map)
        .bindPopup("<strong>" + d.name + "</strong>" + (d.hq ? "Head office &amp; primary fiber hub" : "Served by PCNC &amp; local ANPs"));
    });
  }

  initLiveMap("home-map");
  initLiveMap("coverage-map-full");

  // Hero section slow, ambient 3D Cyber Mesh Canvas
  var heroCanvas = document.getElementById("hero-telecom-canvas");
  if (heroCanvas) {
    (function () {
      var ctx = heroCanvas.getContext("2d");
      var heroSec = heroCanvas.closest(".hero");
      var dpr = window.devicePixelRatio || 1;
      var w, h;
      var isVisible = true;
      var mouse = { x: -999, y: -999, active: false };

      function resize() {
        if (!heroSec) return;
        var rect = heroSec.getBoundingClientRect();
        w = rect.width;
        h = rect.height;
        heroCanvas.width = w * dpr;
        heroCanvas.height = h * dpr;
        ctx.scale(dpr, dpr);
      }
      window.addEventListener("resize", resize, { passive: true });
      resize();

      if (heroSec) {
        heroSec.addEventListener("mousemove", function (e) {
          var rect = heroSec.getBoundingClientRect();
          mouse.x = e.clientX - rect.left;
          mouse.y = e.clientY - rect.top;
          mouse.active = true;
        }, { passive: true });
        heroSec.addEventListener("mouseleave", function () {
          mouse.active = false;
        });
      }

      if ("IntersectionObserver" in window && heroSec) {
        var io = new IntersectionObserver(function (entries) {
          isVisible = entries[0].isIntersecting;
          if (isVisible) requestAnimationFrame(draw);
        }, { threshold: 0.1 });
        io.observe(heroSec);
      }

      // 3D Grid structure
      var COLS = 20;
      var ROWS = 12;
      var grid = [];
      for (var r = 0; r < ROWS; r++) {
        var row = [];
        var z = 1.1 + (r / ROWS) * 2.8;
        for (var c = 0; c < COLS; c++) {
          row.push({
            xNorm: (c / (COLS - 1) - 0.5) * 2.4,
            z: z,
            r: r,
            c: c,
            phase: Math.sin(c * 1.5 + r * 2.2) * Math.PI
          });
        }
        grid.push(row);
      }

      function draw(ts) {
        if (!isVisible) return;
        ctx.clearRect(0, 0, w, h);

        // Gentle but clearly-perceptible time progression, reads as a moving video, not a static image
        var time = ts * 0.00095;

        var proj = [];
        for (var r = 0; r < ROWS; r++) {
          var projRow = [];
          for (var c = 0; c < COLS; c++) {
            var n = grid[r][c];
            // Gentle, slow undulating 3D wave height
            var waveH = Math.sin(time + c * 0.32 + r * 0.38) * 0.10 +
                        Math.cos(time * 0.5 - c * 0.18 + r * 0.25) * 0.05;

            var z = n.z;
            var x3d = n.xNorm * z * (w * 0.42);
            var y3d = (0.28 + waveH) * (h * 0.45);

            var sx = w * 0.5 + x3d / z;
            var sy = h * 0.62 + y3d / z;
            var df = Math.max(0.12, Math.min(1.0, 1.0 - (z - 1.1) / 2.8));

            // Mouse ripple
            if (mouse.active) {
              var mdx = sx - mouse.x;
              var mdy = sy - mouse.y;
              var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
              if (mdist < 140) {
                var mFactor = (1 - mdist / 140) * 14;
                sy -= mFactor;
              }
            }

            projRow.push({
              sx: sx,
              sy: sy,
              df: df,
              phase: n.phase,
              r: r,
              c: c
            });
          }
          proj.push(projRow);
        }

        // Draw mesh lines from back to front with steady, smooth alpha
        for (var r = ROWS - 1; r >= 0; r--) {
          for (var c = 0; c < COLS; c++) {
            var p1 = proj[r][c];
            var df = p1.df;

            if (c < COLS - 1) {
              var p2 = proj[r][c + 1];
              var alpha = Math.max(0.06, 0.38 * df);
              ctx.beginPath();
              ctx.strokeStyle = "rgba(0, 220, 255, " + alpha + ")";
              ctx.lineWidth = Math.max(0.7, 1.3 * df);
              ctx.moveTo(p1.sx, p1.sy);
              ctx.lineTo(p2.sx, p2.sy);
              ctx.stroke();
            }

            if (r < ROWS - 1) {
              var p3 = proj[r + 1][c];
              var alpha2 = Math.max(0.05, 0.34 * df);
              ctx.beginPath();
              ctx.strokeStyle = "rgba(45, 212, 191, " + alpha2 + ")";
              ctx.lineWidth = Math.max(0.7, 1.3 * df);
              ctx.moveTo(p1.sx, p1.sy);
              ctx.lineTo(p3.sx, p3.sy);
              ctx.stroke();
            }

            // Diagonal mesh link
            if (r < ROWS - 1 && c < COLS - 1) {
              var p4 = proj[r + 1][c + 1];
              var alpha3 = 0.18 * df;
              ctx.beginPath();
              ctx.strokeStyle = "rgba(59, 130, 246, " + alpha3 + ")";
              ctx.lineWidth = 0.7;
              ctx.moveTo(p1.sx, p1.sy);
              ctx.lineTo(p4.sx, p4.sy);
              ctx.stroke();
            }
          }
        }

        // Draw glowing nodes with calm, constant ambient lighting
        for (var r = ROWS - 1; r >= 0; r--) {
          for (var c = 0; c < COLS; c++) {
            var p = proj[r][c];
            var df = p.df;
            var rad = Math.max(1.2, 2.2 + 2.8 * df);

            // Halo - calm, non-flashing ambient glow
            ctx.beginPath();
            ctx.fillStyle = "rgba(0, 229, 255, " + (0.24 * df) + ")";
            ctx.arc(p.sx, p.sy, rad * 2.4, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.beginPath();
            ctx.fillStyle = "rgba(255, 255, 255, " + (0.92 * df) + ")";
            ctx.arc(p.sx, p.sy, rad * 0.65, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        requestAnimationFrame(draw);
      }
      requestAnimationFrame(draw);
    })();
  }
})();

