const CONFIG = {
checkoutUrl: "https://pay.hotmart.com/Y108408135W",
  revealAtSeconds: 5
};

/* =========================================
   ELEMENTOS
========================================= */

const video = document.querySelector("#vslVideo");
const videoFrame = document.querySelector("#videoFrame");

const lockedContent = document.querySelector("#lockedContent");
const miniPlayer = document.querySelector("#miniPlayer");
const miniPlay = document.querySelector("#miniPlay");
const restoreVideo = document.querySelector("#restoreVideo");
const unlockMessage = document.querySelector("#unlockMessage");

const checkoutButtons = document.querySelectorAll(".checkout-button");
const year = document.querySelector("#year");

/* =========================================
   ESTADO
========================================= */

let contentUnlocked = false;
let miniPlayerDismissed = false;

let lastAllowedTime = 0;
let lastPlaybackTime = 0;
let watchedSeconds = 0;

let isRestoringPosition = false;

/* =========================================
   ANO DO RODAPÉ
========================================= */

if (year) {
  year.textContent = new Date().getFullYear();
}

/* =========================================
   LIBERAR CONTEÚDO
========================================= */

function unlockPage() {
  if (contentUnlocked || !lockedContent) return;

  contentUnlocked = true;

  lockedContent.classList.add("unlocked");
  lockedContent.setAttribute("aria-hidden", "false");

  if (
    miniPlayer &&
    !miniPlayerDismissed &&
    video &&
    !video.paused &&
    !video.ended
  ) {
    miniPlayer.classList.add("active");
  }

  if (unlockMessage) {
    unlockMessage.classList.add("show");

    window.setTimeout(() => {
      unlockMessage.classList.remove("show");
    }, 6500);
  }
}

/* =========================================
   ATUALIZAR MINI PLAYER
========================================= */

function updatePlayButtons() {
  if (!video || !miniPlay) return;

  miniPlay.textContent =
    !video.paused && !video.ended ? "Ⅱ" : "▶";
}

/* =========================================
   CONTROLE DE AVANÇO DO VÍDEO
========================================= */

function restoreAllowedPosition() {
  if (!video || isRestoringPosition) return;

  isRestoringPosition = true;
  video.currentTime = lastAllowedTime;
}

if (video) {
  video.addEventListener("seeking", () => {
    if (isRestoringPosition) return;

    const difference =
      Math.abs(video.currentTime - lastAllowedTime);

    if (difference > 0.4) {
      restoreAllowedPosition();
    }
  });

  video.addEventListener("seeked", () => {
    if (isRestoringPosition) {
      isRestoringPosition = false;
    }

    lastPlaybackTime = video.currentTime;
  });

  video.addEventListener("timeupdate", () => {
    if (!video.seeking && !isRestoringPosition) {
      const currentTime = video.currentTime;
      const difference = currentTime - lastPlaybackTime;

      if (
        !video.paused &&
        difference > 0 &&
        difference <= 1.5
      ) {
        watchedSeconds += difference;
      }

      if (currentTime > lastAllowedTime) {
        lastAllowedTime = currentTime;
      }

      lastPlaybackTime = currentTime;
    }

    if (watchedSeconds >= CONFIG.revealAtSeconds) {
      unlockPage();
    }

    updateVideoState();
  });

  video.addEventListener("play", () => {
    lastPlaybackTime = video.currentTime;
    updateVideoState();
  });

  video.addEventListener("pause", () => {
    lastPlaybackTime = video.currentTime;
    updateVideoState();
  });

  video.addEventListener("loadedmetadata", () => {
    lastAllowedTime = 0;
    lastPlaybackTime = 0;
    watchedSeconds = 0;
    updatePlayButtons();
  });
}

/* =========================================
   ESTADO DO VÍDEO E MINI PLAYER
========================================= */

function updateVideoState() {
  if (!video) return;

  if (watchedSeconds >= CONFIG.revealAtSeconds) {
    unlockPage();
  }

  if (
    contentUnlocked &&
    miniPlayer &&
    videoFrame &&
    !video.paused &&
    !video.ended &&
    !miniPlayerDismissed
  ) {
    const frameRect = videoFrame.getBoundingClientRect();

    if (frameRect.bottom < 0 || frameRect.top < 0) {
      miniPlayer.classList.add("active");
    } else {
      miniPlayer.classList.remove("active");
    }
  }

  updatePlayButtons();
}

/* =========================================
   MINI PLAYER
========================================= */

if (miniPlay && video) {
  miniPlay.addEventListener("click", async () => {
    if (video.paused) {
      try {
        await video.play();
      } catch (error) {
        console.error(
          "Não foi possível reproduzir o vídeo:",
          error
        );
      }
    } else {
      video.pause();
    }

    updatePlayButtons();
  });
}

if (restoreVideo && videoFrame && miniPlayer) {
  restoreVideo.addEventListener("click", () => {
    miniPlayerDismissed = true;
    miniPlayer.classList.remove("active");

    videoFrame.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    window.setTimeout(() => {
      miniPlayerDismissed = false;
      updateVideoState();
    }, 900);
  });
}

/* =========================================
   ROLAGEM NORMAL DA PÁGINA
========================================= */

window.addEventListener("scroll", () => {
  updateVideoState();
}, {
  passive: true
});

/* =========================================
   FINAL DO VÍDEO
========================================= */

if (video) {
  video.addEventListener("ended", () => {
    unlockPage();

    if (miniPlayer) {
      miniPlayer.classList.remove("active");
    }

    updatePlayButtons();
  });
}

/* =========================================
   BOTÕES DE COMPRA
========================================= */

checkoutButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    if (!CONFIG.checkoutUrl) {
      event.preventDefault();

      alert(
        "O link de pagamento ainda não foi configurado. " +
        "Coloque a URL em CONFIG.checkoutUrl no arquivo script.js."
      );

      return;
    }

    event.preventDefault();

    window.open(
      CONFIG.checkoutUrl,
      "_blank",
      "noopener,noreferrer"
    );
  });
});

/* =========================================
   PROTEÇÃO CONTRA ATALHOS
========================================= */

if (videoFrame) {
  videoFrame.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  videoFrame.addEventListener("keydown", (event) => {
    if (
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight" ||
      event.key === "Home" ||
      event.key === "End"
    ) {
      event.preventDefault();
    }
  });
}


/* =========================================
   ANIMAÇÃO DOS ELEMENTOS AO ROLAR A PÁGINA
========================================= */

function initializeScrollReveal() {

  const revealSelectors = [
    ".postvideo-identification .identification-copy",
    ".postvideo-identification .identification-highlight",
    ".postvideo-identification .identification-closing",

    ".postvideo-experience .experience-heading",
    ".postvideo-experience .experience-card",

    ".postvideo-ritual .ritual-copy",
    ".postvideo-ritual .ritual-visual",

    ".receive-heading",
    ".receive-item",
    ".receive-footer",

    ".offer-header",
    ".offer-card",

    ".bonus-section .section-heading",
    ".bonus-card",

    ".guarantee-seal",
    ".guarantee-content",

    ".closing-content",

    ".faq-section .section-heading",
    ".faq-list details",

    ".footer-brand",
    ".footer small"
  ];

  const elements = document.querySelectorAll(
    revealSelectors
      .map(selector => `#lockedContent ${selector}`)
      .join(",")
  );

  // Configura os elementos e seus atrasos

  elements.forEach((element, index) => {

    element.classList.add("scroll-reveal");

    const delay = (index % 4) * 120;

    element.style.setProperty(
      "--reveal-delay",
      `${delay}ms`
    );

  });

  // Observa a entrada dos elementos na tela

  const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {

        entry.target.classList.add("is-visible");

        observer.unobserve(entry.target);

      }

    });

  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -45px 0px"
  });

  elements.forEach(element => {
    observer.observe(element);
  });

}

/* =========================================
   INTEGRAÇÃO COM A LIBERAÇÃO DO CONTEÚDO
========================================= */

const originalUnlockPage = unlockPage;

unlockPage = function() {

  const wasUnlocked = contentUnlocked;

  originalUnlockPage();

  if (!wasUnlocked && contentUnlocked) {
    initializeScrollReveal();
  }

};


/* =========================================
   INICIALIZAÇÃO
========================================= */

updatePlayButtons();