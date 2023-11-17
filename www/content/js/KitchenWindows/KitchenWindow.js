﻿// An individual Window
class DraggableWindow {
  constructor(options) {
    this.options = options; // options object must be defined
    if (!options) {
      throw "DraggableWindow options must be defined!";
    }
    if (typeof options.container === "undefined" || !options.container) {
      throw "DraggableWindow container element must be defined. Add one to your index and pass in as an option.";
    }
    this.parent = options.parent;
    this.hasManager = options.hasManager; // READOONLY - will only be true if GlobalWindowManager created this window. READONLY
    let sanitized = options.parent.toolBarWidth;
    if (typeof options.parent.toolBarWidth === "string") {
      sanitized.replace("p", "");
      sanitized.replace("x", "");
    }
    this.offset = parseInt(sanitized);
    this.halfset = this.offset * 0.5; //for calculations only
    this.height =
      options.height === null || typeof options.height === "undefined"
        ? window.innerHeight - this.offset + "px"
        : options.height; // set height of window on creation
    this.width =
      options.width === null || typeof options.width === "undefined"
        ? window.innerWidth - this.offset + "px"
        : options.width; // set width of window on creation
    this.left = options.left; // set left position of window on creation
    this.top = options.top; // set top position of window on creation
    this.zIndex = this.options.zIndex ? this.options.zIndex : 10; // default z index
    this.id = this.options.id || `newWindow-${Date.now()}`; // unique id for the window
    this.resizeable = options.resizeable; // enables resizing of window
    this.onClose = options.onClose || function () {}; // fires when a window is closed
    this.onMaximize = options.onMaximize || function () {}; // fires when window is made full screen
    this.onMinimize = options.onMinimize || function () {}; // fires when window is minimized to tray
    this.onOpen = options.onOpen || function () {}; //fires when window is openend
    // elements
    this.container = this.options.container; // container
    this.window = document.createElement("div"); // window base element
    this.window.setAttribute("id", this.id); // set unique id for the window
    this.header = this.options.header; // header content
    this.footer = this.options.footer; // footer content
    this.body = this.options.body; // body content
    this.showScrollButton = this.showScrollButton.bind(this);
    this.locked =
      options.locked !== null && typeof options.locked !== "undefined"
        ? options.locked
        : true; // windows will be locked to grid sizes by default
    this.snapping =
      options.snapping === null || typeof options.snapping === "undefined"
        ? options.locked
        : options.snapping; // turn this on/off for snapping to grid
    this.draggable =
      options.draggable !== null && typeof options.draggable !== "undefined"
        ? options.draggable
        : true; // windows will be locked in place/position if false, eg. NOT draggable.
    if (this.locked) this.resizeable = false;
    if (this.locked) this.snapping = true;
    this.title =
      typeof options.title === "undefined" || options.title === null
        ? this.id
        : options.title; // title of window, defaults to id
    this.close =
      typeof options.close === "undefined" || options.close === null
        ? true
        : options.close;
    this.minimize =
      typeof options.minimize === "undefined" || options.minimize === null
        ? this.close
        : options.minimize;
    this.maximize =
      typeof options.maximize === "undefined" || options.maximize === null
        ? this.close
        : options.maximize;
    let calloutContainer = this.window;
    if (
      typeof this.options.callouts === "boolean" &&
      this.options.callouts !== false
    ) {
      this.callouts = new clsCalloutMsg({ containerElement: calloutContainer });
      this.callouts.containerElement
        .querySelector(".calloutMsgs")
        .classList.add("pt-4", "text-center");
      this.callouts.containerElement.querySelector(".calloutMsgs").style.color =
        "white";
      this.callouts.containerElement.querySelector(
        ".calloutMsgs"
      ).style.position = "absolute";
      this.callouts.containerElement.querySelector(
        ".calloutMsgs"
      ).style.height = "75px";
      this.callouts.containerElement.querySelector(".calloutMsgs").style.width =
        "100%";
    } else {
      this.callouts = function () {
        console.error("Callouts have been disabled via window options.");
      };
    }
    //initial element creation methods:
    if (typeof this.header === "string") {
      let headerText = this.header;
      this.header = document.createElement("div");
      this.header.setAttribute("id", `${this.id}-header`);
      this.header.innerHTML = headerText;
    } else if (typeof this.header === "undefined") {
      console.warn("No Header Defined, your window will have a blank header.");
      this.header = document.createElement("div");
      this.header.setAttribute("id", `${this.id}-header`);
      this.header.innerHTML = this.title;
    } else if (this.header === false) {
      this.header = document.createElement("div");
      this.header.setAttribute("id", `${this.id}-no-header`);
      this.header.innerHTML = "";
    } else {
      let headerEl = this.header;
      this.header = document.createElement("div");
      this.header.setAttribute("id", `${this.id}-header`);
      this.header.appendChild(headerEl);
    }
    if (
      typeof options.body === "undefined" ||
      options.body === null ||
      !options.body
    ) {
      console.warn(
        "No body element specified. Your content will show as empty"
      );
      this.body = document.createElement("div");
      this.body.setAttribute("id", `${this.id}-body`);
      this.body.innerHTML = "";
    } else {
      if (typeof this.body === "string") {
        let bodyText = this.body;
        this.body = document.createElement("div");
        this.body.setAttribute("id", `${this.id}-body`);
        this.body.innerHTML = bodyText;
      } else {
        let bodyElement = this.body;
        this.body = document.createElement("div");
        this.body.setAttribute("id", `${this.id}-body`);
        this.body.appendChild(bodyElement);
      }
    }
    if (
      typeof options.footer !== "undefined" &&
      options.footer !== null &&
      options.footer
    ) {
      if (typeof this.footer === "string") {
        let footerText = options.footer;
        this.footer = document.createElement("div");
        this.footer.setAttribute("id", `${this.id}-footer`);
        this.footer.innerHTML = footerText;
      } else {
        this.footer = document.createElement("div");
        this.footer.appendChild(options.footer);
        this.footer.setAttribute("id", `${this.id}-footer`);
      }
    }
    if (this.close) {
      this.closeButton = document.createElement("span");
      this.closeButton.style = `
            cursor: pointer;
            color: ${
              this.parent.darkMode
                ? this.parent.darkModeColor
                : this.parent.color
            };
            position:absolute;
            right: 6px;
            `;
      this.closeButton.innerHTML = `
                <b type="button" class="closeWindowButton fs-6 pfi-math-multiply" aria-label="Close"></b>
            `;
      if (!this.hasManager) {
        this.closeButton.onclick = (e) => {
          this.window.remove();
          this.onClose();
        };
      }
      this.header.appendChild(this.closeButton);
    }
    if (this.maximize && this.hasManager) {
      this.maximizeButton = document.createElement("span");
      this.maximizeButton.style = `
            cursor: pointer;
            color:  ${
              this.parent.darkMode
                ? this.parent.darkModeColor
                : this.parent.color
            };
            position:absolute;
            right: 24px;
            top: -2px;
            `;
      this.maximizeButton.innerHTML = `
                <b type="button" class="fs-6 mt-1 me-1 pfi-maximize fa-solid maximizeWindowButton" aria-label="Maximize"></b>
            `;
      this.header.appendChild(this.maximizeButton);
    }
    if (this.minimize && this.hasManager) {
      this.minimizeButton = document.createElement("span");
      this.minimizeButton.style = `
            cursor: pointer;
            color:  ${
              this.parent.darkMode
                ? this.parent.darkModeColor
                : this.parent.color
            };
            position:absolute;
            right: 46px;
            top: -2px;
            `;
      this.minimizeButton.innerHTML = `
                <b type="button" class="fs-5 mt-1 me-1 pfi-minimize fa-solid minimizeWindowButton" aria-label="Minimize"></b>
            `;
      this.header.appendChild(this.minimizeButton);
    }
    this.container.appendChild(this.window);
    this.draggableContent = this.container.querySelector("#" + this.id);
    this.draggableContent.style = `
            position: fixed;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            z-index: ${this.zIndex};
            color:${
              this.parent.darkMode
                ? this.parent.darkModeColor
                : this.parent.color
            };
            background-color: ${
              this.parent.darkMode
                ? this.parent.darkModeBackgroundColor
                : this.parent.backgroundColor
            };
            width: ${
              !this.resizeable ? this.width : this.width ? this.width : "auto"
            };
            height: ${
              !this.resizeable
                ? this.height
                : this.height
                ? this.height
                : "auto"
            };
            left: ${this.left};
            top: ${this.top};
            min-height: 30px;
            min-width: 30px;
            resize: ${this.resizeable ? "both" : ""};
            overflow: auto;
            border: 1px solid ${
              this.parent.darkMode
                ? this.parent.darkModeBorderColor
                : this.parent.borderColor
            };
        `;

    if (this.header.id !== `${this.id}-no-header`) {
      let borderColor = this.parent.darkMode ? this.parent.darkModeBorderColor : this.parent.borderColor;
      this.borderColor =  this.options.IconColor ? this.options.IconColor : this.borderColor;
      this.header.style = `
            box-sizing: border-box;
            -moz-box-sizing: border-box;
            -webkit-box-sizing: border-box;
            cursor: move;
            z-index: ${this.zIndex + 20};
            padding: 1px !important;
            color: ${
              this.parent.darkMode
                ? this.parent.darkModeColor
                : this.parent.Color
            };
            position: fixed;
            text-align: center;
            width: ${this.draggableContent.getBoundingClientRect().width}px;
            left: ${this.left};
            top: ${this.top};
            border-color: ${borderColor} ${borderColor} ${this.borderColor} ${borderColor};
            border-style: solid;
            border-width: 1px 1px 3px 1px;
            background-color: ${
              this.parent.darkMode
                ? this.parent.darkModeBackgroundColor
                : this.parent.backgroundColor
            };
            `;
      this.draggableContent.style.paddingTop =
        this.header.getBoundingClientRect().height + "px";
      this.draggableContent.appendChild(this.header);
    }
    // scroll buttons
    this.scrollButton = document.createElement("span");
    this.scrollButton.innerHTML = `<button class="m-0 p-0 pfi-arrow-down is-1" id="scrollButton-${this.id}" title="go to bottom or bottom of window"></button>`;
    this.scrollButton = this.scrollButton.firstChild;
    this.scrollButton.onclick = function () {
      if (this.scrollButton.classList.contains("pfi-arrow-down")) {
        this.draggableContent.scrollTop = this.draggableContent.scrollHeight;
      } else {
        this.draggableContent.scrollTop = 0;
      }
    }.bind(this);
    this.scrollButtons = document.createElement("div");
    this.scrollButtons.appendChild(this.scrollButton);
    this.header.appendChild(this.scrollButtons);
    this.scrollButtons.style = `
            position: absolute;
            top: 2px;
            left: 2px;
            z-index: 99999;
            cursor: pointer;
        `;
    //footer styles
    if (this.footer) {
      this.footer.style = `
            box-sizing: border-box;
            -moz-box-sizing: border-box;
            -webkit-box-sizing: border-box;
            padding: .5rem !important;
            color: ${
              this.parent.darkMode
                ? this.parent.darkModeColor
                : this.parent.Color
            };
            position: fixed;
            text-align: center;
            margin: 0px !important;
            width: ${this.draggableContent.getBoundingClientRect().width}px;
            left: ${this.header.getBoundingClientRect().left}px;
            border-color: ${
              this.parent.darkMode
              ? this.parent.darkModeBackgroundColor
              : this.parent.backgroundColor
            };
            border-width: 0px 1px 0px 1px;
            background-color: ${
              this.parent.darkMode
                ? this.parent.darkModeBackgroundColor
                : this.parent.backgroundColor
            };
            `;
      this.body.appendChild(this.footer);
      this.footer.style.top = `${
        this.draggableContent.getBoundingClientRect().height +
        this.draggableContent.getBoundingClientRect().top -
        this.footer.getBoundingClientRect().height
      }px`;
    }
    this.body.style = `
            z-index:${this.zIndex};
            height:100%;
            background-color: ${
              this.parent.darkMode
                ? this.parent.darkModeBackgroundColor
                : this.parent.backgroundColor
            }
          `;
    this.draggableContent.appendChild(this.body);
    this.container.appendChild(this.draggableContent);
    this.dragElement = this.dragElement.bind(this);
    this.checkPos = this.checkPos.bind(this);
    this.hideShadows = this.hideShadows.bind(this);
    this.showShadow = this.showShadow.bind(this);
    this.createShadows = this.createShadows.bind(this);
    //init logic
    if (this.snapping) {
      this.createShadows();
      this.hideShadows();
    }
    this.dragElement();
    this.timemoutHide;
    this.scrollPosY = this.draggableContent.scrollTop;
    this.draggableContent.addEventListener(
      "scroll",
      function () {
        this.showScrollButton();
      }.bind(this)
    );
    if (
      typeof this.options.initialPosition === "object" &&
      this.options.initialPosition.length
    ) {
      this.snapTo(
        this.draggableContent,
        this.options.initialPosition[0],
        this.options.initialPosition[1]
      );
    }
  }
  createShadows() {
    this.parent.createShadows();
  }
  dragElement(el) {
    let context = this;
    window.addEventListener("resize", function () {
      context.checkSize();
      context.createShadows();
    });
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    if (!this.draggable) return;
    if (!el) {
      el = this.draggableContent;
    }
    if (context.header) {
      context.header.onmousedown = dragMouseDown;
      context.header.ontouchmove = dragMouseDown;
    }
    function dragMouseDown(e) {
      e = e || window.event;
      context.checkSize();
      if (e.cancelable) e.preventDefault();
      if (e.target.id === context.id + "-header") {
        if (context.isMobile && typeof e.touches !== "undefined") {
          e.clientX = e.touches[0].clientX;
          e.clientY = e.touches[0].clientY;
        }
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        if (context.isMobile) {
          context.header.addEventListener("touchend", closeDragElement, {
            passive: false,
          });
          context.header.addEventListener("touchmove", elementDrag, {
            passive: false,
          });
        } else {
          document.onmouseup = closeDragElement;
          document.onmousemove = elementDrag;
        }
      }
    }
    function elementDrag(e) {
      e = e || window.event;
      if (e.cancelable) e.preventDefault();
      if (e.touches && this.isMobile) {
        e.clientX = e.touches[0].clientX;
        e.clientY = e.touches[0].clientY;
      }
      if (context.footer) context.footer.style.transition = '';
      if (context.snapping) {
        el.style.top = e.clientY + "px";
        el.style.left = e.clientX - el.getBoundingClientRect().width / 2 + "px";
        el.style.width = "360px";
        el.style.height = "360px";
        context.header.style.width = el.style.width;
        if (context.footer) context.footer.style.width = el.style.width;
      }
      // console.log(e.clientX, e.clientY)
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      el.style.top = el.offsetTop - pos2 + "px";
      el.style.left = el.offsetLeft - pos1 + "px";
      context.header.style.left = el.offsetLeft - pos1 + "px";
      context.header.style.top = el.offsetTop - pos2 + "px";
      if (context.footer) {
        context.footer.style.left = el.offsetLeft - pos1 + "px";
        context.footer.style.width =  parseInt(el.style.width.replace('px', ''))+ "px";
        context.footer.style.top = `${
          parseInt(el.style.height.replace('px', '')) +
          parseInt(el.style.top.replace('px', '')) -
          context.footer.getBoundingClientRect().height - 1
        }px`;
      }
      if (context.snapping) {
        // console.table(el.getBoundingClientRect().width, el.getBoundingClientRect().height , el.offsetLeft, el.offsetTop, pos1, pos2, pos3, pos4)
        context.orientation = context.checkPos(
          el.offsetLeft - pos1 + 0.5 * el.getBoundingClientRect().width,
          el.offsetTop - pos2 + 0.5 * el.getBoundingClientRect().height
        );
        context.showShadow(context.orientation[0], context.orientation[1]);
      }
    }

    function closeDragElement() {
      context.orientation = context.checkPos(
        el.offsetLeft - pos1 + 0.5 * el.getBoundingClientRect().width,
        el.offsetTop - pos2 + 0.5 * el.getBoundingClientRect().height
      );
      if (context.snapping) {
        context.snapTo(
          context.draggableContent,
          context.orientation[0],
          context.orientation[1]
        );
        context.header.style.width = el.style.width;
        context.header.style.left = el.style.left;
        context.header.style.top = el.style.top;
        if (context.footer && context.parent.isMobile) {
          context.footer.style.width = el.style.width;
          context.footer.style.left = el.style.left;
          context.footer.style.top = `${
            parseInt(el.style.height.replace('px', '')) +
            parseInt(el.style.top.replace('px', '')) -
            context.footer.getBoundingClientRect().height - 1
          }px`;
        }
        context.hideShadows();
      }
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
  snapTo(el, x, y) {
    let context = this;
    if(context.footer) context.footer.style.transition = "";
    if (this.isMobile) {
      if (window.innerHeight > window.innerWidth) {
        if (y === "top") {
          if (this.parent.toolBarPosition === "top") {
            el.style.bottom = "";
            el.style.top = this.offset + "px";
            el.style.left = 0 + "px";
            el.style.right = "";
            el.style.height =
              parseFloat(window.innerHeight * 0.5) - this.halfset + "px";
            el.style.width = parseFloat(window.innerWidth) + "px";
          } else if (this.parent.toolBarPosition === "right") {
            el.style.bottom = "";
            el.style.top = 0 + "px";
            el.style.right = "";
            el.style.left = "0px";
            el.style.height = parseFloat(window.innerHeight * 0.5) + "px";
            el.style.width = parseFloat(window.innerWidth) - this.offset + "px";
          } else if (this.parent.toolBarPosition === "left") {
            el.style.bottom = "";
            el.style.top = 0 + "px";
            el.style.left = this.offset + "px";
            el.style.right = "";
            el.style.height = parseFloat(window.innerHeight * 0.5) + "px";
            el.style.width = parseFloat(window.innerWidth) - this.offset + "px";
          } else {
            el.style.bottom = "";
            el.style.top = 0 + "px";
            el.style.left = 0 + "px";
            el.style.right = "";
            el.style.height =
              parseFloat(window.innerHeight * 0.5) - this.halfset + "px";
            el.style.width = parseFloat(window.innerWidth) + "px";
          }
        } else if (y === "bottom") {
          if (this.parent.toolBarPosition === "top") {
            el.style.bottom = "";
            el.style.top =
              parseFloat(window.innerHeight * 0.5) + this.halfset + "px";
            el.style.left = 0 + "px";
            el.style.right = "";
            el.style.height =
              parseFloat(window.innerHeight * 0.5) - this.halfset + "px";
            el.style.width = parseFloat(window.innerWidth) + "px";
          } else if (this.parent.toolBarPosition === "right") {
            el.style.bottom = "0px";
            el.style.top = "";
            el.style.right = "";
            el.style.left = "0px";
            el.style.height = parseFloat(window.innerHeight * 0.5) + "px";
            el.style.width = parseFloat(window.innerWidth) - this.offset + "px";
          } else if (this.parent.toolBarPosition === "left") {
            el.style.bottom = "";
            el.style.top = parseFloat(window.innerHeight * 0.5) + "px";
            el.style.left = this.offset + "px";
            el.style.right = "";
            el.style.height = parseFloat(window.innerHeight * 0.5) + "px";
            el.style.width = parseFloat(window.innerWidth) - this.offset + "px";
          } else {
            el.style.bottom = "";
            el.style.top =
              parseFloat(window.innerHeight * 0.5) - this.halfset + "px";
            el.style.left = 0 + "px";
            el.style.right = "";
            el.style.height =
              parseFloat(window.innerHeight * 0.5) - this.halfset + "px";
            el.style.width = parseFloat(window.innerWidth) + "px";
          }
        } else {
          if (this.locked) {
            if (this.parent.toolBarPosition === "top") {
              el.style.left = "0px";
              el.style.right = "";
              el.style.bottom = "";
              el.style.top = this.offset + "px";
              el.style.height =
                parseFloat(window.innerHeight) - this.offset + "px";
              el.style.width = parseFloat(window.innerWidth) + "px";
            } else if (this.parent.toolBarPosition === "right") {
              el.style.left = "";
              el.style.right = this.offset + "px";
              el.style.bottom = "";
              el.style.top = 0 + "px";
              el.style.height = parseFloat(window.innerHeight) + "px";
              el.style.width =
                parseFloat(window.innerWidth) - this.offset + "px";
            } else if (this.parent.toolBarPosition === "left") {
              el.style.left = this.offset + "px";
              el.style.right = "";
              el.style.bottom = "";
              el.style.top = "0px";
              el.style.height = parseFloat(window.innerHeight) + "px";
              el.style.width =
                parseFloat(window.innerWidth) - this.offset + "px";
            } else {
              el.style.left = "0px";
              el.style.right = "";
              el.style.bottom = this.offset + "px";
              el.style.top = "";
              el.style.height =
                parseFloat(window.innerHeight) - this.offset + "px";
              el.style.width = parseFloat(window.innerWidth) + "px";
            }
          }
        }
      } else {
        if (x === "right") {
          if (this.parent.toolBarPosition === "top") {
            el.style.bottom = "";
            el.style.top = this.offset + "px";
            el.style.left = parseFloat(window.innerWidth * 0.5) + "px";
            el.style.right = "";
            el.style.height =
              parseFloat(window.innerHeight) - this.offset + "px";
            el.style.width = parseFloat(window.innerWidth * 0.5) + "px";
          } else if (this.parent.toolBarPosition === "right") {
            el.style.bottom = "";
            el.style.top = "0px";
            el.style.right = "";
            el.style.left =
              parseFloat(window.innerWidth * 0.5) - this.halfset + "px";
            el.style.height = parseFloat(window.innerHeight) + "px";
            el.style.width =
              parseFloat(window.innerWidth * 0.5) - this.halfset + "px";
          } else if (this.parent.toolBarPosition === "left") {
            el.style.bottom = "";
            el.style.top = "0px";
            el.style.right = "";
            el.style.left =
              parseFloat(window.innerWidth * 0.5) + this.halfset + "px";
            el.style.height = parseFloat(window.innerHeight) + "px";
            el.style.width =
              parseFloat(window.innerWidth * 0.5) - this.halfset + "px";
          } else {
            el.style.bottom = "";
            el.style.top = "0px";
            el.style.left = parseFloat(window.innerWidth * 0.5) + "px";
            el.style.right = "";
            el.style.height =
              parseFloat(window.innerHeight) - this.offset + "px";
            el.style.width = parseFloat(window.innerWidth * 0.5) + "px";
          }
        } else if (x === "left") {
          if (this.parent.toolBarPosition === "top") {
            el.style.bottom = "";
            el.style.top = this.offset + "px";
            el.style.left = "0px";
            el.style.right = "";
            el.style.height =
              parseFloat(window.innerHeight) - this.offset + "px";
            el.style.width = parseFloat(window.innerWidth * 0.5) + "px";
          } else if (this.parent.toolBarPosition === "right") {
            el.style.bottom = "";
            el.style.top = "0px";
            el.style.right = "";
            el.style.left = "0px";
            el.style.height = parseFloat(window.innerHeight) + "px";
            el.style.width =
              parseFloat(window.innerWidth * 0.5) - this.halfset + "px";
          } else if (this.parent.toolBarPosition === "left") {
            el.style.bottom = "";
            el.style.top = "0px";
            el.style.right = "";
            el.style.left = this.offset + "px";
            el.style.height = parseFloat(window.innerHeight) + "px";
            el.style.width =
              parseFloat(window.innerWidth * 0.5) - this.halfset + "px";
          } else {
            el.style.bottom = this.offset + "px";
            el.style.top = "";
            el.style.left = "0px";
            el.style.right = "";
            el.style.height =
              parseFloat(window.innerHeight) - this.offset + "px";
            el.style.width = parseFloat(window.innerWidth * 0.5) + "px";
          }
        } else {
          if (this.locked) {
            if (this.parent.toolBarPosition === "top") {
              el.style.left = "0px";
              el.style.right = "";
              el.style.bottom = "";
              el.style.top = this.offset + "px";
              el.style.height =
                parseFloat(window.innerHeight) - this.offset + "px";
              el.style.width = parseFloat(window.innerWidth) + "px";
            } else if (this.parent.toolBarPosition === "right") {
              el.style.left = "";
              el.style.right = this.offset + "px";
              el.style.bottom = "";
              el.style.top = 0 + "px";
              el.style.height = parseFloat(window.innerHeight) + "px";
              el.style.width =
                parseFloat(window.innerWidth) - this.offset + "px";
            } else if (this.parent.toolBarPosition === "left") {
              el.style.left = this.offset + "px";
              el.style.right = "";
              el.style.bottom = "";
              el.style.top = "0px";
              el.style.height = parseFloat(window.innerHeight) + "px";
              el.style.width =
                parseFloat(window.innerWidth) - this.offset + "px";
            } else {
              el.style.left = "0px";
              el.style.right = "";
              el.style.bottom = "";
              el.style.top = "0px";
              el.style.height =
                parseFloat(window.innerHeight) - this.offset + "px";
              el.style.width = parseFloat(window.innerWidth) + "px";
            }
          }
        }
      }
      this.header.style.width = el.style.width;
      this.header.style.left = el.style.left;
      this.header.style.top = el.style.top;

      return;
    } else if (x !== "middle" && y !== "middle") {
      if (y === "top") {
        if (this.parent.toolBarPosition === "top") {
          el.style.top = this.offset + "px";
          el.style.bottom = "";
          el.style.height = window.innerHeight * 0.5 - this.halfset + "px";
          el.style.width = window.innerWidth * 0.5 + "px";
        } else if (this.parent.toolBarPosition === "bottom") {
          el.style.top = "0px";
          el.style.bottom = "";
          el.style.height = window.innerHeight * 0.5 - this.halfset + "px";
          el.style.width = window.innerWidth * 0.5 + "px";
        } else {
          el.style.top = "0px";
          el.style.bottom = "";
          el.style.height = window.innerHeight * 0.5 + "px";
          el.style.width = window.innerWidth * 0.5 - this.halfset + "px";
        }
      } else if (y === "bottom") {
        if (this.parent.toolBarPosition === "top") {
          el.style.top = window.innerHeight * 0.5 + this.halfset + "px";
          el.style.bottom = "";
          el.style.height = window.innerHeight * 0.5 - this.halfset + "px";
          el.style.width = window.innerWidth * 0.5 + "px";
        } else if (this.parent.toolBarPosition === "bottom") {
          el.style.top = window.innerHeight * 0.5 - this.halfset + "px";
          el.style.bottom = "";
          el.style.height = window.innerHeight * 0.5 - this.halfset + "px";
          el.style.width = window.innerWidth * 0.5 + "px";
        } else {
          el.style.top = window.innerHeight * 0.5 + "px";
          el.style.bottom = "";
          el.style.height = window.innerHeight * 0.5 + "px";
          el.style.width = window.innerWidth * 0.5 - this.halfset + "px";
        }
      }
      if (x === "left") {
        if (this.parent.toolBarPosition === "left") {
          el.style.left = this.offset + "px";
          el.style.right = "";
          el.style.height = window.innerHeight * 0.5 + "px";
          el.style.width = window.innerWidth * 0.5 - this.halfset + "px";
        } else if (this.parent.toolBarPosition === "right") {
          el.style.left = "0px";
          el.style.right = "";
          el.style.height = window.innerHeight * 0.5 + "px";
          el.style.width = window.innerWidth * 0.5 - this.halfset + "px";
        } else {
          el.style.left = 0 + "px";
          el.style.right = "";
          el.style.height = window.innerHeight * 0.5 - this.halfset + "px";
          el.style.width = window.innerWidth * 0.5 + "px";
        }
      } else if (x === "right") {
        if (this.parent.toolBarPosition === "left") {
          el.style.left = window.innerWidth * 0.5 + this.halfset + "px";
          el.style.right = "";
          el.style.height = window.innerHeight * 0.5 + "px";
          el.style.width = window.innerWidth * 0.5 - this.halfset + "px";
        } else if (this.parent.toolBarPosition === "right") {
          el.style.left = window.innerWidth * 0.5 - this.halfset + "px";
          el.style.right = "";
          el.style.height = window.innerHeight * 0.5 + "px";
          el.style.width = window.innerWidth * 0.5 - this.halfset + "px";
        } else {
          el.style.left = window.innerWidth * 0.5 + "px";
          el.style.right = "";
          el.style.height = window.innerHeight * 0.5 - this.halfset + "px";
          el.style.width = window.innerWidth * 0.5 + "px";
        }
      }
    } else if (x === "middle" && y === "top") {
      if (this.parent.toolBarPosition === "top") {
        el.style.bottom = "";
        el.style.top = this.offset + "px";
        el.style.left = 0 + "px";
        el.style.right = "";
        el.style.height =
          parseFloat(window.innerHeight * 0.5) - this.halfset + "px";
        el.style.width = parseFloat(window.innerWidth) + "px";
      } else if (this.parent.toolBarPosition === "right") {
        el.style.bottom = "";
        el.style.top = "0px";
        el.style.right = "";
        el.style.left = "0px";
        el.style.height = parseFloat(window.innerHeight * 0.5) + "px";
        el.style.width = parseFloat(window.innerWidth) - this.offset + "px";
      } else if (this.parent.toolBarPosition === "left") {
        el.style.bottom = "";
        el.style.top = "0px";
        el.style.left = this.offset + "px";
        el.style.right = "";
        el.style.height = parseFloat(window.innerHeight * 0.5) + "px";
        el.style.width = parseFloat(window.innerWidth) - this.offset + "px";
      } else {
        el.style.bottom = "";
        el.style.top = 0 + "px";
        el.style.left = 0 + "px";
        el.style.right = "";
        el.style.height =
          parseFloat(window.innerHeight * 0.5) - this.halfset + "px";
        el.style.width = parseFloat(window.innerWidth) + "px";
      }
    } else if (x === "middle" && y === "bottom") {
      if (this.parent.toolBarPosition === "top") {
        el.style.bottom = "";
        el.style.top =
          parseFloat(window.innerHeight * 0.5) + this.halfset + "px";
        el.style.left = 0 + "px";
        el.style.right = "";
        el.style.height =
          parseFloat(window.innerHeight * 0.5) - this.halfset + "px";
        el.style.width = parseFloat(window.innerWidth) + "px";
      } else if (this.parent.toolBarPosition === "right") {
        el.style.bottom = "";
        el.style.top = parseFloat(window.innerHeight * 0.5) + "px";
        el.style.right = "";
        el.style.left = "0px";
        el.style.height = parseFloat(window.innerHeight * 0.5) + "px";
        el.style.width = parseFloat(window.innerWidth) - this.offset + "px";
      } else if (this.parent.toolBarPosition === "left") {
        el.style.bottom = "";
        el.style.top = parseFloat(window.innerHeight * 0.5) + "px";
        el.style.left = this.offset + "px";
        el.style.right = "";
        el.style.height = parseFloat(window.innerHeight * 0.5) + "px";
        el.style.width = parseFloat(window.innerWidth) - this.offset + "px";
      } else {
        el.style.bottom = "";
        el.style.top =
          parseFloat(window.innerHeight * 0.5) - this.halfset + "px";
        el.style.left = 0 + "px";
        el.style.right = "";
        el.style.height =
          parseFloat(window.innerHeight * 0.5) - this.halfset + "px";
        el.style.width = parseFloat(window.innerWidth) + "px";
      }
    } else if (x === "right" && y === "middle") {
      if (this.parent.toolBarPosition === "top") {
        el.style.bottom = "";
        el.style.top = this.offset + "px";
        el.style.left = "";
        el.style.right = 0 + "px";
        el.style.height = parseFloat(window.innerHeight) - this.offset + "px";
        el.style.width = parseFloat(window.innerWidth * 0.5) + "px";
      } else if (this.parent.toolBarPosition === "right") {
        el.style.bottom = "";
        el.style.top = "0px";
        el.style.right = "";
        el.style.left =
          parseFloat(window.innerWidth * 0.5) - this.halfset + "px";
        el.style.height = parseFloat(window.innerHeight) + "px";
        el.style.width =
          parseFloat(window.innerWidth * 0.5) - this.halfset + "px";
      } else if (this.parent.toolBarPosition === "left") {
        el.style.bottom = "";
        el.style.top = "0px";
        el.style.right = "";
        el.style.left =
          parseFloat(window.innerWidth * 0.5) + this.halfset + "px";
        el.style.height = parseFloat(window.innerHeight) + "px";
        el.style.width =
          parseFloat(window.innerWidth * 0.5) - this.halfset + "px";
      } else {
        el.style.bottom = "";
        el.style.top = "0px";
        el.style.left = parseFloat(window.innerWidth * 0.5) + "px";
        el.style.right = "0px";
        el.style.height = parseFloat(window.innerHeight) - this.offset + "px";
        el.style.width = parseFloat(window.innerWidth * 0.5) + "px";
      }
    } else if (x === "left" && y === "middle") {
      if (this.parent.toolBarPosition === "top") {
        el.style.bottom = "";
        el.style.top = this.offset + "px";
        el.style.left = "0px";
        el.style.right = "";
        el.style.height = parseFloat(window.innerHeight) - this.offset + "px";
        el.style.width = parseFloat(window.innerWidth * 0.5) + "px";
      } else if (this.parent.toolBarPosition === "right") {
        el.style.bottom = "";
        el.style.top = "0px";
        el.style.right = "";
        el.style.left = "0px";
        el.style.height = parseFloat(window.innerHeight) + "px";
        el.style.width =
          parseFloat(window.innerWidth * 0.5) - this.halfset + "px";
      } else if (this.parent.toolBarPosition === "left") {
        el.style.bottom = "";
        el.style.top = "0px";
        el.style.right = "";
        el.style.left = this.offset + "px";
        el.style.height = parseFloat(window.innerHeight) + "px";
        el.style.width =
          parseFloat(window.innerWidth * 0.5) - this.halfset + "px";
      } else {
        el.style.bottom = "";
        el.style.top = "0px";
        el.style.left = "0px";
        el.style.right = "";
        el.style.height = parseFloat(window.innerHeight) - this.offset + "px";
        el.style.width = parseFloat(window.innerWidth * 0.5) + "px";
      }
    } else if (this.locked) {
      if (this.parent.toolBarPosition === "top") {
        el.style.left = "0px";
        el.style.right = "";
        el.style.bottom = "";
        el.style.top = this.offset + "px";
        el.style.height = parseFloat(window.innerHeight) - this.offset + "px";
        el.style.width = parseFloat(window.innerWidth) + "px";
      } else if (this.parent.toolBarPosition === "right") {
        el.style.left = "0px";
        el.style.right = "";
        el.style.bottom = "";
        el.style.top = "0px";
        el.style.height = parseFloat(window.innerHeight) + "px";
        el.style.width = parseFloat(window.innerWidth) - this.offset + "px";
      } else if (this.parent.toolBarPosition === "left") {
        el.style.left = this.offset + "px";
        el.style.right = "";
        el.style.bottom = "";
        el.style.top = "0px";
        el.style.height = parseFloat(window.innerHeight) + "px";
        el.style.width = parseFloat(window.innerWidth) - this.offset + "px";
      } else {
        el.style.left = "0px";
        el.style.right = "";
        el.style.bottom = "";
        el.style.top = "0px";
        el.style.height = parseFloat(window.innerHeight) - this.offset + "px";
        el.style.width = parseFloat(window.innerWidth) + "px";
      }
    } else {
      el.style.height = this.height;
      el.style.width = this.width;
      if (context.footer) {
        context.footer.style.width = el.style.width;
        context.footer.style.left = el.style.left;
        context.footer.style.transition = "100ms ease-in-out";
        setTimeout(function () {
          context.footer.style.top = `${
            parseInt(context.window.getBoundingClientRect().height) +
            parseInt(context.window.getBoundingClientRect().top) -
            context.footer.getBoundingClientRect().height - 1
          }px`;
        }, 200);
      }
      return
    }
    this.header.style.width = el.style.width;
    this.header.style.left = el.style.left;
    this.header.style.top = el.style.top;
    
    if (context.footer) {
      context.footer.style.width =  parseInt(el.style.width.replace('px', '')) - 2 + "px";
      context.footer.style.left = el.style.left;
      context.footer.style.top = `${
        parseInt(el.style.height.replace('px', '')) +
        parseInt(el.style.top.replace('px', '')) -
        context.footer.getBoundingClientRect().height - 1
      }px`;
    }
  }
  showShadow(x, y) {
    this.parent.showShadow(x, y);
  }
  hideShadows() {
    this.parent.hideShadows();
  }
  checkPos(x, y) {
    let screenBottom = parseFloat(window.innerHeight);
    let screenRight = parseFloat(window.innerWidth);
    if (
      this.parent.toolBarPosition === "top" ||
      this.parent.toolBarPosition === "bottom"
    ) {
      if (this.parent.isMobile) {
        return window.innerHeight > window.innerWidth
          ? [
              // portrait
              x >= screenRight * 0.667
                ? "right"
                : x <= screenRight * 0.333
                ? "left"
                : "middle",
              y >= screenBottom * 0.667 - this.offset
                ? "bottom"
                : y <= screenBottom * 0.333 + this.offset
                ? "top"
                : "middle",
            ]
          : [
              //landscape
              x >= screenRight * 0.667
                ? "right"
                : x <= screenRight * 0.333
                ? "left"
                : "middle",
              y >= screenBottom * 0.667
                ? "bottom"
                : y <= screenBottom * 0.333
                ? "top"
                : "middle",
            ];
      } else {
        return [
          x >= screenRight * 0.667
            ? "right"
            : x <= screenRight * 0.333
            ? "left"
            : "middle",
          y >= screenBottom * 0.667
            ? "bottom"
            : y <= screenBottom * 0.333
            ? "top"
            : "middle",
        ];
      }
    } else {
      if (this.parent.isMobile) {
        return window.innerHeight > window.innerWidth
          ? [
              // portrait
              x >= screenRight * 0.667
                ? "right"
                : x <= screenRight * 0.333
                ? "left"
                : "middle",
              y >= screenBottom * 0.667
                ? "bottom"
                : y <= screenBottom * 0.333
                ? "top"
                : "middle",
            ]
          : [
              //landscape
              x >= screenRight * 0.667 - this.offset
                ? "right"
                : x <= screenRight * 0.333 + this.offset
                ? "left"
                : "middle",
              y >= screenBottom * 0.667
                ? "bottom"
                : y <= screenBottom * 0.333
                ? "top"
                : "middle",
            ];
      } else {
        return [
          x >= screenRight * 0.667
            ? "right"
            : x <= screenRight * 0.333
            ? "left"
            : "middle",
          y >= screenBottom * 0.667
            ? "bottom"
            : y <= screenBottom * 0.333
            ? "top"
            : "middle",
        ];
      }
    }
  }
  checkSize() {
    this.isMobile =
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(
        / ${this.parent.darkMode ? "grey" : "white"}Berry/i
      ) ||
      navigator.userAgent.match(/Windows Phone/i);
  }
  scrollbarVisible(element) {
    return element.scrollHeight > element.clientHeight;
  }
  showScrollButton() {
    if (this.scrollbarVisible(this.draggableContent)) {
      if (this.draggableContent.scrollTop > this.scrollPosY) {
        this.scrollButton.classList.add("pfi-arrow-down");
        this.scrollButton.classList.remove("pfi-arrow-up");
        this.scrollButton.style.display = "block";
      } else if (this.draggableContent.scrollTop < this.scrollPosY) {
        this.scrollButton.classList.add("pfi-arrow-up");
        this.scrollButton.classList.remove("pfi-arrow-down");
        this.scrollButton.style.display = "block";
      }
    } else {
      this.scrollButton.style.display = "none";
    }
    window.clearTimeout(this.timemoutHide);
    this.scrollPosY = this.draggableContent.scrollTop;
    this.timemoutHide = setTimeout(
      function () {
        this.scrollButton.style.display = "none";
      }.bind(this),
      3000
    );
    this.timemoutHide;
  }
}
