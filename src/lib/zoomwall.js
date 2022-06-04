export default class ZoomWall {
  constructor(container) {
    this.container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;
    this.init();
  }

  static calcRowWidth(row) {
    return row.reduce(
      (width, img) => width + parseInt(window.getComputedStyle(img).width, 10),
      0,
    );
  }

  static resizeRow(row, width) {
    if (row && row.length > 1) {
      row.forEach(function (img) {
        img.style.width = `${
          (parseInt(window.getComputedStyle(img).width, 10) / width) * 100
        }%`;
        img.style.height = "auto";
      });
    }
  }

  init() {
    this.imgs = [...this.container.querySelectorAll("img")];
    this.resize();
    this.container.classList.remove("loading");

    // shrink blocks if an empty space is clicked
    this.container.addEventListener("click", this.shrink.bind(this));

    // add click listeners to blocks
    this.imgs.forEach((img) =>
      img.addEventListener("click", this.toggleItem.bind(this)),
    );

    // add key down listener
    // keys(this.container);
  }

  resize() {
    this.imgs
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
      .forEach((row) => ZoomWall.resizeRow(row, ZoomWall.calcRowWidth(row)));
  }

  shrink() {
    this.container.classList.remove("lightbox");
    this.container.querySelectorAll("img").forEach(this.reset);
  }

  reset(block) {
    block.style.transform = "translate(0, 0) scale(1)";
    block.classList.remove("active");
  }

  toggleItem(event) {
    if (!(event.target instanceof HTMLImageElement)) {
      return;
    }
    const block = event.target;
    if (block.classList.contains("active")) {
      this.shrink();
    } else {
      [...this.container.getElementsByClassName("active")].forEach((block) =>
        block.classList.remove("active"),
      );
      this.expand(block);
    }
    event.stopPropagation();
  }

  expand(block) {
    block.classList.add("active");
    this.container.classList.add("lightbox");

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
    const imgs = [...this.container.querySelectorAll("img")];
    const selectedRow = imgs.filter((img) => img.offsetTop == block.offsetTop);

    // calculate scale
    let scale = targetHeight / blockHeight;
    if (blockWidth * scale > parentWidth) {
      scale = parentWidth / blockWidth;
    }

    // determine offset
    let offsetY = parentTop - this.container.offsetTop + block.offsetTop;
    if (offsetY > 0) {
      if (parentHeight < window.innerHeight) {
        offsetY -= targetHeight / 2 - (blockHeight * scale) / 2;
      }
      if (parentTop > 0) {
        offsetY -= parentTop;
      }
    }

    const leftWidth = selectedRow
      .slice(0, selectedRow.indexOf(block))
      .reduce(
        (offset, img) =>
          offset + parseInt(window.getComputedStyle(img).width, 10) * scale,
        0,
      );
    const leftOffsetX = parentWidth / 2 - (blockWidth * scale) / 2 - leftWidth;

    const rows = imgs.reduce(function (rows, block) {
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
            .slice(...[selectedIndex, rowIndex].sort())
            .reduce((offset, height) => offset + height, 0) -
        offsetY;
      row
        .map((img) => ({
          img: img,
          width: parseInt(window.getComputedStyle(img).width, 10),
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
              parseInt(window.getComputedStyle(item.img).height, 10)) *
            100;
          item.img.style.transformOrigin = "0% 0%";
          item.img.style.transform =
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
