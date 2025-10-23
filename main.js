UnicornStudio.init();

// Custom animations

window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".fade-stagger").forEach((el) => {
    const index = parseInt(el.dataset.stagger || 0, 10);
    const delay = index * 60;
    const duration = 500 + index * 60;
    el.style.transitionDelay = `${delay}ms`;
    el.style.transitionDuration = `${duration}ms`;

    // Wait for next paint so text injection can finish
    setTimeout(() => {
      el.classList.add("visible");
    }, delay);
  });
});

// Dynamic Timezone Diff

const myTimezone = "America/Mexico_City";
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const now = new Date();
const myTime = new Intl.DateTimeFormat("en-US", {
  timeZone: myTimezone,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
}).format(now);

const userTime = new Intl.DateTimeFormat("en-US", {
  timeZone: userTimezone,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
}).format(now);

const message = `While it's ${myTime} for me, it's ${userTime} for you — still the same planet though :)`;

document.getElementById("timezone-message").innerText = message;

// Custom Clipboard

document.addEventListener("DOMContentLoaded", function () {
  const copyLink = document.querySelector(".copy-email");
  const confirmText = document.querySelector(".copy-confirmation");

  copyLink.addEventListener("click", function (e) {
    e.preventDefault();
    const email = this.getAttribute("data-email");

    if (!navigator.clipboard) {
      // fallback for older browsers
      const temp = document.createElement("textarea");
      temp.value = email;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
    } else {
      navigator.clipboard.writeText(email);
    }

    // show confirmation
    confirmText.style.display = "inline";
    setTimeout(() => {
      confirmText.style.display = "none";
    }, 1500);
  });
});

// Create Email
document.addEventListener("DOMContentLoaded", function () {
  const copyLink = document.querySelector(".copy-email");
  const confirmText = document.querySelector(".copy-confirmation");

  const user = "hello";
  const domain = "vheissu.me";
  const email = `${user}@${domain}`;

  copyLink.addEventListener("click", function (e) {
    e.preventDefault();

    if (!navigator.clipboard) {
      const temp = document.createElement("textarea");
      temp.value = email;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
    } else {
      navigator.clipboard.writeText(email);
    }

    confirmText.style.display = "inline";
    setTimeout(() => {
      confirmText.style.display = "none";
    }, 1500);
  });
});
