export default class MemeWall {
  constructor(container, onItemToggleCb = () => {}) {
    this.container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;
    this.onItemToggleCb = onItemToggleCb;
    this.init();
  }

  static resizeRow(row) {
    if (!row) return;
    if (row.length > 1) {
      const itemWidths = row.map((item) =>
        parseInt(window.getComputedStyle(item).width, 10),
      );
      const rowWidth = itemWidths.reduce((width, item) => width + item, 0);
      row.forEach((item, i) => {
        item.style.width = `${(itemWidths[i] / rowWidth) * 100}%`;
        item.style.height = "auto";
      });
    }
  }

  init() {
    this.items = [...this.container.querySelectorAll("img")];
    this.initializeRows();
    this.container.classList.remove("loading");

    this.shrink = this.shrink.bind(this);
    this.toggleItem = this.toggleItem.bind(this);

    // shrink blocks if an empty space is clicked
    this.container.addEventListener("click", this.shrink);

    // add click listeners to blocks
    this.items.forEach((item) =>
      item.addEventListener("click", this.toggleItem),
    );

    // TODO: add keyboard controls?
  }

  destroy() {
    this.container.removeEventListener("click", this.shrink);
    this.items.forEach((item) =>
      item.removeEventListener("click", this.toggleItem),
    );
  }

  reset() {
    [...this.container.getElementsByClassName("active")].forEach((block) => {
      block.style.transform = "translate(0, 0) scale(1)";
      block.classList.remove("active");
    });
    this.shrink(false);
    this.initializeRows();
  }

  initializeRows() {
    this.rows = this.items.reduce((rows, block) => {
      block.classList.add("offcanvas");
      const offsetTop = block.offsetTop;
      if (!rows.has(offsetTop)) {
        return rows.set(offsetTop, [block]);
      }
      rows.get(offsetTop).push(block);
      return rows;
    }, new Map());

    this.rows = [...this.rows.values()];

    this.layoutObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, idx) => {
          if (entry.isIntersecting) {
            const row = this.rows[entry.target.rowIndex];
            MemeWall.resizeRow(row);
            row.forEach((item, blockIdx) => {
              // calculate a transition delay such that items fade in from left to right
              // and multiple rows that are revealed at the same time are offset a little
              // (on slower connections the images will come as the network can provide them,
              //  but the placeholders should still exhibit this effect, at least).
              const delay = blockIdx * 0.05 + idx * 0.1;
              item.style.transitionDelay = `${delay}s`;
              item.classList.remove("offcanvas");
              setTimeout(() => {
                // once the delay has elapsed (i.e. once the transition has completed),
                // reset the CSS transition-delay property so it doesn't interfere with the
                // zoom in/out animation.
                item.style.transitionDelay = `0s`;
              }, delay * 1000);
            });
          } else {
            if (!this.container.classList.contains("zoomed")) {
              const row = this.rows[entry.target.rowIndex];
              row.forEach((item) => {
                item.classList.add("offcanvas");
              });
            }
          }
        });
      },
      { rootMargin: "200px 0px 200px 0px" },
    );

    this.rows.forEach((row, idx) => {
      row.forEach((block) => (block.rowIndex = idx));
      this.layoutObserver.observe(row[0]);
    });
  }

  shrink(event) {
    if (!event || (event && event.target === this.container)) {
      if (this.container.classList.contains("single")) return;
      this.container.classList.remove("zoomed");
      this.items.forEach(this.resetItem);
    }
  }

  resetItem(block) {
    block.style.transform = "translate(0, 0) scale(1)";
    block.classList.remove("active");
  }

  activateItem(block) {
    [...this.container.getElementsByClassName("active")].forEach(
      this.resetItem,
    );
    this.expand(block);
    this.onItemToggleCb(block);
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

  expand(block) {
    block.classList.add("active");
    this.container.classList.add("zoomed");

    // parent dimensions
    const parentStyle = window.getComputedStyle(this.container);
    const parentWidth = parseInt(parentStyle.width, 10);
    const parentHeight = parseInt(parentStyle.height, 10);
    const parentTop = this.container.getBoundingClientRect().top;

    // block dimensions
    const blockStyle = window.getComputedStyle(block);
    const blockWidth = parseInt(blockStyle.width, 10);
    const blockHeight = parseInt(blockStyle.height, 10);

    // determine maximum height
    let targetHeight = window.innerHeight;
    if (parentHeight < window.innerHeight) {
      targetHeight = parentHeight;
    } else if (parentTop > 0) {
      targetHeight -= parentTop;
    }

    // determine what blocks are on this row
    const selectedRow = this.rows[block.rowIndex];

    // calculate scale
    let scale = targetHeight / blockHeight;
    if (blockWidth * scale > parentWidth) {
      scale = parentWidth / blockWidth;
    }

    // determine offset
    let offsetY =
      parentTop -
      this.container.offsetTop -
      this.container.scrollTop +
      block.offsetTop;

    const metadataHeight =
      block.nextElementSibling.getBoundingClientRect().height;

    const availableHeight = targetHeight - metadataHeight;

    if (offsetY > 0) {
      if (blockHeight * scale < availableHeight) {
        offsetY -= availableHeight / 2 - (blockHeight * scale) / 2;
      }
      if (parentTop > 0) {
        offsetY -= parentTop;
      }
    }

    const leftWidth = selectedRow
      .slice(0, selectedRow.indexOf(block))
      .reduce(
        (offset, item) =>
          offset + parseInt(window.getComputedStyle(item).width, 10) * scale,
        0,
      );
    const leftOffsetX = parentWidth / 2 - (blockWidth * scale) / 2 - leftWidth;

    const selectedIndex = block.rowIndex;
    const rowHeights = this.rows.map((r) =>
      parseInt(window.getComputedStyle(r[0]).height, 10),
    );

    this.rows.forEach((row, rowIndex) => {
      // compute the y offset based on the distance from this row to the selected row
      const [start, end] =
        rowIndex >= selectedIndex
          ? [selectedIndex, rowIndex]
          : [rowIndex, selectedIndex];

      let rowOffsetY = 0;
      for (let i = start; i < end; i++) {
        rowOffsetY += rowHeights[i];
      }

      rowOffsetY =
        Math.sign(rowIndex - selectedIndex) * (scale - 1) * rowOffsetY -
        offsetY;

      let offsetX = 0;
      row.forEach((item) => {
        let { width, height } = window.getComputedStyle(item);
        width = parseInt(width, 10);
        height = parseInt(height, 10);

        const percentageOffsetX =
          ((offsetX * (scale - 1) + leftOffsetX) / width) * 100;
        const percentageOffsetY = (rowOffsetY / height) * 100;

        item.dataset.transform = `translate(${percentageOffsetX.toFixed(
          8,
        )}%, ${percentageOffsetY.toFixed(8)}%) scale(${scale.toFixed(8)})`;
        offsetX += width;
      });
    });

    this.items.forEach((item) => {
      if (!item.classList.contains("offcanvas")) {
        item.style.transform = item.dataset.transform;
      }
    });
  }
}
