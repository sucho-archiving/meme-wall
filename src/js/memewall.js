import { sluggify } from "../utils.js";

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>`;

function renderGlossaryLinks(terms, glossary, route) {
  return terms
    .map((term) => {
      if (glossary[sluggify(term)]) {
        return `<a class="show-content-type" title="More Information" href="${import.meta.env.BASE_URL}${route}/${sluggify(term)}/">${term} ${ICON_SVG}</a>`;
      }
      return `<span>${term}</span>`;
    })
    .join("");
}

function renderDl(meme, glossaries) {
  const field = (label, content) => `<dt>${label}</dt><dd>${content}</dd>`;
  const terms = (items, glossary, route) =>
    items ? renderGlossaryLinks(items, glossary, route) : "---";

  return [
    field("Title", meme.title || "---"),
    field("Translation", meme.textTranslatedIntoEnglish || "---"),
    field(
      "Content Type",
      meme.memeContentType
        ? terms(meme.memeTypes, glossaries.contentType, "content-types")
        : "---",
    ),
    field("Country", meme.country || "---"),
    field("Language", meme.language || "---"),
    field(
      "Template Type",
      meme.memeTemplateType
        ? terms(meme.templateTypes, glossaries.templateType, "template-types")
        : "---",
    ),
    field(
      "People",
      meme.peopleIndividuals
        ? terms(meme.people, glossaries.people, "people")
        : "---",
    ),
  ].join("");
}

export default class MemeWall {
  constructor(container, memeData, glossaries, onItemToggleCb = () => {}) {
    this.container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;
    this.memeData = memeData;
    this.glossaries = glossaries;
    this.onItemToggleCb = onItemToggleCb;
    this.rows = [];
    this.activeIndex = -1;
    this.visibleRange = { start: 0, end: 0 };
    this.rowHeight = 0;
    this.bufferRows = 3;
    this.resizeTimer = null;
    this.activeSearchTerm = "";

    this.shrink = this.shrink.bind(this);
    this.toggleItem = this.toggleItem.bind(this);
    this.handleScroll = this.handleScroll.bind(this);

    this.container.addEventListener("click", this.shrink);
    this.container.addEventListener("scroll", this.handleScroll, {
      passive: true,
    });
    window.addEventListener("resize", () => this.onResize());

    this.computeLayout();
    this.container.classList.remove("loading");
  }

  destroy() {
    this.container.removeEventListener("click", this.shrink);
    this.container.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.onResize);
  }

  toggleItem(event) {
    const block = event.target;
    if (block.classList.contains("active")) {
      this.shrink(false);
      this.onItemToggleCb(block);
    } else {
      this.activateItem(block);
    }
    event.stopPropagation();
  }

  computeLayout() {
    const containerWidth = this.container.clientWidth;
    if (containerWidth === 0) return;

    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const imgHeight = (15 * Math.max(vh, vw)) / 100;

    this.rowHeight = imgHeight;

    const visibleItems = this.getVisibleItems();
    const rows = [];
    let currentRow = [];
    let currentWidth = 0;

    for (let i = 0; i < visibleItems.length; i++) {
      const meme = visibleItems[i];
      const imgWidth = imgHeight * meme.aspectRatio;

      if (currentRow.length > 0 && currentWidth + imgWidth > containerWidth) {
        rows.push(currentRow);
        currentRow = [];
        currentWidth = 0;
      }

      currentRow.push({ ...meme, _imgWidth: imgWidth, _idx: i });
      currentWidth += imgWidth;
    }

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    this.rows = rows;
    this.totalHeight = rows.length * imgHeight;

    this.updateSpacer();

    const spacer = this.container.querySelector(".wall-spacer");
    spacer.querySelectorAll(".meme-row").forEach((el) => el.remove());
    this.visibleRange = { start: 0, end: 0 };

    this.renderVisibleRows();
  }

  getVisibleItems() {
    return this.memeData.filter((m) => !m._hidden);
  }

  updateSpacer() {
    let spacer = this.container.querySelector(".wall-spacer");
    if (!spacer) {
      spacer = document.createElement("div");
      spacer.className = "wall-spacer";
      spacer.style.position = "relative";
      this.container.appendChild(spacer);
    }
    spacer.style.height = `${this.totalHeight}px`;
  }

  renderVisibleRows() {
    const scrollTop = this.container.scrollTop;
    const viewportHeight = this.container.clientHeight;
    const buffer = this.bufferRows * this.rowHeight;

    const startRow = Math.max(
      0,
      Math.floor((scrollTop - buffer) / this.rowHeight),
    );
    const endRow = Math.min(
      this.rows.length,
      Math.ceil((scrollTop + viewportHeight + buffer) / this.rowHeight),
    );

    const newRange = { start: startRow, end: endRow };

    if (
      newRange.start === this.visibleRange.start &&
      newRange.end === this.visibleRange.end
    ) {
      return;
    }

    this.visibleRange = newRange;

    const spacer = this.container.querySelector(".wall-spacer");
    const existingRows = new Set(
      [...(spacer?.querySelectorAll(".meme-row") || [])].map((el) =>
        parseInt(el.dataset.row, 10),
      ),
    );

    const neededRows = new Set();
    for (let r = startRow; r < endRow; r++) {
      neededRows.add(r);
    }

    for (const rowIdx of existingRows) {
      if (!neededRows.has(rowIdx)) {
        const el = spacer.querySelector(`.meme-row[data-row="${rowIdx}"]`);
        if (el) el.remove();
      }
    }

    for (let r = startRow; r < endRow; r++) {
      if (!existingRows.has(r)) {
        this.renderRow(r);
      }
    }
  }

  renderRow(rowIndex) {
    const row = this.rows[rowIndex];
    if (!row || row.length === 0) return;

    const rowEl = document.createElement("div");
    rowEl.className = "meme-row";
    rowEl.dataset.row = rowIndex;
    const totalWidth = row.reduce((sum, item) => sum + item._imgWidth, 0);
    const stretchRow = rowIndex !== this.rows.length - 1;

    rowEl.style.cssText = `position:absolute;top:${rowIndex * this.rowHeight}px;left:0;${stretchRow ? "right:0;" : ""}height:${this.rowHeight}px;display:flex;`;

    for (let i = 0; i < row.length; i++) {
      const item = row[i];
      const pctWidth = stretchRow ? (item._imgWidth / totalWidth) * 100 : null;

      const picture = document.createElement("picture");
      picture.dataset.id = item.driveId;
      picture.dataset.memeType = item.memeTypes.join("|");
      picture.dataset.person = item.people.join("|");
      picture.dataset.language = item.languages.join("|");
      picture.dataset.country = item.countries.join("|");
      picture.dataset.templateType = item.templateTypes.join("|");
      picture.dataset.metadata = renderDl(item, this.glossaries);
      picture.dataset.logicalIdx = item._idx;
      picture.style.cssText = `position:relative;display:block;height:100%;${stretchRow ? `width:${pctWidth}%;flex-shrink:0;` : `width:${item._imgWidth}px;flex-shrink:1;`}`;

      const img = document.createElement("img");
      img.srcset = item.srcSet;
      img.alt = item.title;
      img.sizes = "15vmax";
      img.style.cssText = `height:100%;width:100%;display:block;transition:opacity 0.3s ease-out, transform 0.3s ease-out, box-shadow 0.3s ease-out;transform-origin:0% 0%;box-shadow:inset 3px 3px 20px 1px rgb(255 255 255 / 40%);`;
      img.decoding = "async";
      img.loading = "lazy";

      const delay = i * 0.05 + (rowIndex - this.visibleRange.start) * 0.1;
      img.style.transitionDelay = `${delay}s`;
      img.classList.add("offcanvas");

      setTimeout(
        () => {
          img.style.transitionDelay = "0s";
        },
        delay * 1000 + 300,
      );

      requestAnimationFrame(() => {
        img.classList.remove("offcanvas");
      });

      picture.appendChild(img);
      picture.addEventListener("click", (e) => {
        if (e.target === img || picture.contains(e.target)) {
          this.onImageClick(img, e);
        }
      });

      rowEl.appendChild(picture);
    }

    const spacer = this.container.querySelector(".wall-spacer");
    spacer.appendChild(rowEl);
  }

  onImageClick(img, event) {
    event.stopPropagation();
    const picture = img.parentElement;

    if (img.classList.contains("active")) {
      this.shrink(false);
      this.onItemToggleCb(img);
    } else {
      this.activateItem(img);
    }
  }

  activateItem(img) {
    const picture = img.parentElement;
    const logicalIdx = parseInt(picture.dataset.logicalIdx, 10);

    this.activeIndex = logicalIdx;

    const spacer = this.container.querySelector(".wall-spacer");
    [...spacer.querySelectorAll("img.active")].forEach((activeImg) => {
      this.resetItem(activeImg);
    });

    this.expand(img);
    this.onItemToggleCb(img);
  }

  resetItem(img) {
    img.style.transform = "translate(0, 0) scale(1)";
    img.classList.remove("active");
    this.removeMetadata(img);
  }

  createMetadata(img) {
    if (this.container.querySelector(".meme-metadata")) return;
    const picture = img.parentElement;
    const metadata = picture.dataset.metadata;
    if (!metadata) return;
    const dl = document.createElement("dl");
    dl.className = "meme-metadata";
    dl.innerHTML = metadata;
    dl.addEventListener("click", (e) => {
      if (e.target.closest("a.show-content-type")) {
        e.preventDefault();
        e.stopPropagation();
        const link = e.target.closest("a.show-content-type");
        const popup = document.getElementById("popup");
        const iframe = popup.querySelector("iframe");
        fetch(link)
          .then((res) => res.text())
          .then((html) => {
            iframe.srcdoc = html;
            popup.classList.add("active");
          });
        return;
      }
      dl.classList.toggle("show-more");
    });
    this.container.appendChild(dl);
  }

  removeMetadata(img) {
    const dl = this.container.querySelector(".meme-metadata");
    if (dl) dl.remove();
  }

  shrink(event) {
    if (!event || (event && event.target === this.container)) {
      if (this.container.classList.contains("single")) return;
      this.container.classList.remove("zoomed");
      const spacer = this.container.querySelector(".wall-spacer");
      [...spacer.querySelectorAll("img")].forEach((img) => {
        img.style.transform = "translate(0, 0) scale(1)";
        img.classList.remove("active");
        this.removeMetadata(img);
      });
    }
  }

  expand(img) {
    const picture = img.parentElement;
    img.classList.add("active");
    this.container.classList.add("zoomed");

    const containerRect = this.container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = this.container.clientHeight;

    const blockWidth = picture.offsetWidth;
    const blockHeight = picture.offsetHeight;

    let scale = containerHeight / blockHeight;
    if (blockWidth * scale > containerWidth) {
      scale = containerWidth / blockWidth;
    }

    img.sizes = `${blockWidth * scale}px`;

    const rowIdx = parseInt(
      picture.closest(".meme-row")?.dataset.row ?? "0",
      10,
    );
    const selectedIndex = rowIdx;

    const spacer = this.container.querySelector(".wall-spacer");
    const rowEls = [...spacer.querySelectorAll(".meme-row")];
    const selectedRowEl = rowEls.find(
      (el) => parseInt(el.dataset.row, 10) === selectedIndex,
    );
    const itemsInSelectedRow = selectedRowEl
      ? [...selectedRowEl.querySelectorAll("picture")]
      : [];
    const blockIdxInRow = itemsInSelectedRow.indexOf(picture);

    const leftWidth = itemsInSelectedRow
      .slice(0, blockIdxInRow)
      .reduce((offset, item) => offset + item.offsetWidth * scale, 0);
    const leftOffsetX =
      containerWidth / 2 - (blockWidth * scale) / 2 - leftWidth;

    const offsetY = rowIdx * this.rowHeight - this.container.scrollTop;

    const metadataHeight = 120;

    const availableHeight = containerHeight - metadataHeight;

    let finalOffsetY = offsetY;
    if (blockHeight * scale < availableHeight) {
      finalOffsetY -= availableHeight / 2 - (blockHeight * scale) / 2;
    }

    rowEls.forEach((rowEl) => {
      const rowIndex = parseInt(rowEl.dataset.row, 10);
      const [start, end] =
        rowIndex >= selectedIndex
          ? [selectedIndex, rowIndex]
          : [rowIndex, selectedIndex];

      let rowOffsetY = 0;
      for (let i = start; i < end; i++) {
        rowOffsetY += this.rowHeight;
      }

      rowOffsetY =
        Math.sign(rowIndex - selectedIndex) * (scale - 1) * rowOffsetY -
        finalOffsetY;

      let offsetX = 0;
      const pics = [...rowEl.querySelectorAll("picture")];
      pics.forEach((item) => {
        const itemWidth = item.offsetWidth;
        const itemHeight = item.offsetHeight;

        const percentageOffsetX =
          ((offsetX * (scale - 1) + leftOffsetX) / itemWidth) * 100;
        const percentageOffsetY = (rowOffsetY / itemHeight) * 100;

        const picImg = item.querySelector("img");
        if (picImg) {
          picImg.dataset.transform = `translate(${percentageOffsetX.toFixed(
            8,
          )}%, ${percentageOffsetY.toFixed(8)}%) scale(${scale.toFixed(8)})`;
        }
        offsetX += itemWidth;
      });
    });

    const allPics = [...spacer.querySelectorAll("picture")];
    allPics.forEach((pic) => {
      const picImg = pic.querySelector("img");
      if (picImg && picImg.dataset.transform) {
        picImg.style.transform = picImg.dataset.transform;
      }
    });

    this.createMetadata(img);
  }

  handleScroll() {
    if (this.container.classList.contains("zoomed")) return;
    this.renderVisibleRows();
  }

  onResize() {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.computeLayout();
    }, 150);
  }

  reset() {
    this.activeIndex = -1;
    this.container.classList.remove("zoomed");
    this.container.classList.remove("single");
    const spacer = this.container.querySelector(".wall-spacer");
    [...spacer.querySelectorAll("img")].forEach((img) => {
      img.style.transform = "translate(0, 0) scale(1)";
      img.classList.remove("active");
      this.removeMetadata(img);
    });
    this.computeLayout();
  }

  applyFilters(activeFilters) {
    this._activeFilters = activeFilters;
    this._applyCombined();
  }

  applySearch(searchTerm) {
    this.activeSearchTerm = searchTerm || "";
    this._applyCombined();
  }

  _applyCombined() {
    const facetMap = {
      memeType: "memeTypes",
      person: "people",
      language: "languages",
      country: "countries",
      templateType: "templateTypes",
    };

    const activeFacets = Object.entries(this._activeFilters || {}).filter(
      ([, values]) => values && values.length > 0,
    );

    const hasFilters = activeFacets.length > 0;
    const hasSearch = !!this.activeSearchTerm;
    const searchLower = hasSearch
      ? this.activeSearchTerm.toLocaleLowerCase()
      : null;

    this.memeData.forEach((meme) => {
      let hidden = false;

      if (hasFilters) {
        const matches = activeFacets.every(([facet, values]) => {
          const dataKey = facetMap[facet] || facet;
          const memeValues = meme[dataKey] || [];
          return values.some((v) => memeValues.includes(v));
        });
        if (!matches) hidden = true;
      }

      if (!hidden && hasSearch) {
        const searchable = [
          meme.title,
          meme.textTranslatedIntoEnglish,
          meme.memeTypes.join(" "),
          meme.country,
          meme.language,
          meme.templateTypes.join(" "),
          meme.people.join(" "),
        ]
          .join(" ")
          .toLocaleLowerCase();
        if (!searchable.includes(searchLower)) hidden = true;
      }

      meme._hidden = hidden;
    });

    this.activeIndex = -1;
    this.computeLayout();
  }

  getActiveItem() {
    const spacer = this.container.querySelector(".wall-spacer");
    return spacer?.querySelector("img.active");
  }

  next() {
    const visibleItems = this.getVisibleItems();
    if (this.activeIndex < 0 || this.activeIndex >= visibleItems.length - 1)
      return;
    const nextIdx = this.activeIndex + 1;
    this.scrollToItem(nextIdx);
  }

  previous() {
    if (this.activeIndex <= 0) return;
    const prevIdx = this.activeIndex - 1;
    this.scrollToItem(prevIdx);
  }

  scrollToItem(logicalIdx) {
    const visibleItems = this.getVisibleItems();
    if (logicalIdx < 0 || logicalIdx >= visibleItems.length) return;

    const meme = visibleItems[logicalIdx];
    const rowIdx = this.rows.findIndex((row) =>
      row.some((item) => item.driveId === meme.driveId),
    );

    if (rowIdx < 0) return;

    this.container.scrollTop = rowIdx * this.rowHeight;

    const checkRendered = () => {
      const spacer = this.container.querySelector(".wall-spacer");
      const img = spacer?.querySelector(
        `picture[data-id="${meme.driveId}"] img`,
      );
      if (img) {
        this.activateItem(img);
      } else {
        this.renderVisibleRows();
        setTimeout(checkRendered, 50);
      }
    };

    this.renderVisibleRows();
    setTimeout(checkRendered, 100);
  }

  goToMeme(memeId) {
    const idx = this.memeData.findIndex((m) => m.driveId === memeId);
    if (idx < 0) return false;

    const visibleItems = this.getVisibleItems();
    const visibleIdx = visibleItems.findIndex((m) => m.driveId === memeId);
    if (visibleIdx < 0) return false;

    this.scrollToItem(visibleIdx);
    return true;
  }

  getShownCount() {
    return this.memeData.filter((m) => !m._hidden).length;
  }

  getTotalCount() {
    return this.memeData.length;
  }
}
