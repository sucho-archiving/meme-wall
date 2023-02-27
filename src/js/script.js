import MemeWall from "./memewall.js";

let memewall;
const wallContainer = document.getElementById("meme-wall");
const items = wallContainer.querySelectorAll("picture");
const resetButton = document.querySelector("button.reset-wall");
const showFiltersButton = document.querySelector("button.show-filters");
const searchButton = document.querySelector("button.search");
const searchInput = document.querySelector("div.search input");
const shareButton = document.querySelector(".share");

const filters = ["memeType", "person", "language", "country", "templateType"];
const filterSelects = Object.fromEntries(
  filters.map((filter) => [filter, document.querySelector(`div#${filter}`)]),
);
let activeFilters = {};

const toggleItem = (img, condition = true) => {
  if (condition) {
    img.style.removeProperty("width");
    img.style.removeProperty("height");
    img.classList.remove("hidden");
  } else {
    img.classList.add("hidden");
  }
};

const updateCount = () => {
  const countSpan = document.querySelector("div.count span");
  const shownMemeCount =
    wallContainer.querySelectorAll("img:not(.hidden").length;
  const totalMemeCount = wallContainer.querySelectorAll("img").length;
  countSpan.textContent = shownMemeCount + " / " + totalMemeCount;
  countSpan.parentElement.classList.toggle(
    "show-reset",
    shownMemeCount !== totalMemeCount,
  );
};

const updateWall = () => {
  updateCount();
  memewall.reset();
  if (wallContainer.querySelectorAll("img:not(.hidden)").length === 0) {
    wallContainer.classList.add("empty");
  }
  if (wallContainer.querySelectorAll("img:not(.hidden)").length === 1) {
    memewall.toggleItem({
      target: wallContainer.querySelector("img:not(.hidden)"),
      stopPropagation: () => {},
    });
    wallContainer.classList.add("single");
  }
};

const resetFilters = () => {
  wallContainer.classList.remove("empty");
  wallContainer.classList.remove("single");
  history.replaceState("", document.title, window.location.pathname);

  Object.values(filterSelects).forEach((filterSelect) => {
    console.log("clearing", filterSelect);
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
    setTimeout(() => {
      items.forEach((item) => {
        toggleItem(item.querySelector("img"), true);
      });
      updateWall();
    }, 200);
  }
};

const reset = () => {
  wallContainer.classList.remove("empty");
  wallContainer.classList.remove("single");
  wallContainer.classList.remove("zoomed");
  resetFilters();
};

const filterMemes = () => {
  wallContainer.classList.remove("empty");
  wallContainer.classList.remove("single");
  wallContainer.classList.remove("zoomed");
  resetSearch(false);
  const delay = searchInput.value ? 200 : 0;

  const showHide = (item) =>
    Object.entries(activeFilters).some(([facet, values]) =>
      values.some((value) => item.dataset[facet].split("|").includes(value)),
    );

  const activeFilterCount = Object.entries(activeFilters).reduce(
    (acc, [key, values]) => (acc += key === "memeType" ? 0 : values.length),
    0,
  );
  showFiltersButton.dataset.activeFilterCount = activeFilterCount;
  showFiltersButton.classList.toggle("show-indicator", activeFilterCount > 0);

  setTimeout(() => {
    Object.values(activeFilters).flat().length
      ? items.forEach((item) => {
          toggleItem(item.querySelector("img"), showHide(item));
        })
      : items.forEach((item) => {
          toggleItem(item.querySelector("img"), true);
        });
    updateWall();
  }, delay);
};

const searchMemes = (searchTerm) => {
  [...items]
    .filter((item) => !item.querySelector("img").classList.contains("hidden"))
    .forEach((item) =>
      toggleItem(
        item.querySelector("img"),
        [...item.querySelectorAll("dd")].some((dd) =>
          dd.textContent
            .toLocaleLowerCase()
            .includes(searchTerm.toLocaleLowerCase()),
        ),
      ),
    );
  updateWall();
};

const showMoreListener = ({ currentTarget: target }) =>
  target.classList.toggle("show-more");

const wallItemToggleCb = (img) => {
  if (img.classList.contains("active")) {
    img.sizes = "100vw";
    img.previousElementSibling.sizes = "100vw";
    img.nextElementSibling.addEventListener("click", showMoreListener);
    shareButton.classList.add("active");
    history.replaceState(
      "",
      document.title,
      window.location.pathname + "#" + img.parentElement.dataset.id,
    );
  } else {
    img.sizes = "15vmax";
    img.previousElementSibling.sizes = "15vmax";
    img.nextElementSibling.removeEventListener("click", showMoreListener);
    shareButton.classList.remove("active");
    history.replaceState("", document.title, window.location.pathname);
  }
};

const goToMeme = (memeId) => {
  const el = document.querySelector(`[data-id='${memeId}'] img`);
  if (!el) return false;
  el.previousElementSibling.scrollIntoView();
  memewall.activateItem(el);
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

// Initialize MemeWall
memewall = new MemeWall(wallContainer, wallItemToggleCb);
if (window.location.hash) goToMeme(window.location.hash.substring(1));
