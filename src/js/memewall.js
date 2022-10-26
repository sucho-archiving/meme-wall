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
    this.resize();
    this.container.classList.remove("loading");

    this.shrink = this.shrink.bind(this);
    this.toggleItem = this.toggleItem.bind(this);

    // shrink blocks if an empty space is clicked
    this.container.addEventListener("click", this.shrink);

    // add click listeners to blocks
    this.items.forEach((item) =>
      item.addEventListener("click", this.toggleItem),
    );

    // add key down listener
    // keys(this.container);
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
    this.resize();
  }

  resize() {
    this.items
      .reduce(function (rows, block) {
        var _a;
        const offsetTop = block.offsetTop;
        if (!rows.has(offsetTop)) {
          rows.set(offsetTop, []);
        }
        (_a = rows.get(offsetTop)) === null || _a === void 0
          ? void 0
          : _a.push(block);
        return rows;
      }, new Map())
      .forEach((row) => MemeWall.resizeRow(row));
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
    const selectedRow = this.items.filter(
      (item) => item.offsetTop == block.offsetTop,
    );

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

    const rows = this.items.reduce(function (rows, block) {
      var _a;
      // group rows
      const offsetTop = block.offsetTop;
      if (!rows.has(offsetTop)) {
        rows.set(offsetTop, []);
      }
      (_a = rows.get(offsetTop)) === null || _a === void 0
        ? void 0
        : _a.push(block);
      return rows;
    }, new Map());

    const selectedIndex = [...rows.keys()].indexOf(block.offsetTop);
    const rowHeights = [...rows.values()].map((r) =>
      parseInt(window.getComputedStyle(r[0]).height, 10),
    );

    rows.forEach((row, offsetTop, rows) => {
      const rowIndex = [...rows.keys()].indexOf(offsetTop);
      // compute the y offset based on the distance from this row to the selected row
      const rowOffsetY =
        Math.sign(rowIndex - selectedIndex) *
          (scale - 1) *
          rowHeights
            .slice(
              ...(rowIndex >= selectedIndex
                ? [selectedIndex, rowIndex]
                : [rowIndex, selectedIndex]),
            )
            .reduce((offset, height) => offset + height, 0) -
        offsetY;
      row
        .map((item) => ({
          item: item,
          width: parseInt(window.getComputedStyle(item).width, 10),
        }))
        .forEach((item, columnIndex, items) => {
          const offsetX =
            items
              .slice(0, columnIndex)
              .reduce((offset, elem) => offset + elem.width, 0) *
            (scale - 1);
          const percentageOffsetX =
            ((offsetX + leftOffsetX) / item.width) * 100;
          const percentageOffsetY =
            (rowOffsetY /
              parseInt(window.getComputedStyle(item.item).height, 10)) *
            100;
          item.item.style.transformOrigin = "0% 0%";
          item.item.style.transform =
            "translate(" +
            percentageOffsetX.toFixed(8) +
            "%, " +
            percentageOffsetY.toFixed(8) +
            "%) scale(" +
            scale.toFixed(8) +
            ")";
        });
    });
  }
}
