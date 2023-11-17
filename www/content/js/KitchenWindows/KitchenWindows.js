// depends on DraggableWindow class
class DraggableWindows {
  constructor(options) {
    this.options = typeof options === "object" ? options : { windows: [] };
    this.theme = this.options.theme;
    this.hoverTracking = typeof options.hoverTracking !== "undefined" ? options.hoverTracking : false;
    this.autoHide = this.options.autoHide;
    this.hiddenToolBar = options.hiddenToolBar;
    this.toolBarVisible = true;
    this.themeColors = this.options.themeColors;
    this.backgroundImage = this.options.backgroundImage;
    this.backgroundVisible = this.options.backgroundVisible;
    this.darkModeLogo = this.options.darkModeLogo;
    this.options.authRequired = options.authRequired;
    this.popups = [];
    this.darkMode = options.darkMode;
    this.windows =
      typeof this.options.windows === "object"
        ? this.options.windows
        : new Array();
    this.authRequired = options.authRequired;
    this.limit =
      typeof this.options.limit === "number" ? this.options.limit : 10; // how many windows of each kind can be allowed, keys off of window.title
    //developer mode
    this.developerMode =
      typeof this.options.developerMode === "boolean"
        ? this.options.developerMode
        : window.location.href.split("/").includes("localhost:44333"); //false; - change this to false to turn all logging off.
    if (this.developerMode)
      console.log(
        "GlobalWindowManager detected localhost, developerMode enabled. You can turn this off by changing line 10 in TEAMclsDraggableWindows.js"
      );
    // with database driven logic (below)
    let devModeOption = this.developerMode;
    // toolbar dynamic dimensions:
    this.toolBarWidth = (options.toolBarWidth || 82);
    //`````````````````````````````````````````````````````````````````````````//
    // TODO: Implement each of these in the windows system:
    this.title = options.title || "Kitchen Windows"; // will appear in places where title is needed
    this.toolBarPosition = options.toolBarPosition || "top"; // where the toolbar is located
    this.toolBarItems =
      typeof options.toolBarItems !== "undefined" ? options.toolBarItems : [];
    this.state = {};
    this.setTheme(this.theme);
    this.logo = options.logo;
    this.logoOnclick = options.logoOnclick;
    this.EnableFavorites =
      typeof options.EnableFavorites === "undefined"
        ? false
        : options.EnableFavorites; // if false, favorites will not appear in menu
    this.EnableCollections =
      typeof options.EnableCollections === "undefined"
        ? false
        : options.EnableCollections;
    //````````````````````````````````````````````````````````````````````````//
    this.container = options.container;
    this.offset = this.toolBarWidth;
    this.halfset = this.toolBarWidth / 2;
    this._offset = this.offset + 'px';
    this.toolBarWidth = this.toolBarWidth + "px";
    this.isMobile =
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i);
    this.focus = this.focus.bind(this);
    this.removeWindow = this.removeWindow.bind(this);
    this.restoreWindow = this.restoreWindow.bind(this);
    this.minimize = this.minimize.bind(this);
    this.browserWindowResize = this.browserWindowResize.bind(this);
    this.createToolBar = this.createToolBar.bind(this);
    this.hideToolbar = this.hideToolbar.bind(this);
    this.showToolbar = this.showToolbar.bind(this);
    this.onload =
      typeof options.onload === "function" ? options.onload : function () {};
    this.toolBarButtonIcons = [];
    //init fn
    if (this.options.authRequired) {
      this.login();
    } else {
      this.init();
    }
    this.createShadows();
    this.toolBarButtons = [];
    this.last = 0;
    this.ready = false;
    this.init = this.init.bind(this);
    this.saveSettings = this.saveSettings.bind(this);
    this.checkScreenSize = this.checkScreenSize.bind(this);
    this.loadBootStrap = function () {
      // add a short delay to ensure boostrap load after all elements are created in the DOM
      setTimeout(loadBootStrap, 500);
      if (this.developerMode)
        console.log("bootstrap load triggered on creation of new window.");
    };
    // track size state and position of windows.
    window.onresize = this.browserWindowResize;
  }
  async login() {
    // console.log("session:", JSON.parse(sessionStorage.getItem('session')), getTimestampInSeconds())
    if (
      JSON.parse(sessionStorage.getItem("session")) &&
      JSON.parse(sessionStorage.getItem("session")).expires_at >=
        getTimestampInSeconds()
    ) {
      this.init();
      return;
    }
    let context = this;
    let loginForm = `
      <form class="bg-white shadow-md w-full rounded px-8 pt-6 pb-8 mb-4">
        <h1 class="text-center bg-white shadow-md w-full rounded mb-4">${this.title}</h1>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
            Username
          </label>
          <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Username">
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
            Password
          </label>
          <input class="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************">
        </div>
        <div class="flex items-center m-2 w-full justify-between">
          <button class="signInButton btn-gold font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
            Sign In
          </button>
          <button style="background-color: green;" class="signUpButton text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
          Sign Up
          </button>
          <a class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
            Forgot Password?
          </a>
        </div>
        <p class="text-center text-gray-500 text-xs">
          &copy;2022 Kitchen Windows. All rights reserved.
        </p>
      </form>
    `;
    let formContainer = document.createElement("div");
    formContainer.classList.add(
      "flex",
      "content-center",
      "items-center",
      "w-full"
    );
    formContainer.innerHTML = loginForm;
    let signInButton = formContainer.querySelector(".signInButton");
    signInButton.onclick = async function (e) {
      let options = {
        email: formContainer.querySelector("#username").value,
        password: formContainer.querySelector("#password").value,
      };
      // console.log(options);
      logIn(options, context);
    };
    let signUpButton = formContainer.querySelector(".signUpButton");
    signUpButton.onclick = async function (e) {
      let options = {
        email: formContainer.querySelector("#username").value,
        password: formContainer.querySelector("#password").value,
      };
      signUp(options, context);
    };
    this.modal(formContainer, false);
  }
  async init() {
    let context = this;
    if (this.authRequired) {
      // web worker to check for session expiration
      this.sessionCheck = new Worker("./util/SessionWorker.js");
      this.sessionCheck.onmessage = (message) => {
        if (
          JSON.parse(sessionStorage.getItem("session")) &&
          JSON.parse(sessionStorage.getItem("session")).expires_at <=
            getTimestampInSeconds()
        ) {
          context.warn(
            "Your Session has expired, please log in again.",
            function () {
              logOut();
              window.location.reload();
              return;
            }
          );
        } else {
          let timeRemaining = Math.abs(
            JSON.parse(sessionStorage.getItem("session")).expires_at -
              getTimestampInSeconds()
          );
          console.log(`Session expires in: ${timeRemaining / 60} minutes.`);
        }
      };
    }
    // set dev mode
    if (this.developerMode) {
      // set timer to record times of when things load
      context.startLoad = new Date();
      context.timer = function () {
        const date1 = context.startLoad;
        const date2 = new Date();
        const diffTime = Math.abs(date2 - date1);
        return diffTime + " ms";
      };
      console.log(
        "GlobalWindowManager: Loading Started ... " + context.timer()
      );
    }
    this.loadingSpinner = new clsLoadingElement({parent: this, container: this.container});
    this.loadingSpinner.show();
    this.createToolBar().then(async function (success) {
      if (typeof context.onload === "function") context.onload();
      context.createSettingsWindow();
      context.browserWindowResize();
    });
    this.AppsManager = new AppsManager({
      parent: this,
      developerMode: this.developerMode,
    });
    if (this.hoverTracking) document.addEventListener('mousemove', (e)=>{ this.hoverWindow(e)});
    this.getSettings();
  }
  async createToolBar() {
    let context = this;
    let newWindow = new DraggableWindow({
      parent: context,
      container: this.container,
      zIndex: 9999,
      body: document.createElement("div"),
      footer: null,
      header: false,
      snapping: false,
      resizeable: false,
      height: "100%",
      width: "100%",
      locked: false,
      id: "workspaceToolBar-" + parseInt(Date.now()),
      close: false,
      callouts: false,
      hasManager: true,
    });
    context.windows.push(newWindow);
    newWindow.scrollButtons.style.display = "none";
    context.toolBar = newWindow;
    context.flexDirection =
      this.toolBarPosition === "bottom" || this.toolBarPosition === "top"
        ? "row"
        : "column";
    context.toolBar.body.classList.add(
      "flex",
      "justify-start",
      "items-center",
      "m-0",
      "p-0"
    );
    if (this.toolBarPosition === "bottom" || this.toolBarPosition === "top") {
      // overflow X
      context.toolBar.body.style.overflowX = "auto";
      context.toolBar.body.style.overflowY = "hidden";
    } else {
      context.toolBar.body.style.overflowX = "hidden";
      context.toolBar.body.style.overflowY = "auto";
    }
    context.toolBar.header.style.display = "none";
    // container for static buttons only
    context.staticButtons = document.createElement("div");
    context.staticButtons.classList.add(
      context.toolBarPosition === "left" || context.toolBarPosition === "right"
        ? "flex-col"
        : "flex-row",
      context.toolBarPosition === "left" || context.toolBarPosition === "right"
        ? "flex"
        : "inline-flex",
      context.toolBarPosition === "left" || context.toolBarPosition === "right"
        ? "vertical"
        : "horizontal",
      "justify-between",
      "items-center"
    );
    context.toolBar.body.appendChild(context.staticButtons);
    // hamburger:
    context.hamburger = document.createElement("i");
    context.hamburger.setAttribute("aria-labeled-by", "id");
    context.hamburger.classList.add(
      "is-2",
      "pfi-hamburger",
      "m-2",
      "text-center"
    );
    context.hamburger.style.color = this.darkMode
      ? context.darkModeColor
      : context.color;
    context.hamburger.title = "Expand Toolbar"; //TODO: add data source
    context.hamburger.style.cursor = "pointer";
    context.hamburger.id = "toolbar-hamburger";
    context.hamburger.addEventListener("click", function (e) {
      if (context.expanded) {
        context.collapseToolbar();
      } else {
        context.expandToolBar();
      }
    });

    context.toolBar.window.style.backgroundColor = `${
      context.darkMode
        ? context.darkModeBackgroundColor
        : context.backgroundColor
    }`;
    context.toolBar.window.style.height = "100%";
    context.toolBar.window.style.width = "100%";
    context.staticButtons.appendChild(context.hamburger);
    // x button to collapse menu
    context.closeToolBar = document.createElement("i");
    context.closeToolBar.setAttribute("aria-labeled-by", "id");
    context.closeToolBar.classList.add(
      "is-2",
      "pfi-math-multiply",
      "m-2",
      "p-2"
    );
    context.closeToolBar.style.color = context.darkMode
      ? context.darkModeColor
      : context.color;
    if (context.isMobile)
      context.closeToolBar.style.height = context.offset + "px";
    context.closeToolBar.title = "Collapse Toolbar"; //TODO: add data source
    context.closeToolBar.style.cursor = "pointer";
    context.closeToolBar.id = "toolbar-closeToolBar";
    context.closeToolBar.style.display = "none";
    context.closeToolBar.addEventListener("click", function (e) {
      if (context.expanded) {
        context.collapseToolbar();
      } else {
        context.expandToolBar();
      }
    });
    context.staticButtons.appendChild(context.closeToolBar);

    // logout button
    context.toolBar.body.style.backgroundColor = context.darkMode
      ? context.darkModeHeaderColor
      : context.headerColor;
    context.toolBar.body.style.whiteSpace = "nowrap";
    context.toolBar.body.style.flexDirection = context.flexDirection;
    context.toolBar.draggableContent.style.position = "fixed";
    context.toolBar.draggableContent.style.zIndex = "9999";
    newWindow.draggableContent.style.border = "none";
    // click outside info window to close:
    document.addEventListener("click", function (event) {
      context.closeToolbarWindows(event);
    });
    context.toolBar.body.style.paddingBottom = "1px";
    context.toolBar.body.style.transition = "all 0.3s ease-in-out";
    context.toolBar.window.style.transition = "all 0.3s ease-in-out";
    window.addEventListener("orientationchange", (e) => {
      context.browserWindowResize();
    });
    // load swipe listeners:
    if (this.isMobile) {
      document.addEventListener("swiped-left", function (e) {
        if (e.target.id === context.toolBar.id + "-body" ||
         e.target === context.hideToolBarButton)  {
          context.swipe("left");
         }
      });
      document.addEventListener("swiped-right", function (e) {
        if (e.target.id === context.toolBar.id + "-body" ||
        e.target === context.hideToolBarButton)  {
          context.swipe("right");
        }
      });
      document.addEventListener("swiped-up", function (e) {
        if (e.target.id === context.toolBar.id + "-body" ||
        e.target === context.hideToolBarButton)  {
           context.swipe("up");
        }
      });
      document.addEventListener("swiped-down", function (e) {
        if (e.target.id === context.toolBar.id + "-body" ||
        e.target === context.hideToolBarButton)  {
           context.swipe("down");
        }
      });
    }
    if (this.autoHide) {
      this.setAutoHide();
      this.toolBar.body.addEventListener('mouseenter', (e)=> {
        context.setAutoHide();
      });
      this.toolBar.body.addEventListener('mouseleave', (e)=> {
        context.setAutoHide();
      });
      this.toolBar.body.addEventListener('click', (e)=> {
        context.setAutoHide();
      });
    }
    await this.createCustomToolBarIcons();
    this.hideToolBarButtons();
    this.toggleToolBarButton();
    return;
  }
  createSettingsWindow() {
    let context = this;
    let container = document.createElement("div");
    container.classList.add(
      "inline-flex",
      "items-center",
      "content-center",
      "mt-0",
      "w-full",
    );
    let baseTemplate = `
                <div class="w-full p-5 text-center content-center items-center">
                    <h4 class="pt-2 fc-header-title settings-buttons">
                        <i role="button" class="pfi-profile is-2 m-3" title="My Profile"></i>
                        <i role="button" class="pfi-cube-logout is-2 m-3" title="Log out ... "></i>
                        <i role="button" class="pfi-light-bulb-lit is-2 mb-3 ms-3 me-3 mt-0" title="Toggle light/dark mode ... "></i>
                        <i role="button" class="inline-block pfi-thumbtack is-2" title="Toggle hide/show toolbar... "></i>
                    </h4>
                    <h4 class="pt-2 fc-header-title">Theme:</h4>
                    <select class="m-3 themeSelector" style="width:90%; color:black !important;">
                    </select>
                    <h4 class="pt-2 fc-header-title">Tool Bar Position:</h4>
                    <select class="m-3 toolBarPositionSelector" style="width:66%; color:black !important;">
                        <option id="top">top</option>
                        <option id="bottom">bottom</option>
                        <option id="left">left</option>
                        <option id="right">right</option>
                    </select>
                    <button class="saveSettings btn btn-gold">Save Settings</button>
                </div>`;
    container.innerHTML = baseTemplate;
    context.settingsButtons = container.querySelector(".settings-buttons");
    // theme selector
    this.themeSelector = container.querySelector(".themeSelector");
    context.themeColors.forEach((theme) => {
      let themeOption = document.createElement("option");
      themeOption.value = theme.name;
      themeOption.innerHTML = theme.name;
      context.themeSelector.appendChild(themeOption);
    });
    this.themeSelector.onchange = (e) => {
      context.setTheme(e.target.value);
      context.changeColors();
    };
    // theme save button
    this.saveButton = container.querySelector(".saveSettings");
    this.saveButton.onclick = (e) => {
      context.saveSettings();
    };
    if (!this.authRequired) this.saveButton.style.display = "none";
    // tool bar position selector
    this.toolBarPositionSelector = container.querySelector(
      ".toolBarPositionSelector"
    );
    this.toolBarPositionSelector.onchange = (e) => {
      context.toolBarPosition = e.target.value;
      context.browserWindowResize();
      context.collapseToolbar();
    };
    this.toolBarPositionSelector
      .querySelectorAll("option")
      .forEach((option) => {
        if (option.innerHTML === context.toolBarPosition) {
          context.toolBarPositionSelector.value = option.innerHTML;
        }
      });
    // profile:
    container.querySelector(".pfi-profile").addEventListener("click", (e) => {
      alert("Profile app coming soon!");
    });
    // logout:
    container
      .querySelector(".pfi-cube-logout")
      .addEventListener("click", (e) => {
        // login logout button
        let closeConfirmHeading = (document.createElement(
          "div"
        ).innerHTML = `Are you sure you want to log out?`);
        context.confirm(closeConfirmHeading, logOut, function () {
          return;
        });
      });
    // light-dark mode button:
    context.lightDarkMode = container.querySelector(".pfi-light-bulb-lit");
    if (context.darkMode) {
      context.lightDarkMode.classList.add("pfi-light-bulb");
      context.lightDarkMode.classList.remove("pfi-light-bulb-lit");
    } else {
      context.lightDarkMode.classList.add("pfi-light-bulb-lit");
      context.lightDarkMode.classList.remove("pfi-light-bulb");
    }
    context.lightDarkMode.style.color = context.darkMode
      ? context.darkModeColor
      : "black";
    context.lightDarkMode.style.cursor = "pointer";
    context.lightDarkMode.id = "toolbar-lightDarkMode";
    context.lightDarkMode.addEventListener("click", function (e) {
      context.darkMode = !context.darkMode;
      context.changeColors();
      context.lightDarkMode.style.color = context.darkMode
        ? context.darkModeColor
        : "gold";
      if (context.darkMode) {
        context.lightDarkMode.classList.add("pfi-light-bulb");
        context.lightDarkMode.classList.remove("pfi-light-bulb-lit");
      } else {
        context.lightDarkMode.classList.add("pfi-light-bulb-lit");
        context.lightDarkMode.classList.remove("pfi-light-bulb");
      }
    });
    // auto-hide toolbar button:
    context.autoHideButton = container.querySelector(".pfi-thumbtack");
    if (context.autoHide) {
      context.autoHideButton.style.transform = "";
    } else {
      context.autoHideButton.style.transform = "rotate(60deg) translateY(12px)";
    }
    context.autoHideButton.style.color = context.autoHide
    ? (context.darkMode ? context.darkModeColor : context.color)
    : "green";
    context.autoHideButton.style.cursor = "pointer";
    context.autoHideButton.id = "toolbar-autoHideButton";
    context.autoHideButton.addEventListener("click", function (e) {
      context.autoHide = !context.autoHide;
      context.browserWindowResize();
      context.autoHideButton.style.color = context.autoHide
        ? (context.darkMode ? context.darkModeColor : context.color)
        : "green";
        if (context.autoHide) {
          context.autoHideButton.style.transform = "";
        } else {
          context.autoHideButton.style.transform = "rotate(60deg) translateY(12px)";
        }
        if (context.autoHide) {
          context.setAutoHide();
          context.toolBar.body.addEventListener('mouseenter', context.setAutoHide);
          context.toolBar.body.addEventListener('mouseleave',  context.setAutoHide);
          context.toolBar.body.addEventListener('click', context.setAutoHide);
        } else {
          context.showToolbar();
          context.setAutoHide();
          context.toolBar.body.removeEventListener('mouseenter', context.setAutoHide);
          context.toolBar.body.removeEventListener('mouseleave',  context.setAutoHide);
          context.toolBar.body.removeEventListener('click', context.setAutoHide);
        }
    });
    // styles applied to all buttons:
    context.settingsButtons.querySelectorAll("i").forEach((button) => {
      button.style.cursor = "pointer";
    });
    context.settingsWindow = this.createPopup(
      "toolbar-settings-app",
      "Settings",
      container
    );
  }
  saveSettings() {
    let context = this;
    if (this.authRequired && JSON.parse(sessionStorage.getItem("user"))) {
      // save running Apps:
      this.runningApps = [];
      this.windows.map((window) => {
        if (window.id !== context.toolBar.id) {
          context.runningApps.push({
            position: window.orientation,
            AppID: window.AppID,
            metadata: window.metadata || {},
          });
        }
      });
      if (typeof this.state.toolBarPosition === "undefined")
        this.state.toolBarPosition = this.toolBarPositionSelector.value;
      if (!this.state.theme) this.state.theme = this.theme;
      this.state.darkMode = this.darkMode;
      SaveSettings({
        id: this.state.id,
        settings: this.state,
        runningApps: this.runningApps,
      });
    }
  }
  async getSettings() {
    let context = this;
    if (this.authRequired && JSON.parse(sessionStorage.getItem("user"))) {
      await GetSettings()
        .then((res) => {
          // console.log(res)
          res && res.length
            ? context.setSettings(res[0])
            : context.setSettings(context.state);
        })
        .catch((err) => console.error(err));
    }
  }
  setSettings(state) {
    // console.log("set state:", state)
    let context = this;
    this.state =
      typeof state.settings === "object" ? state.settings : this.state;
    this.state.id = state.id;
    this.toolBarPosition = this.state.toolBarPosition;
    this.darkMode = this.state.darkMode;
    this.runningApps = state.runningApps;
    this.toolBarPositionSelector
      .querySelectorAll("option")
      .forEach((option) => {
        if (option.innerHTML === context.toolBarPosition) {
          context.toolBarPositionSelector.value = option.innerHTML;
        }
      });
    this.themeSelector.querySelectorAll("option").forEach((option) => {
      if (option.innerHTML === context.state.theme) {
        context.themeSelector.value = option.innerHTML;
      }
    });
    if (this.runningApps && this.runningApps.length) {
      this.runningApps = state.runningApps;
      this.runningApps.forEach((app) => {
        app.orientation = app.position;
        context.AppsManager.start(app);
      });
    }
    this.setTheme(this.state.theme);
    this.changeColors();
    this.adjustNavPosition();
    this.browserWindowResize();
    this.collapseToolbar();
  }
  createLogo() {
    let context = this;
    this.logoImage = document.createElement("IMG");
    this.logoImage.setAttribute("src", this.logo);
    this.logoImage.setAttribute("alt", this.title);
    this.logoImage.style = `
      height: ${this.offset}px;
      width:  ${this.offset}px;
      padding: 1rem;
      position: fixed;
      z-index:9999999;
      background-color: ${
        this.darkMode ? this.darkModeHeaderColor : this.headerColor
      };
    `;
    this.divider = document.createElement("div");
    this.divider.style.transition = "all 0.3s ease-in-out";
    this.logoImage.title = this.title; //TODO: add data source
    this.logoImage.style.cursor = "pointer";
    this.logoImage.style.transition = "all 0.3s ease-in-out";
    this.logoImage.id = "toolbar-logoImage";
    this.logoImage.addEventListener("click", function (e) {
      if (typeof context.logoOnclick === "function") context.logoOnclick();
    });
    this.toolBar.body.appendChild(this.divider);
    this.toolBar.body.appendChild(this.logoImage);
    this.positionLogo();
  }
  positionLogo() {
    if (!this.logo) return;
    if (this.toolBarPosition === "left") {
      this.divider.style = `
      height: 7px;
      width: ${this.offset * 0.75}px;
      position: fixed;
      left: ${this.toolBarVisible ? (this.offset * 0.75) / 2 : "-" + this.toolBarWidth};
      bottom: ${this.toolBarWidth};
      z-index:99999999;
      background-color: ${
        this.darkMode ? this.headerColor : this.darkModeHeaderColor
      };
      `;
      this.logoImage.style.bottom = "0px";
      this.logoImage.style.left = this.toolBarVisible ? "0px" : `-${this.toolBarWidth}`;
      this.logoImage.style.top = "";
      this.logoImage.style.right = "";
    } else if (this.toolBarPosition === "top") {
      this.divider.style = `
      height: ${this.offset * 0.75}px;
      width: 3px; 
      position: fixed;
      right: ${this.toolBarWidth};
      top: ${this.toolBarVisible ? (this.offset * 0.75) / 2 : "-" + this.toolBarWidth};
      z-index:9999999;
      background-color: ${
        this.darkMode ? this.headerColor : this.darkModeHeaderColor
      };
      `;
      this.logoImage.style.top = this.toolBarVisible ? "0px" : `-${this.toolBarWidth}`;
      this.logoImage.style.right = "0px";
      this.logoImage.style.left = "";
      this.logoImage.style.bottom = "";
    } else if (this.toolBarPosition === "right") {
      this.divider.style = `
      height: 7px;
      width: ${this.offset * 0.75}px;
      position: fixed;
      bottom:${this.toolBarWidth};
      right: ${this.toolBarVisible ? (this.offset * 0.75) / 2 : "-" + this.toolBarWidth};
      z-index:9999999;
      background-color: ${
        this.darkMode ? this.headerColor : this.darkModeHeaderColor
      };
      `;
      this.logoImage.style.bottom = "0px";
      this.logoImage.style.right = this.toolBarVisible ? "0px" : `-${this.toolBarWidth}`;
      this.logoImage.style.left = "";
      this.logoImage.style.top = "";
    } else {
      this.divider.style = `
      height: ${this.offset * 0.75}px;
      width: 3px; 
      position: fixed;
      right:${this.toolBarWidth};
      bottom: ${this.toolBarVisible ? (this.offset * 0.75) / 2 : "-" + this.toolBarWidth};
      z-index:9999999;
      background-color: ${
        this.darkMode ? this.headerColor : this.darkModeHeaderColor
      };
      `;
      this.logoImage.style.bottom = this.toolBarVisible ? "0px" : `-${this.toolBarWidth}`;
      this.logoImage.style.right = "0px";
      this.logoImage.style.left = "";
      this.logoImage.style.top = "";
    }
    if (this.isMobile && this.logo) {
      this.logoImage.style.display = "none";
      this.divider.style.display = "none";
    } else {
      this.logoImage.style.display = "flex";
      this.divider.style.display = "flex";
    }
  }
  createBackground() {
    let context = this;
    if (context.backgroundVisible != true) {
      return;
    }
    this.background = document.createElement("IMG");
    if (this.logo || this.backgroundImage) {
      this.background.setAttribute(
        "src",
        this.backgroundImage
          ? this.backgroundImage
          : this.darkMode
          ? this.darkModeLogo
            ? this.darkModeLogo
            : this.logo
          : this.logo
      );
      if (!this.backgroundImage) {
        if (context.logo && !context.backgroundImage) {
          context.background.style.display = "none";
        }
        context.background.style.position = "fixed";
        context.background.style.opacity = this.darkMode
          ? this.darkModeLogo
            ? ".5"
            : 0
          : ".5";
      }
      this.background.setAttribute("alt", this.title + " background image");
      // adjustments after image loads
      this.background.onload = function () {
        if (context.logo && !context.backgroundImage) {
          context.background.style.display = "block";
          context.background.style.top =
            window.innerHeight / 2 -
            context.background.getBoundingClientRect().height / 2 +
            "px";
          context.background.style.left =
            window.innerWidth / 2 -
            context.background.getBoundingClientRect().width / 2 +
            "px";
        } else {
          context.background.style = `
          display: inline-block;
          vertical-align: middle;
          object-fit: cover;
        `;
          if (
            context.background.getBoundingClientRect().width >
            context.background.getBoundingClientRect().height
          ) {
            context.background.style.height = "100%";
            context.background.style.width = "auto";
          } else {
            context.background.style.width = "100%";
            context.background.style.height = "auto";
          }
        }
      };
      this.toolBar.window.appendChild(this.background);
    }
  }
  // create static toolbar icons that link to static apps
  async createCustomToolBarIcons() {
    let context = this;
    if (typeof this.toolBarItems !== "undefined" && this.toolBarItems.length) {
      await this.toolBarItems.forEach(async (item) => {
        let buttonContainer = document.createElement("span");
        buttonContainer.classList.add(
          "m-2",
          "inline-flex",
          "content-center",
          "items-center"
        );
        if (typeof item.init === "function") await item.init(context);
        let Description = document.createElement("label");
        Description.classList.add("static-toolbar-button-text");
        Description.style.color = context.darkMode
          ? context.darkModeColor
          : context.color;
        Description.innerHTML = item.Description;
        Description.style.display = "none";
        let toolBarIcon = document.createElement("i");
        toolBarIcon.id =
          typeof item.id !== "undefined"
            ? item.id
            : "New-" + item.ClassName + "-Window-Button";
        Description.setAttribute("for", toolBarIcon.id);
        toolBarIcon.setAttribute("aria-labeled-by", "id");
        toolBarIcon.classList.add("is-2", item.Icon, "mx-2");
        toolBarIcon.style.color = item.IconColor
          ? item.IconColor
          : context.darkMode
          ? context.darkModeColor
          : context.color;
        item.IconColor
          ? (toolBarIcon.hasColor = true)
          : (toolBarIcon.hasColor = false);
        buttonContainer.style.cursor = "pointer";
        toolBarIcon.style.cursor = "pointer";
        Description.style.cursor = "pointer";
        buttonContainer.setAttribute("title", item.Description);
        buttonContainer.addEventListener("click", async function () {
          context.collapseToolbar();
          if (typeof item.onclick === "function") {
            item.onclick(context);
          } else if (typeof item.URL === "string") {
            window.location.href = item.URL;
          } else {
            await context.AppsManager.inject(item.ClassFile).then(
              async function () {
                context.AppsManager.onclick(item);
              }
            );
          }
        });
        // this is specific to T3 buttons, maybe find a way to refactor
        if (item.id === "toolbar-info-button")
          context.infoButton = buttonContainer;
        if (item.id === "toolbar-FAQ-button")
          context.FAQWindowButton = buttonContainer;
        if (item.id === "toolbar-newWSI-button")
          context.newAppButton = buttonContainer;
        if (item.id === "toolbar-PECPortalFeedback-button")
          context.PECPortalFeedbackButton = buttonContainer;
        if (item.id === "toolbar-Settings-button")
          context.settingsButton = buttonContainer;
        //--------------------------------------------------------------------------
        buttonContainer.id =
          typeof item.id !== "undefined"
            ? item.id
            : "New-" + item.ClassName + "-Window-Button";
        buttonContainer.ariaLabel = item.Description;
        buttonContainer.setAttribute("role", "button");
        buttonContainer.appendChild(toolBarIcon);
        buttonContainer.appendChild(Description);
        context.toolBarButtonIcons.push(toolBarIcon);
        context.toolBar.body.appendChild(buttonContainer);
      });
      //logo
      if (typeof context.logo === "string") context.createLogo();

    }
    context.loadingSpinner.hide();
  }
  closeToolbarWindows(event) {
    let context = this;
    if (event) {
      if (
        typeof context.appsManagerWindow === "object" &&
        context.appsManagerWindow &&
        context.appsManagerWindow.window !== event.target &&
        !context.appsManagerWindow.window.contains(event.target) &&
        context.newAppButton !== event.target &&
        !context.newAppButton.contains(event.target)
      ) {
        context.appsManagerWindow.window.classList.add("hidden");
        context.appsManagerWindow.window.classList.remove("flex");
      }
      if (
        typeof context.infoWindow === "object" &&
        context.infoWindow &&
        context.infoWindow.window !== event.target &&
        !context.infoWindow.window.contains(event.target) &&
        context.infoButton !== event.target &&
        !context.infoButton.contains(event.target)
      ) {
        context.infoWindow.window.classList.add("hidden");
        context.infoWindow.window.classList.remove("flex");
      }
      if (
        typeof context.FAQWindow === "object" &&
        context.FAQWindow &&
        context.FAQWindow.window !== event.target &&
        !context.FAQWindow.window.contains(event.target) &&
        context.FAQWindowButton !== event.target &&
        !context.FAQWindowButton.contains(event.target)
      ) {
        context.FAQWindow.window.classList.add("hidden");
        context.FAQWindow.window.classList.remove("flex");
      }
      if (
        typeof context.PECPortalFeedback === "object" &&
        context.PECPortalFeedback &&
        context.PECPortalFeedback.window !== event.target &&
        !context.PECPortalFeedback.window.contains(event.target) &&
        context.PECPortalFeedbackButton !== event.target &&
        !context.PECPortalFeedbackButton.contains(event.target)
      ) {
        context.PECPortalFeedback.window.classList.add("hidden");
        context.PECPortalFeedback.window.classList.remove("flex");
      }
      if (
        typeof context.settingsWindow === "object" &&
        context.settingsWindow &&
        context.settingsWindow.window !== event.target &&
        !context.settingsWindow.window.contains(event.target) && context.settingsButton &&
        context.settingsButton !== event.target && 
        !context.settingsButton.contains(event.target)
      ) {
        context.settingsWindow.window.classList.add("hidden");
        context.settingsWindow.window.classList.remove("flex");
      }
    } else {
      if (this.infoWindow) {
        this.infoWindow.window.classList.add("hidden");
        this.infoWindow.window.classList.remove("flex");
      }
      if (this.appsManagerWindow) {
        this.appsManagerWindow.window.classList.add("hidden");
        this.appsManagerWindow.window.classList.remove("flex");
      }
      if (this.FAQWindow) {
        this.FAQWindow.window.classList.add("hidden");
        this.FAQWindow.window.classList.remove("flex");
      }
      if (this.PECPortalFeedback) {
        this.PECPortalFeedback.window.classList.add("hidden");
        this.PECPortalFeedback.window.classList.remove("flex");
      }
      if (this.settingsWindow) {
        this.settingsWindow.window.classList.add("hidden");
        this.settingsWindow.window.classList.remove("flex");
      }
    }
  }
  removeWindow(id) {
    //remove from memory
    this.windows = this.windows.filter((x) => {
      return x.id !== id;
    });
    this.toolBarButtons = this.toolBarButtons.filter((x) => {
      return x.id !== id + "-toolBar-Btn";
    });
    let button = document.querySelector("#" + id + "-toolBar-Btn");
    if (button) button.remove();
    // remove window from UI
    let currentWindow = document.querySelector("#" + id);
    if (currentWindow) currentWindow.remove();
    this.bodyScroll();
  }
  async addWindow(options) {
    let context = this;
    this.bodyScroll(false);
    options.parent = this;
    if (typeof options.container !== "object" || !options.container) {
      options.container = this.container;
    }
    options.hasManager = true;
    let newWindow = new DraggableWindow(options);
    newWindow.orientation = options.orientation || options.position;
    newWindow.AppID = options.AppID;
    newWindow.draggableContent.appendChild(options.loadingSpinner.loadingElement);
    newWindow.parent = this;
    if (newWindow.onOpen) {
      newWindow.onOpen();
    }
    this.windows.push(newWindow);
    //inject if any dependencies
    inject(context, newWindow);
    newWindow.draggableContent.addEventListener(
      "mousedown",
      function (e) {
        this.focus(newWindow);
      }.bind(this)
    );
    // TODO: move this to the child DraggableWindow class, have the parent queryselect the close button and add removeWindow as a listener
    if (newWindow.close) {
      const closeWindow = function (e) {
        let closeConfirmHeading = `Are you sure you want to close '${newWindow.title}'`;
        let confirm = (e) => {
          if (newWindow.onClose) {
            newWindow.onClose();
          }
          context.removeWindow(newWindow.id);
        };
        context.confirm(closeConfirmHeading, confirm, context.closeModal);
      }.bind(this);
      this.createToolBarButton(newWindow, closeWindow);
      let closeButton =
        newWindow.draggableContent.querySelector(".closeWindowButton");
      closeButton.onclick = closeWindow;
    }
    if (newWindow.minimize) {
      let minimizeButton = newWindow.draggableContent.querySelector(
        ".minimizeWindowButton"
      );
      minimizeButton.addEventListener(
        "click",
        function (e) {
          if (newWindow.onMinimize) {
            newWindow.onMinimize();
          }
          this.minimize(newWindow.id);
        }.bind(this)
      );
    }
    if (typeof newWindow.maximize === "undefined" || newWindow.maximize) {
      let maximizeButton = newWindow.draggableContent.querySelector(
        ".maximizeWindowButton"
      );
      maximizeButton.addEventListener(
        "click",
        function (e) {
          this.maximize(newWindow);
        }.bind(this)
      );
    }
    if (context.darkMode) {
      newWindow.body.classList.add("windowDarkMode");
    } else {
      newWindow.body.classList.add("windowLightMode");
    }
    // watch for rezise changes
    let resizeObserver = new ResizeObserver(() => {
      if (typeof options.onResize === "function") options.onResize();
      newWindow.header.style.width = newWindow.draggableContent.style.width;
      newWindow.header.style.left = newWindow.draggableContent.style.left;
      newWindow.header.style.top = newWindow.draggableContent.style.top;
      context.adjustNavPosition();
    });
    newWindow.window.style.transition =
      "height 0.1s ease-out, width .1s ease-out";
    newWindow.body.style.transition =
      "height 0.1s ease-out, width .1s ease-out";
    newWindow.header.style.transition =
      "height 0.1s ease-out, width .1s ease-out";
    newWindow.draggableContent.style.transition =
      "height 0.1s ease-out, width .1s ease-out";
    resizeObserver.observe(newWindow.draggableContent);
    this.loadBootStrap();
    this.resizeObservers = [];
    this.resizeObservers.push(resizeObserver);
    this.focus(newWindow);
    this.showToolbar();
  }
  createToolBarButton(windowObj, closeWindow) {
    let context = this;
    let toolBarButton = document.createElement("button");
    toolBarButton.value = windowObj.id;
    toolBarButton.id = windowObj.id + "-toolBar-Btn";
    toolBarButton.classList.add(
      "btn-primary",
      "p-2",
      "m-1",
      "content-center",
      "items-center",
      "rounded-md",
      "flex"
    );
    // toolBarButton.style.boxShadow = "8px 10px 10px 1px rgba(0,0,0,0.5)";
    context.toolBarPosition === "left" || context.toolBarPosition === "right"
      ? (context.flexDirection = "column")
      : (context.flexDirection = "row");
    toolBarButton.style.flexDirection = context.flexDirection;
    toolBarButton.innerHTML = `
    <i class="${windowObj.options.Icon} fs-2 p-1" value=${
      windowObj.id
    } style="color:${
      windowObj.options.IconColor ||
      (context.darkMode ? context.darkModeColor : context.color)
    }"></i>
    <span class="tool-bar-button-text" value=${windowObj.id}>${
      windowObj.options.title
    }</span>
    `;
    toolBarButton.querySelector("." + windowObj.options.Icon).hasColor =
      windowObj.options.IconColor ? true : false;
    const buttonClick = (e) => {
      if (e.target.id === `close-${windowObj.id}-window`) return;
      if (windowObj.maximized && windowObj.id === context.focusedWindow.id) {
        context.minimize(windowObj.id);
      } else if (
        windowObj.maximized &&
        windowObj.id !== context.focusedWindow.id
      ) {
        context.focus(windowObj);
      } else {
        if (windowObj.onMaximize) {
          windowObj.onMaximize();
        }
        context.restoreWindow(windowObj.id);
      }
    };
    toolBarButton.addEventListener("click", buttonClick);
    toolBarButton.getElementsByTagName("i")[0].value = windowObj.id;
    let closeIcon = document.createElement("i");
    closeIcon.id = `close-${windowObj.id}-window`;
    closeIcon.onclick = closeWindow;
    closeIcon.classList.add("is-1", "pfi-math-multiply", "m-2");
    this.toolBar.body.appendChild(toolBarButton);
    toolBarButton.appendChild(closeIcon);
    this.toolBarButtons.push(toolBarButton);
    context.toolBarPosition === "left" || context.toolBarPosition === "right"
      ? this.hideToolBarButtons()
      : this.hideToolBarButtons();
  }
  minimize(id) {
    let context = this;
    this.focusedWindow = "";
    if (this.hiddenToolBar) this.showToolbar();
    let buttonEl = document.getElementById(id + "-toolBar-Btn");
    let button = document
      .getElementById(id + "-toolBar-Btn")
      .getBoundingClientRect();
    if (buttonEl)
      buttonEl.style.backgroundColor = context.darkMode
        ? context.darkModeBackgroundColor
        : context.backgroundColor;
    if (buttonEl)
      buttonEl.style.color = context.darkMode
        ? context.darkModeColor
        : context.color;
    if (document.getElementById(id + "-header")) {
      document.querySelector("#" + id + "-header").style.color =
        context.darkMode ? context.darkModeColor : context.color;
      document.querySelector("#" + id + "-header").style.backgroundColor =
        context.darkMode ? context.headerColor : context.darkModeHeaderColor;
      document.querySelector("#" + id + "-header").style.borderColor = "";
    }
    document.getElementById(id).style.transition = "all 0.3s ease-in-out";
    let windowEl = document.getElementById(id).getBoundingClientRect();
    let windowX =
      windowEl.left + windowEl.width / 2 > button.left + button.width / 2
        ? "right"
        : "left";
    let buttonX =
      button.left + button.width / 2 > windowEl.left + windowEl.width / 2
        ? "right"
        : "left";
    let x = 0;
    if (windowX === "left" && buttonX === "right") {
      x = button.left + button.width / 2 - (windowEl.left + windowEl.width / 2);
    } else if (windowX === "right" && buttonX === "left") {
      x =
        (windowEl.left +
          windowEl.width / 2 -
          (button.left + button.width / 2)) *
        -1;
    }
    let y = 0;
    let windowY =
      windowEl.top + windowEl.height / 2 > button.top + button.height / 2
        ? "bottom"
        : "top";
    let buttonY =
      button.top + button.height / 2 > windowEl.top + windowEl.height / 2
        ? "bottom"
        : "top";
    if (windowY === "top" && buttonY === "bottom") {
      y = button.top + button.height / 2 - (windowEl.top + windowEl.height / 2);
    } else if (windowY === "bottom" && buttonY === "top") {
      y =
        (windowEl.top +
          windowEl.height / 2 -
          (button.top + button.height / 2)) *
        -1;
    }
    this.windows.map(
      function (currentWindow, i) {
        if (currentWindow.id === id) {
          currentWindow.maximized = false;
        }
      }.bind(this)
    );
    if (!document.getElementById(id).style.transform) {
      setTimeout(function () {
        document.getElementById(id).style.transform =
          "translate(" + x + "px," + y + "px) scale(0)";
        document.getElementById(id + "-toolBar-Btn").classList.add("blink");
        setTimeout(function () {
          document
            .getElementById(id + "-toolBar-Btn")
            .classList.remove("blink");
        }, 500);
        context.bodyScroll();
      }, 300);
    }
  }
  restoreWindow(id) {
    let context = this;
    document.getElementById(id).style.transform = null;
    this.windows.map(
      function (currentWindow, i) {
        if (currentWindow.id === id) {
          currentWindow.maximized = true;
          this.focus(currentWindow);
        }
      }.bind(this)
    );
    if (document.getElementById(id).style.transition) {
      setTimeout(function () {
        document.getElementById(id).style.transition = null;
        context.bodyScroll();
      }, 300);
    }
  }
  maximize(windowEl) {
    windowEl.orientation = ["middle", "middle"];
    windowEl.snapTo(windowEl.draggableContent, "middle", "middle");
    this.focus(windowEl);
    this.bodyScroll();
  }
  focus(windowEl)
  {
      let context = this;
      this.windows.move(
          this.windows.findIndex((element) => element === windowEl),
          this.windows.length - 1
      );
      this.focusedWindow = windowEl;
      let borderColor = this.darkMode
          ? this.darkModeBorderColor
          : this.borderColor;
      if (!windowEl) return;
      this.windows.forEach(
          function (item, index)
          {
              if (windowEl.id === item.id)
              {
                  if (windowEl.close)
                  {
                      document.querySelector(
                          "#" + item.id + "-toolBar-Btn"
                      ).style.backgroundColor = context.darkMode
                              ? context.darkModeFocusColor
                              : context.focusColor;
                      document.querySelector(
                          "#" + item.id + "-toolBar-Btn"
                      ).style.borderColor = context.darkMode
                              ? context.darkModeBorderColor
                              : context.borderColor;
                      document.querySelector("#" + item.id + "-toolBar-Btn").style.color =
                          context.darkMode ? context.color : context.darkModeColor;
                      document.querySelector(
                          "#" + item.id + "-toolBar-Btn"
                      ).style.boxShadow = context.darkMode
                              ? "3px 4px 2px 1px " + context.darkModeColor
                              : "3px 4px 4px 1px " + context.color;
                  }
                  if (item.minimizeButton)
                  {
                      item.minimizeButton.style = `
          cursor: pointer;
          color:  ${item.parent.darkMode ? context.darkModeColor : context.color
                          };
          position:absolute;
          right: 46px;
          top: -2px;
          `;
                  }
                  if (item.maximizeButton)
                  {
                      item.maximizeButton.style = `
          cursor: pointer;
          color:  ${item.parent.darkMode ? context.darkModeColor : context.color
                          };
          position:absolute;
          right: 24px;
          top: -2px;
          `;
                  }
                  if (item.closeButton)
                  {
                      item.closeButton.style = `
          cursor: pointer;
          color:  ${item.parent.darkMode ? context.darkModeColor : context.color
                          };
          position:absolute;
          right: 6px;
          `;
                  }
                  item.draggableContent.querySelector(
                      "#" + item.id + "-header"
                  ).style.backgroundColor = context.darkMode
                          ? context.darkModeFocusColor
                          : context.focusColor;
                  item.draggableContent.querySelector(
                      "#" + item.id + "-header"
                  ).style.color = context.darkMode
                          ? context.darkModeColor
                          : context.color;
                  item.draggableContent.querySelector(
                      "#" + item.id + "-header"
                  ).style.borderColor = `${borderColor} ${borderColor} ${item.borderColor} ${borderColor}`;
                  if (document.getElementById(item.id + "-footer"))
                  {
                      item.draggableContent.querySelector(
                          "#" + item.id + "-footer"
                      ).style.color = context.darkMode
                              ? context.darkModeColor
                              : context.color;
                      item.draggableContent.querySelector(
                          "#" + item.id + "-footer"
                      ).style.backgroundColor = context.darkMode
                              ? context.darkModeBackgroundColor
                              : context.backgroundColor;
                      item.draggableContent.querySelector(
                          "#" + item.id + "-footer"
                      ).style.borderColor = context.darkMode
                              ? context.darkModeBorderColor
                              : context.borderColor;
                  }
                  item.zIndex = (index + 10).toString(); // we add 10 to ensure it stays above all other elements
                  item.draggableContent.style.zIndex = item.zIndex;
                  if (typeof item.header !== "undefined" && item.header !== null)
                  {
                      item.header.style.zIndex = item.zIndex + 10;
                  }
                  if (typeof item.footer !== "undefined" && item.footer !== null)
                  {
                      item.footer.style.zIndex = item.zIndex + 10;
                  }
                  item.body.style.zIndex = item.zIndex;
                  windowEl.showScrollButton();
              } else
              {
                  item.zIndex = (index + 5).toString(); // we add 5 to ensure the rest stay behind
                  item.draggableContent.style.zIndex = item.zIndex;
                  if (typeof item.header !== "undefined" && item.header !== null)
                  {
                      item.header.style.zIndex = item.zIndex + 5;
                  }
                  if (typeof item.footer !== "undefined" && item.footer !== null)
                  {
                      item.footer.style.zIndex = item.zIndex + 5;
                  }
                  item.body.style.zIndex = item.zIndex;
                  if (windowEl.close)
                  {
                      if (document.getElementById(item.id + "-toolBar-Btn"))
                          document.getElementById(
                              item.id + "-toolBar-Btn"
                          ).style.backgroundColor = context.darkMode
                                  ? context.darkModeBackgroundColor
                                  : context.backgroundColor;
                      if (document.getElementById(item.id + "-toolBar-Btn"))
                      {
                          document.getElementById(item.id + "-toolBar-Btn").style.color =
                              context.darkMode ? context.darkModeColor : context.color;
                          document.getElementById(
                              item.id + "-toolBar-Btn"
                          ).style.boxShadow = "";
                      }
                  }
                  if (document.getElementById(item.id + "-header"))
                  {
                      item.draggableContent.querySelector(
                          "#" + item.id + "-header"
                      ).style.color = context.darkMode
                              ? context.darkModeColor
                              : context.color;
                      item.draggableContent.querySelector(
                          "#" + item.id + "-header"
                      ).style.backgroundColor = context.darkMode
                              ? context.darkModeHeaderColor
                              : context.headerColor;
                      item.draggableContent.querySelector(
                          "#" + item.id + "-header"
                      ).style.borderColor = `${borderColor} ${borderColor} transparent ${borderColor}`;
                  }
                  if (document.getElementById(item.id + "-footer"))
                  {
                      item.draggableContent.querySelector(
                          "#" + item.id + "-footer"
                      ).style.color = context.darkMode
                              ? context.darkModeColor
                              : context.color;
                      item.draggableContent.querySelector(
                          "#" + item.id + "-footer"
                      ).style.backgroundColor = context.darkMode
                              ? context.darkModeBackgroundColor
                              : context.backgroundColor;
                      item.draggableContent.querySelector(
                          "#" + item.id + "-footer"
                      ).style.borderColor = context.darkMode
                              ? context.darkModeBorderColor
                              : context.borderColor;
                  }
                  if (item.minimizeButton)
                  {
                      item.minimizeButton.style = `
            cursor: pointer;
            color:  ${item.parent.darkMode ? context.darkModeColor : context.color
                          };
            position:absolute;
            right: 46px;
            top: -2px;
            `;
                  }
                  if (item.maximizeButton)
                  {
                      item.maximizeButton.style = `
            cursor: pointer;
            color:  ${item.parent.darkMode ? context.darkModeColor : context.color
                          };
            position:absolute;
            right: 24px;
            top: -2px;
            `;
                  }
                  if (item.closeButton)
                  {
                      item.closeButton.style = `
            cursor: pointer;
            color:  ${item.parent.darkMode ? context.darkModeColor : context.color
                          };
            position:absolute;
            right: 6px;
            `;
                  }
              }
          }.bind(this)
      );
      this.container.querySelectorAll(".pfi-math-multiply").forEach((x) =>
      {
          x.style.color = context.darkMode ? context.darkModeColor : context.color;
      });
  }
  positionWindows() {
    let context = this;
    this.expandedOffset = this.expanded
      ? this.toolBar.body.getBoundingClientRect().width
      : this.toolBarWidth.replace('px','');
    this.windows.forEach((windowObj) => {
      let el = windowObj.window;
      // console.log("positionWindows", context.offset, context.halfset)
      windowObj.offset = context.offset;
      windowObj.halfset = context.offset ? context.offset/2 : 0;
      if (windowObj) {
        if (context.isMobile) {
          if (window.innerHeight >= window.innerWidth) {
            windowObj.orientation = context.checkScreenSize(
              768,
              "x",
              windowObj.orientation
            );
          } else {
            windowObj.orientation = context.checkScreenSize(
              768,
              "y",
              windowObj.orientation
            );
          }
        } else {
          if (!windowObj.orientation) {
            if (
              context.toolBarPosition === "top" ||
              context.toolBarPosition === "bottom"
            ) {
              windowObj.orientation = windowObj.checkPos(
                el.getBoundingClientRect().left +
                  0.5 * el.getBoundingClientRect().width,
                el.getBoundingClientRect().top +
                  0.5 * el.getBoundingClientRect().height -
                  context.offset
              );
            } else {
              windowObj.orientation = windowObj.checkPos(
                el.getBoundingClientRect().left +
                  0.5 * el.getBoundingClientRect().width -
                  context.offset,
                el.getBoundingClientRect().top +
                  0.5 * el.getBoundingClientRect().height
              );
            }
          }
        }
        // snap each window to the desired orientation.
        windowObj.snapTo(
          windowObj.draggableContent,
          windowObj.orientation[0],
          windowObj.orientation[1]
        );
      }
    });

    this.resetShadows();
  }
  resetShadows() {
    this.toolBar.snapTo(this.shadows.topLeftShadow, "left", "top");
    this.toolBar.snapTo(this.shadows.topRightShadow, "right", "top");
    this.toolBar.snapTo(this.shadows.bottomleftShadow, "left", "bottom");
    this.toolBar.snapTo(this.shadows.bottomRightShadow, "right", "bottom");
    this.toolBar.snapTo(this.shadows.leftShadow, "left", "middle");
    this.toolBar.snapTo(this.shadows.rightShadow, "right", "middle");
    this.toolBar.snapTo(this.shadows.topShadow, "middle", "top");
    this.toolBar.snapTo(this.shadows.bottomShadow, "middle", "bottom");
    this.toolBar.snapTo(this.shadows.maxShadow, "middle", "middle");
  }
  createShadows() {
    this.offset =
      this.offset === null || typeof this.offset === "undefined"
        ? 0
        : this.offset; // set this for a top toolbar width
    this.halfset =
      this.offset === null || typeof this.offset === "undefined"
        ? this.offset * 0.1
        : 0; //for calculations only
    if (this.shadows) {
      this.shadows.topRightShadow.remove();
      this.shadows.bottomRightShadow.remove();
      this.shadows.topLeftShadow.remove();
      this.shadows.bottomleftShadow.remove();
      this.shadows.topShadow.remove();
      this.shadows.bottomShadow.remove();
      this.shadows.leftShadow.remove();
      this.shadows.rightShadow.remove();
      this.shadows.maxShadow.remove();
    }
    this.shadows = {
      topRightShadow: this.container.appendChild(document.createElement("div")),
      bottomRightShadow: this.container.appendChild(
        document.createElement("div")
      ),
      topLeftShadow: this.container.appendChild(document.createElement("div")),
      bottomleftShadow: this.container.appendChild(
        document.createElement("div")
      ),
      topShadow: this.container.appendChild(document.createElement("div")),
      bottomShadow: this.container.appendChild(document.createElement("div")),
      leftShadow: this.container.appendChild(document.createElement("div")),
      rightShadow: this.container.appendChild(document.createElement("div")),
      maxShadow: this.container.appendChild(document.createElement("div")),
    };
    this.shadowStyle =
      this.options.shadowStyle ||
      `
              position: absolute;
              display: none;
              z-index: 999;
              background-color: rgba(0,0,0, 0.3);
              border: dashed 2px gold;
          `;
    this.shadows.topLeftShadow.style = this.shadowStyle;
    this.shadows.bottomleftShadow.style = this.shadowStyle;
    this.shadows.topRightShadow.style = this.shadowStyle;
    this.shadows.bottomRightShadow.style = this.shadowStyle;
    this.shadows.topShadow.style = this.shadowStyle;
    this.shadows.bottomShadow.style = this.shadowStyle;
    this.shadows.rightShadow.style = this.shadowStyle;
    this.shadows.leftShadow.style = this.shadowStyle;
    this.shadows.maxShadow.style = this.shadowStyle;
  }
  showShadow(x, y) {
    if (this.isMobile) {
      if (window.innerHeight > window.innerWidth) {
        if (y === "bottom") {
          this.hideShadows();
          this.shadows.bottomShadow.style.display = "block";
        } else if (y === "top") {
          this.hideShadows();
          this.shadows.topShadow.style.display = "block";
        } else {
          this.hideShadows();
          this.shadows.maxShadow.style.display = "block";
        }
      } else {
        if (x === "right") {
          this.hideShadows();
          this.shadows.rightShadow.style.display = "block";
        } else if (x === "left") {
          this.hideShadows();
          this.shadows.leftShadow.style.display = "block";
        } else {
          this.hideShadows();
          this.shadows.maxShadow.style.display = "block";
        }
      }
      return;
    }
    if (y === "top" && x === "left") {
      this.hideShadows();
      this.shadows.topLeftShadow.style.display = "block";
    } else if (y === "top" && x === "right") {
      this.hideShadows();
      this.shadows.topRightShadow.style.display = "block";
    } else if (y === "bottom" && x === "left") {
      this.hideShadows();
      this.shadows.bottomleftShadow.style.display = "block";
    } else if (y === "bottom" && x === "right") {
      this.hideShadows();
      this.shadows.bottomRightShadow.style.display = "block";
    } else if (y === "bottom" && x === "middle") {
      this.hideShadows();
      this.shadows.bottomShadow.style.display = "block";
    } else if (y === "top" && x === "middle") {
      this.hideShadows();
      this.shadows.topShadow.style.display = "block";
    } else if (y === "middle" && x === "right") {
      this.hideShadows();
      this.shadows.rightShadow.style.display = "block";
    } else if (y === "middle" && x === "left") {
      this.hideShadows();
      this.shadows.leftShadow.style.display = "block";
    } else {
      this.hideShadows();
      if (this.locked) this.shadows.maxShadow.style.display = "block";
    }
  }
  hideShadows() {
    this.shadows.topLeftShadow.style.display = "none";
    this.shadows.topRightShadow.style.display = "none";
    this.shadows.bottomleftShadow.style.display = "none";
    this.shadows.bottomRightShadow.style.display = "none";
    this.shadows.topShadow.style.display = "none";
    this.shadows.bottomShadow.style.display = "none";
    this.shadows.rightShadow.style.display = "none";
    this.shadows.leftShadow.style.display = "none";
    this.shadows.maxShadow.style.display = "none";
  }
  createPopup(
    id = `popup-DraggableWindows-${this.toolBar.randomWindowID()}`,
    title = id,
    content = "<div>Error! Content not available.</div>"
  ) {
    let context = this;
    let popup = new DraggableWindow({
      parent: context,
      container: context.container,
      zIndex: 99999,
      body: content,
      footer: null,
      header: false,
      snapping: false,
      id: id,
      title: title,
      height: "auto",
      width: "auto",
      resizeable: false,
      close: false,
      locked: true,
      callouts: false,
      hasManager: true,
    });
    popup.scrollButtons.style.display = "none";
    popup.window.classList.add(
      "bg-none",
      "justify-start",
      "items-center",
      "m-0",
      "p-0",
      "shadow-lg"
    );
    popup.window.style.borderRadius = "5px";
    popup.window.style.backgroundColor = this.darkMode
      ? this.darkModeBackgroundColor
      : this.backgroundColor;
    popup.window.style.color = this.darkMode ? this.darkModeColor : this.color;
    popup.body.style.backgroundColor = this.darkMode
      ? this.darkModeBackgroundColor
      : this.backgroundColor;
    popup.body.style.color = this.darkMode ? this.darkModeColor : this.color;
    popup.body.classList.add("bg-none", "items-center");
    popup.closeButton = document.createElement("span");
    popup.closeButton.classList.add("fs-2", "pfi-math-multiply");
    popup.closeButton.style = `
      cursor: pointer;
      color: black;
      position:absolute;
      right: 5px;
      top: 5px;
      `;
    popup.closeButton.addEventListener("click", function (e) {
      context.closeToolbarWindows();
    });
    popup.body.appendChild(popup.closeButton);
    popup.window.classList.add("hidden");
    popup.window.classList.remove("flex");
    popup.window.style.display = "";
    context.popups.push(popup);
    return popup;
  }
  positionPopups() {
    let context = this;
    if (this.newAppButton && this.appsManagerWindow)
      this.setPopupPosition(
        context.newAppButton,
        context.appsManagerWindow.window
      );
    if (this.infoButton && this.infoWindow)
      this.setPopupPosition(context.infoButton, context.infoWindow.window);
    if (this.FAQWindowButton && this.FAQWindow)
      this.setPopupPosition(context.FAQWindowButton, context.FAQWindow.window);
    if (this.settingsButton && this.settingsWindow)
      this.setPopupPosition(
        context.settingsButton,
        context.settingsWindow.window
      );
  }
  showPopup(button, window) {
    if (window.classList.contains("hidden")) {
      window.classList.remove("hidden");
      window.classList.add("flex");
    } else {
      window.classList.add("hidden");
      window.classList.remove("flex");
    }
    window.style.height = "auto";
    this.setPopupPosition(button, window);
  }
  setPopupPosition(button, window) {
    let context = this;
    if (context.isMobile) {
      window.style.height = "100%";
      window.style.width = "100%";
      window.style.top = "0px";
      window.style.left = "0px";
      window.style.bottom = "";
      window.style.right = "";
      return;
    }
    if (context.toolBarPosition === "top") {
      window.style.top = this.offset * 0.75 + "px";
      window.style.left =
        button.getBoundingClientRect().left +
        button.getBoundingClientRect().width +
        "px";
      window.style.bottom = "";
      window.style.right = "";
    } else if (context.toolBarPosition === "bottom") {
      window.style.top = "";
      window.style.left =
        button.getBoundingClientRect().left +
        button.getBoundingClientRect().width +
        "px";
      window.style.bottom = this.offset * 0.75 + "px";
      window.style.right = "";
    } else if (context.toolBarPosition === "right") {
      window.style.top =
        button.getBoundingClientRect().top +
        button.getBoundingClientRect().height +
        "px";
      window.style.left = "";
      window.style.bottom = "";
      window.style.right = this.offset * 0.75 + "px";
    } else if (context.toolBarPosition === "left") {
      window.style.top =
        button.getBoundingClientRect().top +
        button.getBoundingClientRect().height +
        "px";
      window.style.left = this.offset * 0.75 + "px";
      window.style.bottom = "";
      window.style.right = "";
    }
  }
  setAutoHide(){
    if (this.autoHide) {
      if (this.hideTimeout) clearTimeout(this.hideTimeout);
      this.hideTimeout = setTimeout(this.hideToolbar, 4000)
    } else {
      clearTimeout(this.hideTimeout);
    }
  }
  hideToolbar() {
    this.toolBarVisible = false;
    this.offset = 0;
    this.halfset = 0;
    this.hideToolBarButton.style.display = "block";
    this.hideToolBarButton.value = false;
    this.positionLogo();
    this.positionWindows();
    this.adjustNavPosition();
    clearTimeout(this.hideTimeout);
  }
  focus(windowEl)
  {
      let context = this;
      this.windows.move(
          this.windows.findIndex((element) => element === windowEl),
          this.windows.length - 1
      );
      this.focusedWindow = windowEl;
      let borderColor = this.darkMode
          ? this.darkModeBorderColor
          : this.borderColor;
      if (!windowEl) return;
      this.windows.forEach(
          function (item, index)
          {
              if (windowEl.id === item.id)
              {
                  if (windowEl.close)
                  {
                      document.querySelector(
                          "#" + item.id + "-toolBar-Btn"
                      ).style.backgroundColor = context.darkMode
                              ? context.darkModeFocusColor
                              : context.focusColor;
                      document.querySelector(
                          "#" + item.id + "-toolBar-Btn"
                      ).style.borderColor = context.darkMode
                              ? context.darkModeBorderColor
                              : context.borderColor;
                      document.querySelector("#" + item.id + "-toolBar-Btn").style.color =
                          context.darkMode ? context.color : context.darkModeColor;
                      document.querySelector(
                          "#" + item.id + "-toolBar-Btn"
                      ).style.boxShadow = context.darkMode
                              ? "3px 4px 2px 1px " + context.darkModeColor
                              : "3px 4px 4px 1px " + context.color;
                  }
                  if (item.minimizeButton)
                  {
                      item.minimizeButton.style = `
          cursor: pointer;
          color:  ${item.parent.darkMode ? context.darkModeColor : context.color
                          };
          position:absolute;
          right: 46px;
          top: -2px;
          `;
                  }
                  if (item.maximizeButton)
                  {
                      item.maximizeButton.style = `
          cursor: pointer;
          color:  ${item.parent.darkMode ? context.darkModeColor : context.color
                          };
          position:absolute;
          right: 24px;
          top: -2px;
          `;
                  }
                  if (item.closeButton)
                  {
                      item.closeButton.style = `
          cursor: pointer;
          color:  ${item.parent.darkMode ? context.darkModeColor : context.color
                          };
          position:absolute;
          right: 6px;
          `;
                  }
                  item.draggableContent.querySelector(
                      "#" + item.id + "-header"
                  ).style.backgroundColor = context.darkMode
                          ? context.darkModeFocusColor
                          : context.focusColor;
                  item.draggableContent.querySelector(
                      "#" + item.id + "-header"
                  ).style.color = context.darkMode
                          ? context.darkModeColor
                          : context.color;
                  item.draggableContent.querySelector(
                      "#" + item.id + "-header"
                  ).style.borderColor = `${borderColor} ${borderColor} ${item.borderColor} ${borderColor}`;
                  if (document.getElementById(item.id + "-footer"))
                  {
                      item.draggableContent.querySelector(
                          "#" + item.id + "-footer"
                      ).style.color = context.darkMode
                              ? context.darkModeColor
                              : context.color;
                      item.draggableContent.querySelector(
                          "#" + item.id + "-footer"
                      ).style.backgroundColor = context.darkMode
                              ? context.darkModeBackgroundColor
                              : context.backgroundColor;
                      item.draggableContent.querySelector(
                          "#" + item.id + "-footer"
                      ).style.borderColor = context.darkMode
                              ? context.darkModeBorderColor
                              : context.borderColor;
                  }
                  item.zIndex = (index + 10).toString(); // we add 10 to ensure it stays above all other elements
                  item.draggableContent.style.zIndex = item.zIndex;
                  if (typeof item.header !== "undefined" && item.header !== null)
                  {
                      item.header.style.zIndex = item.zIndex + 10;
                  }
                  if (typeof item.footer !== "undefined" && item.footer !== null)
                  {
                      item.footer.style.zIndex = item.zIndex + 10;
                  }
                  item.body.style.zIndex = item.zIndex;
                  windowEl.showScrollButton();
              } else
              {
                  item.zIndex = (index + 5).toString(); // we add 5 to ensure the rest stay behind
                  item.draggableContent.style.zIndex = item.zIndex;
                  if (typeof item.header !== "undefined" && item.header !== null)
                  {
                      item.header.style.zIndex = item.zIndex + 5;
                  }
                  if (typeof item.footer !== "undefined" && item.footer !== null)
                  {
                      item.footer.style.zIndex = item.zIndex + 5;
                  }
                  item.body.style.zIndex = item.zIndex;
                  if (windowEl.close)
                  {
                      if (document.getElementById(item.id + "-toolBar-Btn"))
                          document.getElementById(
                              item.id + "-toolBar-Btn"
                          ).style.backgroundColor = context.darkMode
                                  ? context.darkModeBackgroundColor
                                  : context.backgroundColor;
                      if (document.getElementById(item.id + "-toolBar-Btn"))
                      {
                          document.getElementById(item.id + "-toolBar-Btn").style.color =
                              context.darkMode ? context.darkModeColor : context.color;
                          document.getElementById(
                              item.id + "-toolBar-Btn"
                          ).style.boxShadow = "";
                      }
                  }
                  if (document.getElementById(item.id + "-header"))
                  {
                      item.draggableContent.querySelector(
                          "#" + item.id + "-header"
                      ).style.color = context.darkMode
                              ? context.darkModeColor
                              : context.color;
                      item.draggableContent.querySelector(
                          "#" + item.id + "-header"
                      ).style.backgroundColor = context.darkMode
                              ? context.darkModeHeaderColor
                              : context.headerColor;
                      item.draggableContent.querySelector(
                          "#" + item.id + "-header"
                      ).style.borderColor = `${borderColor} ${borderColor} transparent ${borderColor}`;
                  }
                  if (document.getElementById(item.id + "-footer"))
                  {
                      item.draggableContent.querySelector(
                          "#" + item.id + "-footer"
                      ).style.color = context.darkMode
                              ? context.darkModeColor
                              : context.color;
                      item.draggableContent.querySelector(
                          "#" + item.id + "-footer"
                      ).style.backgroundColor = context.darkMode
                              ? context.darkModeBackgroundColor
                              : context.backgroundColor;
                      item.draggableContent.querySelector(
                          "#" + item.id + "-footer"
                      ).style.borderColor = context.darkMode
                              ? context.darkModeBorderColor
                              : context.borderColor;
                  }
                  if (item.minimizeButton)
                  {
                      item.minimizeButton.style = `
            cursor: pointer;
            color:  ${item.parent.darkMode ? context.darkModeColor : context.color
                          };
            position:absolute;
            right: 46px;
            top: -2px;
            `;
                  }
                  if (item.maximizeButton)
                  {
                      item.maximizeButton.style = `
            cursor: pointer;
            color:  ${item.parent.darkMode ? context.darkModeColor : context.color
                          };
            position:absolute;
            right: 24px;
            top: -2px;
            `;
                  }
                  if (item.closeButton)
                  {
                      item.closeButton.style = `
            cursor: pointer;
            color:  ${item.parent.darkMode ? context.darkModeColor : context.color
                          };
            position:absolute;
            right: 6px;
            `;
                  }
              }
          }.bind(this)
      );
      this.container.querySelectorAll(".pfi-math-multiply").forEach((x) =>
      {
          x.style.color = context.darkMode ? context.darkModeColor : context.color;
      });
  }
  positionWindows()
  {
      let context = this;
      this.expandedOffset = this.expanded
          ? this.toolBar.body.getBoundingClientRect().width
          : this.toolBarWidth.replace('px', '');
      this.windows.forEach((windowObj) =>
      {
          let el = windowObj.window;
          // console.log("positionWindows", context.offset, context.halfset)
          windowObj.offset = context.offset;
          windowObj.halfset = context.offset ? context.offset / 2 : 0;
          if (windowObj)
          {
              if (context.isMobile)
              {
                  if (window.innerHeight >= window.innerWidth)
                  {
                      windowObj.orientation = context.checkScreenSize(
                          768,
                          "x",
                          windowObj.orientation
                      );
                  } else
                  {
                      windowObj.orientation = context.checkScreenSize(
                          768,
                          "y",
                          windowObj.orientation
                      );
                  }
              } else
              {
                  if (!windowObj.orientation)
                  {
                      if (
                          context.toolBarPosition === "top" ||
                          context.toolBarPosition === "bottom"
                      )
                      {
                          windowObj.orientation = windowObj.checkPos(
                              el.getBoundingClientRect().left +
                              0.5 * el.getBoundingClientRect().width,
                              el.getBoundingClientRect().top +
                              0.5 * el.getBoundingClientRect().height -
                              context.offset
                          );
                      } else
                      {
                          windowObj.orientation = windowObj.checkPos(
                              el.getBoundingClientRect().left +
                              0.5 * el.getBoundingClientRect().width -
                              context.offset,
                              el.getBoundingClientRect().top +
                              0.5 * el.getBoundingClientRect().height
                          );
                      }
                  }
              }
              // snap each window to the desired orientation.
              windowObj.snapTo(
                  windowObj.draggableContent,
                  windowObj.orientation[0],
                  windowObj.orientation[1]
              );
          }
      });

      this.resetShadows();
  }
  setTheme(theme = this.state.theme)
  {
      let context = this;
      context.themeColors.forEach((element) =>
      {
          if (element.name === theme)
          {
              context.color = element.color;
              context.backgroundColor = element.backgroundColor;
              context.headerColor = element.headerColor;
              context.focusColor = element.focusColor;
              context.borderColor = element.borderColor;
              context.darkModeColor = element.darkModeColor;
              context.darkModeBackgroundColor = element.darkModeBackgroundColor;
              context.darkModeHeaderColor = element.darkModeHeaderColor;
              context.darkModeFocusColor = element.darkModeFocusColor;
              context.darkModeBorderColor = element.darkModeBorderColor;
          }
      });
      context.state.theme = theme;
      context.state.toolBarPosition = context.toolBarPosition;
      if (this.toolBarButtons && this.toolBarButtons.length) this.changeColors();
  }
  changeColors()
  {
      let context = this;
      if (this.container.classList.contains('dark') && !this.darkMode)
      {
          this.container.classList.remove('dark');
          this.container.classList.add('light');
      } else if (this.container.classList.contains('light') && this.darkMode)
      {
          this.container.classList.add('dark');
          this.container.classList.remove('light');
      } else if (!this.container.classList.contains('dark') && !this.container.classList.contains('light'))
      {
          this.darkMode ? this.container.classList.add('dark') : 
          this.container.classList.add('light');
      }
      if (this.lightDarkMode)
          this.lightDarkMode.style.color = this.darkMode
              ? this.darkModeColor
              : "gold";
      this.hamburger.style.color = this.darkMode
          ? this.darkModeColor
          : this.color;
      if (this.logoutButton)
          this.logoutButton.style.color = this.darkMode
              ? this.darkModeColor
              : this.color;
      this.closeToolBar.style.color = this.darkMode
          ? this.darkModeColor
          : this.color;
      this.logoImage.style.backgroundColor = this.darkMode
          ? this.darkModeColor
          : this.headerColor;
      this.divider.style.backgroundColor = this.darkMode ? "" : this.color;
      if (this.darkMode)
      {
          this.lightDarkMode.classList.add("pfi-light-bulb");
          this.lightDarkMode.classList.remove("pfi-light-bulb-lit");
      } else
      {
          this.lightDarkMode.classList.remove("pfi-light-bulb");
          this.lightDarkMode.classList.add("pfi-light-bulb-lit");
      }
      this.toolBarButtonIcons.forEach((button) =>
      {
          if (context.darkMode && !button.hasColor)
              button.style.color = context.darkModeColor;
          else if (!context.darkMode && !button.hasColor)
              button.style.color = context.color;
      });
      this.toolBarButtons.forEach((button) =>
      {
          button.querySelectorAll("i").forEach((icon) =>
          {
              // console.log(icon.hasColor, icon);
              if (context.darkMode && !icon.hasColor)
              {
                  icon.style.color = context.darkModeColor;
              } else if (!context.darkMode && !icon.hasColor)
              {
                  icon.style.color = context.color;
              }
          });
          button.style.boxShadow = "";
          button.style.backgroundColor = context.darkMode ? context.darkModeBackgroundColor : context.backgroundColor;
      });
      this.container.querySelectorAll("table").forEach((x) =>
      {
          x.style.color = context.darkMode ? context.darkModeColor : context.color;
      });
      this.container.querySelectorAll("label").forEach((x) =>
      {
          x.style.color = context.darkMode ? context.darkModeColor : context.color;
      });
      this.container.querySelectorAll("input").forEach((x) =>
      {
          x.style.color = context.darkMode ? context.darkModeColor : context.color;
          x.style.borderColor = context.darkMode ? context.borderColor : context.borderColor;
          x.style.backgroundColor = context.darkMode ? context.darkModeHeaderColor : context.backgroundColor;
      });
      this.container.querySelectorAll(".textarea").forEach((x) =>
      {
          x.style.color = context.darkMode ? context.darkModeColor : context.color;
          x.style.borderColor = context.darkMode ? context.borderColor : context.borderColor;
          x.style.backgroundColor = context.darkMode ? context.darkModeHeaderColor : context.backgroundColor;
      });
      this.container.querySelectorAll(".pfi-math-multiply").forEach((x) =>
      {
          x.style.color = context.darkMode ? context.darkModeColor : context.color;
      });
      this.popups.forEach((popup) =>
      {
          popup.window.style.backgroundColor = this.darkMode
              ? this.darkModeBackgroundColor
              : this.backgroundColor;
          popup.window.style.color = this.darkMode
              ? this.darkModeColor
              : this.color;
          popup.body.style.backgroundColor = this.darkMode
              ? this.darkModeBackgroundColor
              : this.backgroundColor;
          popup.body.style.color = this.darkMode ? this.darkModeColor : this.color;
          popup.window.style.borderColor = context.darkMode
              ? context.darkModeBorderColor //"rgb(33, 38, 45)"
              : context.borderColor;
      });
      this.focus(this.focusedWindow);
      this.container
          .querySelectorAll(".static-toolbar-button-text")
          .forEach((buttonText) =>
          {
              buttonText.style.color = context.darkMode
                  ? context.darkModeColor
                  : context.color;
          });
      this.windows.forEach((window) =>
      {
          if (context.darkMode)
          {
              window.body.classList.add("windowDarkMode");
              window.body.classList.remove("windowLightMode");
          } else
          {
              window.body.classList.remove("windowDarkMode");
              window.body.classList.add("windowLightMode");
          }
          if (window.minimizeButton)
          {
              window.minimizeButton.style = `
      cursor: pointer;
      color:  ${window.parent.darkMode ? context.darkModeColor : context.color
                  };
      position:absolute;
      right: 46px;
      top: -2px;
      `;
          }
          if (window.maximizeButton)
          {
              window.maximizeButton.style = `
      cursor: pointer;
      color:  ${window.parent.darkMode ? context.darkModeColor : context.color
                  };
      position:absolute;
      right: 24px;
      top: -2px;
      `;
          }
          if (window.closeButton)
          {
              window.closeButton.style = `
      cursor: pointer;
      color:  ${window.parent.darkMode ? context.darkModeColor : context.color
                  };
      position:absolute;
      right: 6px;
      `;
          }
          if (window.id !== context.toolBar.id)
          {
              window.body.style.backgroundColor = `${window.parent.darkMode
                      ? context.darkModeBackgroundColor
                      : context.backgroundColor
                  }`;
              window.draggableContent.style.color = `${window.parent.darkMode ? context.darkModeColor : context.color
                  }`;
              window.draggableContent.style.backgroundColor = `${window.parent.darkMode
                      ? context.darkModeBackgroundColor
                      : context.backgroundColor
                  }`;
              window.draggableContent.style.borderColor = context.darkMode
                  ? context.darkModeBorderColor //"rgb(33, 38, 45)"
                  : context.borderColor;
          } else
          {
              window.window.style.backgroundColor = `${window.parent.darkMode
                      ? window.parent.darkModeBackgroundColor
                      : window.parent.backgroundColor
                  }`;
              context.toolBar.body.style.backgroundColor = context.darkMode
                  ? context.darkModeHeaderColor
                  : context.headerColor;
          }
      });
      this.loadingSpinner.toggleColors();
      if (this.background || this.icon)
      {
          this.createBackground();
      }
  }
  browserWindowResize()
  {
      let context = this;
      this.checkScreenSize();
      this.adjustNavPosition();
      this.positionWindows();
      setTimeout(() =>
      {
          context.resetShadows();
          context.hideShadows();
          context.positionPopups();
          context.positionLogo();
          context.toggleToolBarButton();
          context.changeColors();
      }, 100);
  }
  adjustNavPosition()
  {
      let context = this;
      if (!this.isMobile)
      {
          if (this.toolBarPosition === "top")
          {
              this.toolBar.body.style.width = "100%";
              this.toolBar.body.style.height = this.toolBarWidth;
              this.toolBar.body.style.position = "fixed";
              this.toolBar.body.style.zIndex = "10";
              this.toolBar.body.style.top = "0px";
              this.toolBar.body.style.left = "0px";
              this.toolBar.body.style.right = "";
              this.toolBar.body.style.bottom = "";
              if (!this.toolBarVisible) this.toolBar.body.style.top = "-" + this.toolBarWidth;
          } else if (this.toolBarPosition === "bottom")
          {
              this.toolBar.body.style.width = "100%";
              this.toolBar.body.style.height = this.toolBarWidth;
              this.toolBar.body.style.position = "fixed";
              this.toolBar.body.style.zIndex = "10";
              this.toolBar.body.style.top = window.innerHeight - this.offset + "px";
              this.toolBar.body.style.left = "0px";
              this.toolBar.body.style.right = "";
              this.toolBar.body.style.bottom = "";
              if (!this.toolBarVisible) this.toolBar.body.style.top = window.innerHeight + "px";
          } else if (this.toolBarPosition === "left")
          {
              this.toolBar.body.style.width = this.toolBarWidth;
              this.toolBar.body.style.position = "fixed";
              this.toolBar.body.style.zIndex = "10";
              this.toolBar.body.style.height = "100%";
              this.toolBar.body.style.top = 0 + "px";
              this.toolBar.body.style.left = "0px";
              this.toolBar.body.style.right = "";
              this.toolBar.body.style.bottom = "";
              if (!this.toolBarVisible) this.toolBar.body.style.left = "-" + this.toolBarWidth;
          } else if (this.toolBarPosition === "right")
          {
              this.toolBar.body.style.width = this.toolBarWidth;
              this.toolBar.body.style.height = "100%";
              this.toolBar.body.style.position = "fixed";
              this.toolBar.body.style.zIndex = "10";
              this.toolBar.body.style.top = 0 + "px";
              this.toolBar.body.style.right = "0px";
              this.toolBar.body.style.left = "";
              this.toolBar.body.style.bottom = "";
              if (!this.toolBarVisible) this.toolBar.body.style.right = "-" + this.toolBarWidth;
          }
      } else
      {
          if (this.expanded)
          {
              this.toolBar.draggableContent.style.zIndex = "9999999";
              this.toolBar.body.style.width = "100%";
              this.toolBar.body.style.height = "100%";
              this.toolBar.body.style.position = "fixed";
              this.toolBar.body.style.top = 0 + "px";
              this.toolBar.body.style.left = "0px";
              this.toolBar.body.style.right = "";
              this.toolBar.body.style.bottom = "";
          } else if (this.toolBarPosition === "top")
          {
              this.toolBar.body.style.width = "100%";
              this.toolBar.body.style.height = this.toolBarWidth;
              this.toolBar.body.style.position = "fixed";
              this.toolBar.body.style.top = 0 + "px";
              this.toolBar.body.style.left = "0px";
              this.toolBar.body.style.right = "";
              this.toolBar.body.style.bottom = "";
              if (!this.toolBarVisible) this.toolBar.body.style.top = "-" + this.toolBarWidth;
          } else if (this.toolBarPosition === "bottom")
          {
              this.toolBar.body.style.width = "100%";
              this.toolBar.body.style.height = this.toolBarWidth;
              this.toolBar.body.style.position = "fixed";
              this.toolBar.body.style.top = "";
              this.toolBar.body.style.left = "0px";
              this.toolBar.body.style.right = "";
              this.toolBar.body.style.bottom = "0px";
              if (!this.toolBarVisible) this.toolBar.body.style.top = window.innerHeight + "px";
          } else if (this.toolBarPosition === "left")
          {
              this.toolBar.body.style.width = this.toolBarWidth;
              this.toolBar.body.style.height = "100%";
              this.toolBar.body.style.position = "fixed";
              this.toolBar.body.style.top = 0 + "px";
              this.toolBar.body.style.left = "0px";
              this.toolBar.body.style.right = "";
              this.toolBar.body.style.bottom = "";
              if (!this.toolBarVisible) this.toolBar.body.style.left = "-" + this.toolBarWidth;
          } else if (this.toolBarPosition === "right")
          {
              this.toolBar.body.style.width = this.toolBarWidth;
              this.toolBar.body.style.height = "100%";
              this.toolBar.body.style.position = "fixed";
              this.toolBar.body.style.top = "0px";
              this.toolBar.body.style.right = "0px";
              this.toolBar.body.style.bottom = "";
              this.toolBar.body.style.left = "";
              if (!this.toolBarVisible) this.toolBar.body.style.right = "-" + this.toolBarWidth;
              //console.log(this.toolBar.body.style.right, this.toolBarVisible)
          }
      }
      let flexDirection =
          this.toolBarPosition === "bottom" || this.toolBarPosition === "top"
              ? "row"
              : "column";
      if (this.isMobile && this.expanded)
      {
          this.toolBar.body.classList.add("content-center");
      }
      this.toolBar.window.height = "100%";
      this.toolBar.window.width = "100%";
      flexDirection = "row";
      this.state.toolBarPosition = this.toolBarPosition;
      this.toggleToolBarButton();
      this.resetShadows();
  }
  toggleToolBarButton()
  {
      let context = this;
      if (!this.hideToolBarButton)
      {
          this.hideToolBarButton = document.createElement('i');
          this.hideToolBarButton.style.position = "fixed";
          this.hideToolBarButton.style.display = "none";
          this.hideToolBarButton.style.zIndex = 9999999999999999;
          this.hideToolBarButton.style.cursor = 'pointer';
          this.hideToolBarButton.title = "Show Tool Bar";
          this.hideToolBarButton.setAttribute('aria-labeled-by', 'title');
          this.hideToolBarButton.onclick = (e) =>
          {
              if (e.target.value)
              {
                  context.hideToolbar();
              } else
              {
                  context.showToolbar();
              }
          }
          this.toolBar.body.appendChild(context.hideToolBarButton);
      }
      this.hideToolBarButton.className = "";
      if (this.toolBarPosition === "top")
      {
          this.hideToolBarButton.classList.add('is-1', 'pfi-shape-triangle-down-solid');
          this.hideToolBarButton.style.left = window.innerWidth / 2 - this.hideToolBarButton.getBoundingClientRect().width / 2 + "px";
          this.hideToolBarButton.style.top = "0px";
          this.hideToolBarButton.style.right = "";
          this.hideToolBarButton.style.bottom = "";
      } else if (this.toolBarPosition === "bottom")
      {
          this.hideToolBarButton.classList.add('is-1', 'pfi-shape-triangle-up-solid');
          this.hideToolBarButton.style.left = window.innerWidth / 2 - this.hideToolBarButton.getBoundingClientRect().width / 2 + "px";
          this.hideToolBarButton.style.bottom = "0px";
          this.hideToolBarButton.style.right = "";
          this.hideToolBarButton.style.top = "";
      } else if (this.toolBarPosition === "left")
      {
          this.hideToolBarButton.classList.add('is-1', 'pfi-shape-triangle-right-solid');
          this.hideToolBarButton.style.top = window.innerHeight / 2 - this.hideToolBarButton.getBoundingClientRect().height / 2 + "px";
          this.hideToolBarButton.style.left = "0px";
          this.hideToolBarButton.style.right = "";
          this.hideToolBarButton.style.bottom = "";
      } else
      {
          this.hideToolBarButton.classList.add('is-1', 'pfi-shape-triangle-left-solid');
          this.hideToolBarButton.style.top = window.innerHeight / 2 - this.hideToolBarButton.getBoundingClientRect().height / 2 + "px";
          this.hideToolBarButton.style.right = "0px";
          this.hideToolBarButton.style.bottom = "";
          this.hideToolBarButton.style.left = "";
      }
  }
  showToolbar()
  {
      let context = this;
      this.toolBarVisible = true;
      this.offset = parseInt(this.toolBarWidth.replace('px', ''));
      this.halfset = this.offset / 2;
      this.toolBarWidth = this.offset + "px";
      this.hideToolBarButton.style.display = "none";
      this.hideToolBarButton.value = true;
      this.browserWindowResize();
      this.setAutoHide();
  }
  expandToolBar()
  {
      let context = this;
      // shows toolbar in position of choice
      if (!this.isMobile)
      {
          if (this.toolBarPosition === "left" || this.toolBarPosition === "right")
          {
              this.expanded = true;
              this.toolBarWidth = "auto";
              this.toolBar.body.style.width = "auto";
              this.staticButtons.classList.add("flex-row");
              this.staticButtons.classList.remove("flex-col");
              setTimeout(function ()
              {
                  context.offset = context.toolBar.body.getBoundingClientRect().width;
                  context.positionWindows();
              }, 100);
          }
      } else
      {
          this.staticButtons.classList.add("flex-row");
          this.staticButtons.classList.remove("flex-col");
          this.toolBar.body.style.width = "100%";
          this.toolBar.body.style.height = "100%";
          this.toolBar.body.style.flexDirection = "column";
          this.toolBar.body.style.overflowY = "auto";
          this.toolBar.draggableContent.style.zIndex = "99999";
          setTimeout(function ()
          {
              context.positionWindows();
          }, 100);
      }
      document
          .querySelectorAll(".static-toolbar-button-text")
          .forEach((button) => (button.style.display = "flex"));
      context.closeToolBar.style.display = "block";
      context.hamburger.style.display = "none";
      this.expanded = true;
      this.showToolBarButtons();
      this.adjustNavPosition();
  }
  collapseToolbar()
  {
      // collapses to hamburger
      let context = this;

      if (this.toolBarPosition === "left" || this.toolBarPosition === "right")
      {
          this.expanded = false;
          this.staticButtons.classList.remove("flex-row");
          this.staticButtons.classList.add("flex-col");
          document
              .querySelectorAll(".static-toolbar-button-text")
              .forEach((button) => (button.style.display = "none"));
          setTimeout(function ()
          {
              context.toolBar.draggableContent.style.zIndex = "5";
          }, 300);
          this.hideToolBarButtons();
          context.closeToolBar.style.display = "none";
          context.hamburger.style.display = "block";
          this.toolBar.body.style.flexDirection = "column";
      } else if (
          this.toolBarPosition === "top" ||
          this.toolBarPosition === "bottom"
      )
      {
          this.toolBar.body.style.flexDirection = "row";
          this.expanded = false;
          document
              .querySelectorAll(".static-toolbar-button-text")
              .forEach((button) => (button.style.display = "none"));
          setTimeout(function ()
          {
              context.toolBar.draggableContent.style.zIndex = "5";
          }, 300);
          this.hideToolBarButtons();
          this.closeToolBar.style.display = "none";
          this.hamburger.style.display = "block";
      }
      if (this.isMobile) this.toolBar.body.style.overflowY = "";
      this.toolBarButtons.forEach((button) =>
      {
          button.style.flexDirection =
              this.toolBarPosition === "bottom" || this.toolBarPosition === "top"
                  ? "row"
                  : "column";
      });
      this.offset = this._offset.replace('px', '');
      this.toolBarWidth = this._offset;
      this.positionWindows();
      this.adjustNavPosition();
      this.positionLogo();
  }
  showToolBarButtons()
  {
      let context = this;
      if (this.logo)
      {
          if (this.isMobile)
          {
              this.logoImage.style.display = "flex";
              this.divider.style.display = "none";
          } else
          {
              this.logoImage.style.display = "none";
              this.divider.style.display = "none";
          }
      }
      if (this.isMobile)
      {
          this.toolBar.body.style.overflow = "auto";
      }
      this.toolBarButtons.forEach((button) =>
      {
          button.querySelector(".tool-bar-button-text").style.display = "flex";
          if (
              context.toolBarPosition === "left" ||
              context.toolBarPosition === "right"
          )
          {
              button.style.flexDirection = "row";
          }
      });
  }
  hideToolBarButtons()
  {
      let context = this;
      this.toolBarButtons.forEach((button) =>
      {
          button.style.flexDirection = context.flexDirection;
          button.querySelector(".tool-bar-button-text").style.display = "none";
      });
      if (this.logo)
      {
          if (this.isMobile)
          {
              this.logoImage.style.display = "none";
              this.divider.style.display = "none";
          } else
          {
              this.logoImage.style.display = "flex";
              this.divider.style.display = "flex";
          }
      }
  }
  // check window size, if small (below breakpoint) then all windows should be 100%
  checkScreenSize(minimum = 768, splitDirection = "x", orientation) {
    if (!orientation || typeof orientation === "undefined")
      orientation = ["middle", "middle"];
    this.isMobile =
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i);
    this.last = this.last === 0 ? 1 : 0;
    let xSplit = ["top", "bottom"];
    let ySplit = ["left", "right"];
    if (orientation[0] === "middle" && orientation[1] === "middle")
      return orientation;
    if (splitDirection) {
      if (splitDirection === "x" && orientation[1] === "middle") {
        return ["middle", xSplit[this.last]];
      } else if (splitDirection === "y" && orientation[0] === "middle") {
        return [ySplit[this.last], "middle"];
      } else {
        return orientation;
      }
    } else {
      return orientation;
    }
  }
  //remove JS or CSS from DOM (reverse of inject)
  removeInjection(filename, filetype) {
    if (!filename || !filetype)
      throw "To remove an injected dependency, you must specify filename and filetype";
    let Element =
      filetype == "js" ? "script" : filetype == "css" ? "link" : "none"; //determine element type to create nodelist from
    let Attribute =
      filetype == "js" ? "src" : filetype == "css" ? "href" : "none"; //determine corresponding attribute to test for
    let Scripts = document.getElementsByTagName(Element);

    for (let i = Scripts.length; i >= 0; i--) {
      //search backwards within nodelist for matching elements to remove
      let currentScript = Scripts[i];
      if (
        Scripts[i] &&
        Scripts[i].getAttribute(Attribute) !== null &&
        typeof currentScript.src === "string"
      ) {
        let relativeLoc = currentScript.src.split("T3")[1];
        if (relativeLoc === filename) {
          console.warn('dependency: "' + item + '" removed.');
          currentScript.parentNode.removeChild(currentScript); //remove element by calling parentNode.removeChild()
        }
      }
    }
  }
  announce(videoURL, imageURL, imageAlt = "Announcement", once = true) {
    if (!videoURL || !imageURL) {
      throw "GlobalWindowManager: You must provide a media URL as a string for your announcement.";
    }
    let context = this;
    if (sessionStorage.announcementComplete) return;
    let media = new Image();
    let height = window.innerHeight * 0.2;
    let width = (height * 16) / 9;
    let left = window.innerWidth - width - 20;
    let top = 41;
    media.style.marginTop = "55px";
    let playIcon = document.createElement("button");
    playIcon.classList.add("btn", "pfi-media-play", "is-4", "text-danger");
    playIcon.title = "Watch '" + imageAlt + "'";

    let modalContent = document.createElement("div");
    modalContent.classList.add(
      "inline-flex",
      "bg-none",
      "content-center",
      "h-full",
      "w-full",
      "items-center",
      "rounded-md",
      "text-center"
    );

    if (typeof imageURL === "string") {
      media.src = imageURL;
      media.alt = imageAlt;
      media.height = height;
      media.width = width;
      media.onload = function () {
        let announceWindow = context.addWindow({
          container: context.container,
          zIndex: 999999,
          body: modalContent,
          footer: null,
          header: imageAlt,
          snapping: false,
          id: `announcement-DraggableWindows`,
          height: height + 20 + "px",
          left: left + "px",
          top: top + "px",
          width: width + 2 + "px",
          title: imageAlt,
          resizeable: false,
          close: true,
          locked: false,
          snapping: false,
          callouts: false,
          hasManager: true,
        });
        context.announceWindow = announceWindow;
        playIcon.style.position = "absolute";
        playIcon.style.left =
          media.width * 0.5 -
          playIcon.getBoundingClientRect().width * 0.5 +
          "px";
        playIcon.style.top =
          media.height * 0.5 -
          playIcon.getBoundingClientRect().height * 0.5 +
          "px";
        playIcon.style.cursor = "pointer";
        playIcon.onclick = (e) => {
          let video = `
                        <video autoplay controls src="${videoURL}" alt="${imageAlt}" title="${imageAlt}" class="align-middle" type="video/mp4">
                                Your browser does not support the video tag.
                         </video>`;
          modalContent.innerHTML = video;
          let windowEl = context.getWindow(`announcement-DraggableWindows`)[0];
          windowEl.locked = true;
          context.maximize(windowEl);
        };
      };
      modalContent.appendChild(media);
      modalContent.appendChild(playIcon);
    } else {
      this.modal(modalContent, true);
    }
    if (once) sessionStorage.announcementComplete = true;
    setTimeout(function () {
      document.getElementsByTagName("body")[0].setAttribute("scroll", "");
      document.getElementsByTagName("body")[0].style.overflow = "";
      if (context.developerMode)
        console.log("body scroll added after announcement");
    }, 1000);
  }
  // modal
  modal(content, userCanClose = true) {
    this.closeModal();
    if (!content) {
      throw "You must provide content as a string, or html object for your modal.";
    }
    // if (this.modalWindow) {
    //   console.error(
    //     "GlobalWindowManager WARNING - You have attempted to open more than one modal. Max modals allowed is 1. Ensure you are closing previous modal before opening another."
    //   );
    //    console.log('content:', content)
    // }
    let context = this;
    this.createModalCover(userCanClose);
    let modalContent = document.createElement("div");
    modalContent.classList.add(
      "inline-flex",
      "content-space-between",
      "items-center",
      "bg-none",
      "rounded-md",
      "w-full",
      "h-full",
      "modalContent"
    );
    if (typeof content === "string") {
      modalContent.innerHTML = content;
    } else if (typeof content === "object") {
      modalContent.appendChild(content);
    } else {
      console.error("Your modal content must be of type string, or HTML node");
    }
    let left = window.innerWidth * 0.25;
    let top = window.innerHeight * 0.33;
    let width = window.innerWidth * 0.5;
    let height = "auto";
    if (this.isMobile) {
      left = window.innerWidth * 0.05;
      top = window.innerHeight * 0.05;
      width = this.isMobile ? window.innerWidth * 0.9 : "auto";
      height = window.innerHeight * 0.9 + "px";
    }
    let modalWindow = new DraggableWindow({
      parent: context,
      container: context.container,
      zIndex: 999999,
      body: modalContent,
      footer: null,
      header: false,
      snapping: false,
      id: `modal-DraggableWindows`,
      height: height,
      width: width + "px",
      left: left + "px",
      top: top + "px",
      title: "Modal",
      resizeable: false,
      close: false,
      locked: true,
      callouts: false,
      hasManager: true,
    });
    this.modalWindow = modalWindow;
    this.modalWindow.scrollButtons.style.display = "none";
    this.modalWindow.window.style.position = "fixed";
    this.modalWindow.window.style.zIndex = 99999999;
  }
  createModalCover(userCanClose = true) {
    let context = this;
    let modalCover = document.createElement("div");
    modalCover.classList.add("modalcover");
    modalCover.style.zIndex = 9999;
    modalCover.style.width = window.innerWidth + "px";
    modalCover.style.height = window.innerHeight + "px";
    modalCover.style.opacity = 0.4;
    modalCover.style.position = "fixed";
    modalCover.style.left = 0;
    modalCover.style.top = 0;
    modalCover.style.backgroundColor = "white";
    modalCover.onclick = (e) => {
      if (userCanClose) {
        context.closeModal(e);
      }
    };
    this.container.appendChild(modalCover);
    document.querySelector("body").style.overflowY = "hidden";
    this.modalCover = modalCover;
  }
  closeModal() {
    let context = this;
    let modals = document.querySelectorAll("#modal-DraggableWindows");
    let covers = document.querySelectorAll(".modalcover");
    if (modals && modals.length) {
      modals.forEach((modal) => {
        modal.remove();
      });
    }
    if (covers && covers.length) {
      covers.forEach((cover) => {
        cover.remove();
      });
    }
  }
  confirm(
    heading,
    confirmFunction = () => {},
    dismissFunction = this.closeModal
  ) {
    let context = this;
    this.closeModal();
    if (typeof heading !== "string") {
      console.error(
        "Warning modals only allow string text as params, use `.modal(content)` for more advanced modals."
      );
      return;
    }
    let closeModalContent = document.createElement("div");
    let closeConfirm = `
                <div style="align-content: center;"
                class="text-center p-4 grid grid-cols-1 gap-4 place-content-center">
                    <h3>${heading || "Confirm:"}</h3>
                    <div class="text-center align-bottom">
                        <button class="acceptModalBtn bg-yellow-500 hover:bg-yellow-700 py-2 px-4 rounded-md">Yes</button><button class="m-3 dismissModalBtn bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded-md">No</button>
                    </div>
                </div>
                `;
    closeModalContent.classList.add(
      "inline-flex",
      "content-space-between",
      "items-center",
      "justify-center",
      "bg-none",
      "rounded-md",
      "w-full",
      "h-full",
      "modalContent"
    );
    closeModalContent.innerHTML = closeConfirm;
    let confirm = closeModalContent.querySelector(".acceptModalBtn");
    confirm.onclick = (e) => {
      confirmFunction();
      context.closeModal();
    };
    let dismiss = closeModalContent.querySelector(".dismissModalBtn");
    dismiss.onclick = (e) => {
      dismissFunction();
      context.closeModal();
    };
    context.modal(closeModalContent, false);
    context.modalWindow.window
      .querySelector(".modalContent")
      .classList.remove(
        "inline-flex",
        "content-space-around",
        "bg-none",
        "w-full"
      );
  }
  warn(heading, complete = function () {}) {
    this.closeModal();
    let context = this;
    if (typeof heading !== "string") {
      console.error(
        "Warning modals only allow string text as params, use `.modal(content)` for more advanced modals."
      );
      return;
    }

    let closeModalContent = document.createElement("div");
    closeModalContent.classList.add(
      "inline-flex",
      "content-space-between",
      "items-center",
      "bg-none",
      "rounded-md",
      "w-full",
      "h-full",
      "modalContent",
      "text-center"
    );
    let closeConfirm = `
                <div class="p-4 w-full h-full text-center">
                    <h4 class="text-center">${heading}</h4>
                    <div class="text-center align-bottom">
                        <button style="color:${
                          context.darkMode
                            ? context.darkModeColor
                            : context.color
                        };
                         background-color:${
                           context.darkMode
                             ? context.darkModeHeaderColor
                             : context.headerColor
                         };
                         border: solid 1px ${context.borderColor};"
                         "
                         class="text-center acceptModalBtn m-3 px-4 py-2 rounded-md">OK</button>
                    </div>
                </div>
                `;
    closeModalContent.innerHTML = closeConfirm;
    let confirm = closeModalContent.querySelector(".acceptModalBtn");
    confirm.onclick = (e) => {
      context.closeModal();
      complete();
    };
    context.modal(closeModalContent, true);

    context.modalWindow.window
      .querySelector(".modalContent")
      .classList.remove(
        "inline-flex",
        "content-space-around",
        "bg-none",
        "w-full"
      );
  }
  callout(text, color = "green", id) {
    let context = this;
    if (!id) {
      if (!this.calloutMessages || this.calloutMessages.length) {
        let calloutTemplate = `
          <div class="scrolling-container">
          </div>
        `;
        if (this.calloutMessageContainer) {
          this.calloutMessageContainer.style.display = "block";
        } else {
          this.calloutMessageContainer = document.createElement("div");
          this.calloutMessageContainer.style.width = "100%";
          this.calloutMessageContainer.innerHTML = calloutTemplate;
          this.calloutMessageContainer.querySelector(
            ".scrolling-container"
          ).style.height = this.offset + "px";
          this.container.appendChild(this.calloutMessageContainer);
        }
        this.calloutMessages = [];
      }
      let CalloutText = document.createElement("div");
      CalloutText.innerHTML = text;
      CalloutText.classList.add(
        "scrolling-text",
        text.replace(/\s/g, "-"),
        "h-full",
        "text-center",
        "items-center"
      );
      CalloutText.style.backgroundColor = color;
      this.calloutMessages.push(CalloutText);
      const TimerQueue = function () {
        let timers = [];
        let running = false;
        let currentInterval;
        let currentTimer;
        this.addTimer = function (fn, delay) {
          timers.push({ fn: fn, delay: delay });
            function exec() {
              clearInterval(currentInterval);
              if (timers.length > 0) {
                currentTimer.fn();
                currentTimer = timers.shift();
                // make first timer instant.
                currentInterval = setInterval(exec, currentTimer.delay);
              } else {
                running = false;
                context.calloutMessageContainer.querySelector(
                  ".scrolling-container"
                ).style.zIndex = -99999;
              }
            }
            if (!running) {
              context.calloutMessageContainer.querySelector(
                ".scrolling-container"
              ).style.zIndex = 99999;
              fn();
              running = true;
              currentTimer = timers.shift();
              currentInterval = setInterval(exec, currentTimer.delay);
            }
        };
        this.clear = function () {
          if (currentInterval) {
            clearInterval(currentInterval);
          }
          timers = [];
          running = false;
        };
        return this;
      };
      if (!this.queue) this.queue = new TimerQueue();
      this.queue.addTimer(function () {
        context.calloutMessageContainer
          .querySelector(".scrolling-container")
          .appendChild(CalloutText);
      }, 2000);
    } else {
      let calloutWindow = this.getWindow(id);
      if (!calloutWindow || !calloutWindow.length) {
        throw (
          "GlobalWindowManager Callouts Error: Window " + id + " not found."
        );
      }
      return calloutWindow[0].callouts;
    }
  }
  getWindow(id) {
    return this.windows.filter((x) => {
      if (x.id === id) {
        return x;
      }
    });
  }
  hoverWindow(e){
    let el = document.elementFromPoint(e.clientX, e.clientY);
    let found = this.windows.filter((x) => {
      if (x.window.contains(el)) {
        this.hoveredWindow = x;
        this.AppsManager.RunningApps.filter((app)=> {
          if (app.id === this.hovered.id)
          this.hoveredApp = app;
        })
      }
    });
  }
  bodyScroll(enabled = true) {
    let x = 0;
    this.windows.forEach((window) => {
      if (
        !window.window.style.transform &&
        !window.id.split("-").includes("workspaceToolBar") &&
        !window.id.split("-").includes("announcement")
      ) {
        x++;
      }
    });
    this.windowsOpen = x;
    //console.log(x, enabled, ": windows enabled, setting scroll to ON");
    if (!enabled || this.windowsOpen > 0) {
      document.getElementsByTagName("body")[0].setAttribute("scroll", "no");
      document.getElementsByTagName("body")[0].style.overflow = "hidden";
    } else {
      document.getElementsByTagName("body")[0].setAttribute("scroll", "");
      document.getElementsByTagName("body")[0].style.overflow = "";
    }
  }
  swipe(direction) {
    let context = this;
    if (this.isMobile) {
      switch (direction) {
        case "left":
          if (context.toolBarPosition === "right") {
            if (!context.toolBarVisible) {
              context.showToolbar();
            } else {
              context.expandToolBar();
            }
          } else if (context.toolBarPosition === "left") {
            if (context.expanded) {
              context.collapseToolbar();
            } else {
              context.hideToolbar();
            }
         }
          break;
        case "right":
          if (context.toolBarPosition === "left") {
            if (!context.toolBarVisible) {
              context.showToolbar();
            } else {
              context.expandToolBar();
            }
          } else if (context.toolBarPosition === "right") {
            if (context.expanded) {
              context.collapseToolbar();
            } else {
              context.hideToolbar();
            }
          }
          break;
        case "up":
          if (context.toolBarPosition === "bottom") {
            if (!context.toolBarVisible) {
              context.showToolbar();
            } else {
              context.expandToolBar();
            }
          } else if (context.toolBarPosition === "top") {
            if (context.expanded) {
              context.collapseToolbar();
            } else {
              context.hideToolbar();
            }
          }
          break;
        case "down":
          if (context.toolBarPosition === "top") {
            if (!context.toolBarVisible) {
              context.showToolbar();
            } else {
              context.expandToolBar();
            }
          } else if (context.toolBarPosition === "bottom") {
            if (context.expanded) {
              context.collapseToolbar();
            } else {
              context.hideToolbar();
            }
          }
          break;
        default:
          return;
      }
    }
  }
  async unitTest() {
    let startLoad = new Date();
    let appTimer = function (date) {
      const date1 = date || startLoad;
      const date2 = new Date();
      const diffTime = Math.abs(date2 - date1);
      return diffTime + " ms";
    };
    console.log(
      "%c------ UNIT TESTING STARTED -------",
      "color:black; background:#ffd530"
    );
    GetApps()
      .then(async function (response) {
        let result = response;
        console.log("All Apps:", result);
        await Promise.all(result.map(async (app) => {
          if (!app.URL && app.Active) {
            let appLoad = new Date();
            console.log(
              "%cStarting App " + app.AppID + " - " + app.AppTitle,
              "background: #222; color: #bada55"
            );
            await GlobalWindowManager.AppsManager.start(app).then(async res => {
              if (typeof app.test === "function") {
                await app.test();
              } else {
                console.log(
                  "%c" +
                    app.AppTitle +
                    " class does not contain a .test() method. Consider adding one to the App class methods, " +
                    "and populating it with integration/unit tests unique to that app's functionality. ",
                  "background: #A0A0A0; color: blue"
                );
              }
              if (
                res &&
                (typeof res.id !== "undefined" ||
                  typeof res.initOptions !== "undefined")
              ) {
                GlobalWindowManager.removeWindow(res.initOptions.id);
                console.log(
                  "%cExiting  " +
                    app.AppTitle +
                    " . . . total loading time: " +
                    appTimer(appLoad),
                  "background: #A0A0A0; color: blue"
                );
              } else {
                console.error(
                  "%cUnable to remove the following app:" +
                    app.AppTitle +
                    " - Check for errors within the App.",
                  "color: red"
                );
              }
            });
          }
        })).then(res => {
          console.log(
            "%c------ UNIT TESTING COMPLETE " + appTimer() + " -------",
            "color:black; background:#ffd530"
          );
          document
            .querySelectorAll(".html-spinner")
            .forEach((spinner) => spinner.remove());
        });
      })
      .catch((err) => {
        console.error(err.message);
        GlobalWindowManager.loadingSpinner.hide();
      });
  }
}

function getTimestampInSeconds() {
  return Math.floor(Date.now() / 1000);
}
// helper method to move array indexes, used specifically in pinning thread replies and maintaining state.
Array.prototype.move = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
};
// color code conversion helpers
function componentToHex(c) {
  let hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}
const hexToRgb = (hex) => {
  let values = hex
    .replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => "#" + r + r + g + g + b + b
    )
    .substring(1)
    .match(/.{2}/g)
    .map((x) => parseInt(x, 16));
  return `rgb(${values[0]}, ${values[1]}, ${values[2]})`;
};
// random color rgba
function random_rgba() {
  let o = Math.round,
    r = Math.random,
    s = 255;
  return (
    "rgba(" + o(r() * s) + "," + o(r() * s) + "," + o(r() * s) + "," + 1 + ")"
  );
}

/*!
 * swiped-events.js - v1.1.6
 * Pure JavaScript swipe events
 * https://github.com/john-doherty/swiped-events
 * @inspiration https://stackoverflow.com/questions/16348031/disable-scrolling-when-touch-moving-certain-element
 * @author John Doherty <www.johndoherty.info>
 * @license MIT
 */
!(function (t, e) {
  "use strict";
  "function" != typeof t.CustomEvent &&
    ((t.CustomEvent = function (t, n) {
      n = n || { bubbles: !1, cancelable: !1, detail: void 0 };
      let a = e.createEvent("CustomEvent");
      return a.initCustomEvent(t, n.bubbles, n.cancelable, n.detail), a;
    }),
    (t.CustomEvent.prototype = t.Event.prototype)),
    e.addEventListener(
      "touchstart",
      function (t) {
        if ("true" === t.target.getAttribute("data-swipe-ignore")) return;
        (s = t.target),
          (r = Date.now()),
          (n = t.touches[0].clientX),
          (a = t.touches[0].clientY),
          (u = 0),
          (i = 0);
      },
      !1
    ),
    e.addEventListener(
      "touchmove",
      function (t) {
        if (!n || !a) return;
        let e = t.touches[0].clientX,
          r = t.touches[0].clientY;
        (u = n - e), (i = a - r);
      },
      !1
    ),
    e.addEventListener(
      "touchend",
      function (t) {
        if (s !== t.target) return;
        let e = parseInt(l(s, "data-swipe-threshold", "20"), 10),
          o = parseInt(l(s, "data-swipe-timeout", "500"), 10),
          c = Date.now() - r,
          d = "",
          p = t.changedTouches || t.touches || [];
        Math.abs(u) > Math.abs(i)
          ? Math.abs(u) > e &&
            c < o &&
            (d = u > 0 ? "swiped-left" : "swiped-right")
          : Math.abs(i) > e &&
            c < o &&
            (d = i > 0 ? "swiped-up" : "swiped-down");
        if ("" !== d) {
          let b = {
            dir: d.replace(/swiped-/, ""),
            touchType: (p[0] || {}).touchType || "direct",
            xStart: parseInt(n, 10),
            xEnd: parseInt((p[0] || {}).clientX || -1, 10),
            yStart: parseInt(a, 10),
            yEnd: parseInt((p[0] || {}).clientY || -1, 10),
          };
          s.dispatchEvent(
            new CustomEvent("swiped", {
              bubbles: !0,
              cancelable: !0,
              detail: b,
            })
          ),
            s.dispatchEvent(
              new CustomEvent(d, { bubbles: !0, cancelable: !0, detail: b })
            );
        }
        (n = null), (a = null), (r = null);
      },
      !1
    );
  let n = null,
    a = null,
    u = null,
    i = null,
    r = null,
    s = null;
  function l(t, n, a) {
    for (; t && t !== e.documentElement; ) {
      let u = t.getAttribute(n);
      if (u) return u;
      t = t.parentNode;
    }
    return a;
  }
})(window, document);
