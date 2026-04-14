import MemeWall from "./memewall.js";

const supportsCssHasSelector = CSS.supports("selector(:has(img))");

let memewall;
const wallContainer = document.getElementById("meme-wall");
const resetButton = document.querySelector("button.reset-wall");
const showFiltersButton = document.querySelector("button.show-filters");
const searchButton = document.querySelector("button.search");
const searchInput = document.querySelector("div.search input");
const overlayButtons = document.getElementById("overlay-buttons");
const glossaryPopup = document.getElementById("popup");

const filters = ["memeType", "person", "language", "country", "templateType"];
const filterSelects = Object.fromEntries(
  filters.map((filter) => [filter, document.querySelector(`div#${filter}`)]),
);
let activeFilters = {};

let filterTimeout = null;
let searchTimeout = null;

const updateCount = () => {
  const countSpan = document.querySelector("div.count span");
  const shownMemeCount = memewall.getShownCount();
  const totalMemeCount = memewall.getTotalCount();
  countSpan.textContent = shownMemeCount + " / " + totalMemeCount;
  countSpan.parentElement.classList.toggle(
    "show-reset",
    shownMemeCount !== totalMemeCount,
  );
};

const updateWall = () => {
  updateCount();
  overlayButtons.classList.remove("active");
  memewall.reset();
  if (memewall.getShownCount() === 0) {
    wallContainer.classList.add("empty");
  }
  if (memewall.getShownCount() === 1) {
    wallContainer.classList.add("single");
    const img = memewall.getActiveItem();
    if (img) {
      memewall.activateItem(img);
    }
  }
  if (!supportsCssHasSelector) {
    setTimeout(() => {
      document.querySelector(".loader").style.opacity =
        +!!wallContainer.querySelectorAll("img:not(.hidden).offcanvas").length;
    }, 0);
  }
};

const resetFilters = () => {
  wallContainer.classList.remove("empty");
  wallContainer.classList.remove("single");
  history.replaceState("", document.title, window.location.pathname);

  Object.values(filterSelects).forEach((filterSelect) => {
    filterSelect.dispatchEvent(new Event("clear"));
  });
  activeFilters = {};
  filterMemes();
};

const resetSearch = (ui = true) => {
  wallContainer.classList.remove("empty");
  wallContainer.classList.remove("single");
  wallContainer.classList.remove("zoomed");
  history.replaceState("", document.title, window.location.pathname);
  document.querySelector("div.controls").classList.remove("searching");
  searchInput.value = "";

  if (ui) {
    clearTimeout(filterTimeout);
    clearTimeout(searchTimeout);
    memewall.applySearch("");
    updateWall();
  }
};

const reset = () => {
  wallContainer.classList.remove("empty");
  wallContainer.classList.remove("single");
  wallContainer.classList.remove("zoomed");
  resetFilters();
};

const filterMemes = () => {
  clearTimeout(filterTimeout);
  wallContainer.classList.remove("empty");
  wallContainer.classList.remove("single");
  wallContainer.classList.remove("zoomed");

  const activeFilterCount = Object.entries(activeFilters).reduce(
    (acc, [key, values]) => (acc += key === "memeType" ? 0 : values.length),
    0,
  );
  showFiltersButton.dataset.activeFilterCount = activeFilterCount;
  showFiltersButton.classList.toggle("show-indicator", activeFilterCount > 0);

  filterTimeout = setTimeout(() => {
    memewall.applyFilters(activeFilters);
    updateWall();
  }, 0);
};

const searchMemes = (searchTerm) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    memewall.applySearch(searchTerm);
    updateWall();
  }, 200);
};

const wallItemToggleCb = (img) => {
  if (img.classList.contains("active")) {
    overlayButtons.classList.add("active");
    const picture = img.parentElement;
    history.replaceState(
      "",
      document.title,
      window.location.pathname + "#" + picture.dataset.id,
    );
  } else {
    overlayButtons.classList.remove("active");
    history.replaceState("", document.title, window.location.pathname);
  }
};

const goToMeme = (memeId) => {
  memewall.goToMeme(memeId);
};

// Hook up event listeners
window.addEventListener("hashchange", () => {
  const memeId = window.location.hash.substring(1);
  if (
    !document
      .querySelector(`[data-id='${memeId}'] img`)
      ?.classList.contains("active")
  )
    goToMeme(memeId);
});

resetButton.addEventListener("click", reset);

Object.entries(filterSelects).forEach(([filter, filterSelect]) => {
  filterSelect.addEventListener("updated", ({ detail: selected }) => {
    activeFilters[filter] = selected;
    filterMemes(filter, selected);
  });
});

showFiltersButton.addEventListener("click", () => {
  document.querySelector("div.more-filters").classList.toggle("show");
  showFiltersButton.classList.toggle("on");
});

searchButton.addEventListener("click", () => {
  const controls = document.querySelector("div.controls");
  if (controls.classList.contains("searching")) {
    if (searchInput.value == "") {
      controls.classList.remove("searching");
      return;
    }
    resetSearch();
  } else {
    controls.classList.add("searching");
    searchInput.focus();
  }
});

searchInput.addEventListener("change", ({ target: { value } }) =>
  searchMemes(value),
);

wallContainer.addEventListener("click", ({ target }) => {
  if (target === wallContainer && target.classList.contains("empty")) {
    wallContainer.classList.remove("empty");
    reset();
  }
});

const iframe = glossaryPopup.querySelector("iframe");
iframe.addEventListener("load", () => {
  iframe.style.height = iframe.contentDocument.body.offsetHeight + 40 + "px";
});

document.querySelectorAll("a.show-content-type").forEach((link) => {
  link.addEventListener("click", (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    fetch(link)
      .then((res) => res.text())
      .then((html) => {
        iframe.srcdoc = html;
        glossaryPopup.classList.add("active");
      });
  });
});

glossaryPopup.addEventListener("click", (evt) => {
  if (evt.target === glossaryPopup) {
    glossaryPopup.classList.remove("active");
    iframe.style.height = 0;
  }
});

const flash = (el) => {
  el.classList.add("flash");
  const animation = el.getAnimations()[0];
  if (animation !== undefined) {
    animation.onfinish = () => el.classList.remove("flash");
  } else {
    el.classList.remove("flash");
  }
};

window.addEventListener("keydown", (event) => {
  if (glossaryPopup.classList.contains("active")) {
    if (event.key == "Escape") {
      glossaryPopup.classList.remove("active");
    }
    return;
  }

  if (wallContainer.classList.contains("zoomed")) {
    switch (event.key) {
      case "Escape": {
        flash(document.querySelector('[aria-label="Close"]'));
        memewall.toggleItem({
          target: wallContainer.querySelector("img.active"),
          stopPropagation: () => {},
        });
        break;
      }

      case "ArrowLeft":
      case "ArrowUp":
        flash(document.querySelector('[aria-label="Previous"]'));
        memewall.previous();
        break;

      case "ArrowRight":
      case "ArrowDown":
        flash(document.querySelector('[aria-label="Next"]'));
        memewall.next();
        break;
    }
  }
});

// the `vh` unit is problematic on mobile; this workaround sets a CSS variable
//  to 1% of `window.innerHeight` which can be used instead
const setVh = () =>
  document.documentElement.style.setProperty(
    "--vh",
    `${window.innerHeight * 0.01}px`,
  );
window.addEventListener("resize", setVh);
setVh();

const dataEl = document.getElementById("meme-data");
const { memes, glossaries } = JSON.parse(dataEl.textContent);

// Initialize MemeWall
memewall = new MemeWall(wallContainer, memes, glossaries, wallItemToggleCb);
if (window.location.hash) goToMeme(window.location.hash.substring(1));

self.memewall = memewall;
self.wallContainer = wallContainer;
self.flash = flash;
