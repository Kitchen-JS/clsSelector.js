class clsLoadingElement {
  constructor(options) {
    if (!options || typeof options !== "object") options = {};
    this.init(options);
  }
  init(options) {
    this.options = options || this.options;
    this.container =
      options.containerEl || document.getElementsByTagName("body")[0];
    this.size = options.size || "148px";
    this.parent = options.parent;
    this.loadingType = options.loadingType || "html-spinner";
    this.loadingElement = document.createElement("i");
    this.loadingElement.className = this.loadingType;
    this.loadingElement.style.fontFamily = "pfi";
    this.loadingElement.style.position = "absolute";
    this.loadingElement.style.borderColor = options.parent.darkMode
      ? options.parent.darkModeColor
      : options.parent.color;
    this.loadingElement.style.borderBottomColor = options.parent.darkMode
      ? options.parent.color
      : options.parent.darkModeColor;
    this.loadingElement.style.zIndex = 999999999;
    this.loadingElement.style.display = "none";
    this.hide = this.hide.bind(this);
    this.loadingBar = this.loadingBar.bind(this);
    this.show = this.show.bind(this);
    this.toggleColors = this.toggleColors.bind(this);
    this.container.appendChild(this.loadingElement);
    if (this.loadingBarEl) this.loadingBarEl.remove();
    if (this.loadingBarContainer) this.loadingBarContainer.remove();
    if (this.loadingBarEl) this.loadingBarEl = "";
    if (this.loadingBarContainer) this.loadingBarContainer = "";
  }
  loadingBar(percentLoaded) {
    if (!this.loadingBarEl) {
      this.loadingBarEl = document.createElement("div");
      this.loadingBarEl.classList.add(
        "bg-gold",
        "htmlLoadingBar",
        "text-secondary",
        "text-center"
      );
      this.loadingElement.appendChild(this.loadingBarEl);
    }
    if (!this.loadingBarContainer) {
      this.loadingBarContainer = document.createElement("div");
      this.loadingElement = this.loadingBarContainer;
      this.loadingElement.style.width = "24px";
      this.loadingElement.className = "html-loading-bar";
      this.loadingElement.classList.add("bg-secondary", "px-0");
      this.loadingElement.style.position = "absolute";
      this.loadingElement.style.width = this.width || "60%";
      this.loadingElement.style.top = this.top || "50%";
      this.loadingElement.style.left = this.left || "20%";
      this.loadingElement.style.zIndex = 999999999;
      this.loadingElement.appendChild(this.loadingBarEl);
      this.container.appendChild(this.loadingElement);
    }
    this.loadingBarEl.style.width = percentLoaded + "%";
    this.loadingBarEl.innerHTML = "Loading ... " + percentLoaded + "%";
    this.show();
  }
  show(position = {left: '', top: ''}, blocking = false) {
    this.loadingElement.style.display = "block";
  }
  hide() {
    let context = this;
    this.loadingElement.style.display = "none";
  }
  toggleColors() {
    this.loadingElement.style.borderColor = this.parent.darkMode
      ? this.parent.darkModeColor
      : this.parent.color;
    this.loadingElement.style.borderBottomColor = this.parent.darkMode
      ? this.parent.darkModeHeaderColor
      : this.parent.headerColor;
  }
}
