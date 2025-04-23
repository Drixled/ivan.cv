UnicornStudio.init();

// Custom animations

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.fade-stagger').forEach((el) => {
    const index = parseInt(el.dataset.stagger || 0, 10);
    const delay = index * 120;
    const duration = 500 + index * 60;
    el.style.transitionDelay = `${delay}ms`;
    el.style.transitionDuration = `${duration}ms`;

    // Wait for next paint so text injection can finish
    setTimeout(() => {
      el.classList.add('visible');
    }, delay);
  });
});

// Dynamic Timezone Diff

// Your timezone in hours offset from UTC
const myTimeZoneOffset = -6; // CST
// Get user's local timezone offset in hours (note: JS returns it in minutes and it's *opposite* sign)
const userOffset = -new Date().getTimezoneOffset() / 60;
const diff = userOffset - myTimeZoneOffset;
// Format the difference nicely
const sign = diff >= 0 ? "+" : "-";
const absDiff = Math.abs(diff);
// Build the message
const myNoon = 12;
const userTime = (myNoon + diff + 24) % 24;
const userHour = Math.floor(userTime);
const userMinute = Math.round((userTime - userHour) * 60);
const formattedUserTime = `${userHour}:${userMinute.toString().padStart(2, '0')} ${userHour >= 12 ? "PM" : "AM"}`;
const message = `When it's noon for me (CST), it's already ${formattedUserTime} for you`;
// Inject it into the DOM
document.getElementById("time-diff-msg").textContent = message;


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
