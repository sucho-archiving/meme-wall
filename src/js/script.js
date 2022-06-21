import MemeWall from "./memewall.js";

let memewall;
const wallContainer = document.getElementById("meme-wall");
const items = wallContainer.querySelectorAll("[data-types]");
const filterSelect = document.querySelector("select");
const shuffleButton = document.querySelector("button.shuffle");
const searchButton = document.querySelector("button.search");
const searchInput = document.querySelector("div.search input");

const enableLazyLoading = (images, root) => {
  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src;
          image.removeAttribute("data-src");
          imageObserver.unobserve(image);
        }
      });
    },
    { root, rootMargin: "0px 0px 100% 0px" },
  );
  images.forEach((image) => imageObserver.observe(image));
};

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
  const count = document.querySelector("span.count");
  count.textContent =
    wallContainer.querySelectorAll("img:not(.hidden").length +
    " / " +
    wallContainer.querySelectorAll("img").length;
};

const updateWall = () => {
  updateCount();
  wallContainer.classList.add("loading");
  wallContainer.classList.remove("single");
  memewall.reset();
  if (wallContainer.querySelectorAll("img:not(.hidden)").length === 1) {
    memewall.toggleItem({
      target: wallContainer.querySelector("img:not(.hidden)"),
      stopPropagation: () => {},
    });
    wallContainer.classList.add("single");
  }
  wallContainer.classList.remove("loading");
};

const resetSearchUI = () => {
  document.querySelector("div.controls").classList.remove("searching");
  searchInput.value = "";
};

const resetFilterUI = () => {
  filterSelect.value = "";
};

const shuffle = () => {
  wallContainer.classList.add("loading");
  wallContainer.classList.remove("single");
  resetSearchUI();
  resetFilterUI();
  setTimeout(() => {
    memewall.reset();
    memewall.destroy();
    wallContainer.querySelectorAll("img").forEach((img) => toggleItem(img));
    updateCount();
    // Modified Fisher–Yates shuffle
    for (let i = wallContainer.children.length; i >= 0; i--) {
      wallContainer.appendChild(
        wallContainer.children[(Math.random() * i) | 0],
      );
    }
    memewall = new MemeWall(wallContainer);
    wallContainer.classList.remove("loading");
  }, 200);
};

const filterMemes = (memeType) => {
  const delay = searchInput.value ? 200 : 0;
  resetSearchUI();
  setTimeout(() => {
    items.forEach((item) =>
      toggleItem(
        item.querySelector("img"),
        item.dataset.types.split("|").includes(memeType),
      ),
    );
    updateWall();
  }, delay);
};

const searchMemes = (searchTerm) => {
  resetFilterUI();
  items.forEach((item) =>
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

const wallItemToggleCb = (img) => {
  if (img.classList.contains("active")) {
    img.sizes = "100vw";
    img.previousElementSibling.sizes = "100vw";
  } else {
    img.sizes = "15vmax";
    img.previousElementSibling.sizes = "15vmax";
  }
};

// Hook up event listeners
shuffleButton.addEventListener("click", shuffle);

filterSelect.addEventListener("change", ({ target: { value } }) =>
  filterMemes(value),
);

searchButton.addEventListener("click", () => {
  document.querySelector("div.controls").classList.toggle("searching");
  searchInput.focus();
});

searchInput.addEventListener("change", ({ target: { value } }) =>
  searchMemes(value),
);

// Hook up lazy loading
enableLazyLoading(wallContainer.querySelectorAll("[data-src]"), wallContainer);

// Initialize MemeWall
memewall = new MemeWall(wallContainer, wallItemToggleCb);
wallContainer.classList.remove("loading");
