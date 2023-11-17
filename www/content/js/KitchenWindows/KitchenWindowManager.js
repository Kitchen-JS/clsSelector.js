class AppsManager {
  constructor(options) {
    this.options = options;
    this.parent = options.parent;
    this.container = document.createElement("div");
    this.developerMode =
      typeof options.developerMode !== "undefined"
        ? options.developerMode
        : window.location.href.split("/").includes("localhost:44333");
    this.container.classList.add(
      "inline-flex",
      "items-center",
      "items-space-between",
      "content-center",
      "flex-wrap"
    );
    this.bodyContent = this.parent.toolBar.window;
    this.baseTemplate = `
                <div style='width:175px; height:175px;'class="tile card m-3" style="cursor: pointer;">
                    <div class="menu-item-container card-body content-center block text-center">
                         <div class="flex content-start" style="width:100%">                         ${
                            this.parent.authRequired
                              ? '<i class="fs-4 pfi-star-empty favorite-icon float-right" title="Click to add or remove as a favorite"></i>'
                              : ""
                          }</div>
                         <i class="is-3 card-icon align-middle mb-2"></i>
                         <p class="card-title align-middle" style="font-size: 1em"></p>
                    </div>
                </div>
            `;
    this.accordionTemplate = `
        <div class="accordion accordion-flush" id="collectionAccordion">
          <div class="accordion-item">
            <h4 class="accordion-header" id="collectionAccordionHeading">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collectionAccordionCollapse" aria-expanded="" aria-controls="collectionAccordionCollapse">
              </button>
              <i class="fs-4 pfi-star-empty favorite-icon float-right" title="Click to add or remove as a favorite"></i>
            </h2>
            <div id="collectionAccordionCollapse" class="accordion-collapse collapse" aria-labelledby="collectionAccordionHeading" data-bs-parent="#collectionAccordion">
              <div id="collectionAccordionBody" class=" accordion-body">
              </div>
            </div>
          </div>
        </div>
        `;
    this.listTemplate = `
                         <i class="list-item-icon me-1"></i>
                         <span class="list-item-title align-middle ms-1"></span>
                         ${
                           this.parent.authRequired
                             ? '<i class="fs-4 pfi-star-empty favorite-icon float-right" title="Click to add or remove as a favorite"></i>'
                             : ""
                         }
                        `;
    this.content = this.bodyContent;
    if (!this.content) {
      this.content = document.createElement("div");
      this.bodyContent.appendChild(this.content);
    }
    this.collectionTitle = document.createElement("h2");
    this.collectionTitle.classList.add("d-block", "w-full", "mt-4");
    this.cards = document.createElement("div");
    this.cards.classList.add(
      "inline-flex",
      "content-center",
      "justify-center",
      "flex-wrap"
    );
    this.content.appendChild(this.cards);
    // TODO: we can define a base set of workspace items that will be available on the landing page
    this.Apps = [];
    this.RunningApps = [];
    this.Classes = [];
    this.tiles = [];
    // inject dependencies - we need this to load in the layout, not here, so it will always be ready;
  }
  auth(rolesRequired, AppTitle = "this app") {
    if (this.parent.authRequired) {
      let userRoles = [];
      if (
        JSON.parse(sessionStorage.getItem("session")) &&
        JSON.parse(sessionStorage.getItem("session")).expires_at <=
          getTimestampInSeconds()
      ) {
        GlobalWindowManager.warn(
          "Your Session has expired, please log in again.",
          function () {
            logOut();
            window.location.reload();
            return;
          }
        );
      }
      let myRoles = sessionStorage.getItem("userRoles")
      if (myRoles.length) {
        myRoles.split("|")
        .forEach((role) => {
          userRoles.push(role);
        });
      }
      rolesRequired =
        typeof rolesRequired === "object"
          ? rolesRequired
          : rolesRequired.split("|");
      return authorize(userRoles, rolesRequired);
    } else {
      return true;
    }
  }
  async search(keyword) {
    // when user types, searches database, returns set of apps, and collections
    // then set in state
    let context = this;
    await SearchApps(keyword)
      .then(async (response) => {
        context.Apps = response;
        context.setMenuItems();
      })
      .catch((error) => console.error(error));
    await SearchCollections(keyword)
      .then(async (response) => {
        context.AppCollections = response;
        context.setCollections(context.AppCollections, false);
      })
      .catch((error) => console.error(error));
  }
  addClass(ClassObj) {
    if (typeof GlobalWindowManager.AppsManager.Classes === "object") {
      //Check if the App class exists in our state:
      let ClassInstance = GlobalWindowManager.AppsManager.Classes.filter(
        (classObj) =>
          classObj.constructor.name === Object.values(ClassObj)[0].name
      );
      if (!ClassInstance.length) {
        GlobalWindowManager.AppsManager.Classes.push(ClassObj);
      } else {
        if (this.developerMode)
          console.warn(
            "GlobalWindowManager.AppsManager - the class " +
              ClassName +
              " was not loaded because it already exists in context."
          );
      }
    } else {
      console.error(
        "GlobalWindowManager.AppsManager was not able to load the class " +
          ClassName +
          "."
      );
    }
  }
  async inject(dependencyString) {
    let context = this;
    if (typeof dependencyString !== "string" && typeof dependencyString !== 'object') return;
    let load = true;
    let head = document.querySelector("head");
    let currentScripts = Array.from(head.children);
    await Promise.all(
      currentScripts.map(async (currentScript) => {
        if (typeof currentScript.src === "string") {
          if (typeof dependencyString === 'string'){
            if (currentScript.src.includes(dependencyString)) {
                console.warn(
                  'dependency: "' +
                    dependencyString +
                    '" not injected. This reference is already in scope.'
                );
              load = false; 
            }
          } else if (typeof dependencyString === 'object') {
            if (currentScript.src.includes(dependencyString.src)) {
                console.warn(
                  'dependency: "' +
                    dependencyString.src +
                    '" not injected. This reference is already in scope.'
                );
              load = false; 
            }
          }
        }
      })
    ).then(async (res) => {
      if (load) {
        let script;
        if (typeof dependencyString === "string") {
          script = new ScriptLoader({
            src: dependencyString,
            global: true,
          });
        } else if (typeof dependencyString === "object"){
          script = new ScriptLoader({
            src: dependencyString.src,
            type: dependencyString.type,
            global: true,
          });
        }
        await script
          .load()
          .then((res) => {
            console.log('dependency: "' + dependencyString + '" injected.');
          })
          .catch((error) => console.error(error));
      }
    });
  }
  async onclick(item, metadata = {}, popup = false) {
    // console.log(item)
    GlobalWindowManager.loadingSpinner.show();
    if (typeof item.ClassName === "undefined" || !item.ClassName) return;
    let context = this;
    let existing = GlobalWindowManager.windows.filter((x) => {
      return x.title === item.AppTitle;
    });
    // first record app usage
    let usage = await this.recordUsage(item);
    // Add the class into the Global Window Manager's state.
    let appClass = GlobalWindowManager.AppsManager.Classes.find(
      (classObj) => Object.keys(classObj)[0] === item.ClassName
    );
    try {
      appClass = appClass[Object.keys(appClass)[0]];
    } catch {
      console.error('The app class name "' + item.ClassName + '" was not found. Check your file path and class name to ensure they are defined correctly.')
    }
    // create a new instance of the app
    let app = new appClass();
    if (!this.auth(app.initOptions.roles)) {
      GlobalWindowManager.warn(
        "You are not authorized to use this App. If you need access, please request access from an admin."
      );
      return;
    } else if (
      existing.length >= GlobalWindowManager.limit ||
      existing.length >= app.initOptions.limit
    ) {
      GlobalWindowManager.warn(
        `You can only open ${
          app.initOptions.limit || GlobalWindowManager.limit
        } '${item.AppTitle}' apps.`,
        function () {
          GlobalWindowManager.restoreWindow(existing[0].id);
          GlobalWindowManager.focus(existing[0]);
        }
      );
      return;
    }
    // add to the Global Window Manager's state
    app.AppID = item.AppID;
    GlobalWindowManager.AppsManager.RunningApps.push(app);
    // add all dependencies from DB to class state
    if (typeof item.inject === "string" && item.inject)
      item.inject.split("|").forEach((dependency) =>
        app.initOptions.inject.push(dependency)
      );
    //inject all dependencies first before init.
    await Promise.all(
      app.initOptions.inject.map(async (file) => {
        await context.inject(file);
      })
    );
    // update the class instance's options to match what the DB brought back dynamically:
    app.initOptions.footer = item.AppFooter || app.initOptions.footer;
    app.initOptions.header = item.AppHeader || app.initOptions.header;
    app.initOptions.AppID = item.AppID;
    app.initOptions.orientation = item.position || item.orientation;
    app.initOptions.position = item.position || app.initOptions.position;
    app.initOptions.menuAltTitle = item.menuAltTitle;
    app.initOptions.title = item.AppTitle || app.initOptions.AppTitle;
    app.initOptions.Icon = item.Icon || app.initOptions.Icon;
    app.initOptions.IconColor = item.IconColor || app.initOptions.IconColor;
    app.initOptions.roles =
      typeof item.Roles === "object" && item.Roles ? item.Roles.split("|") : [];
    app.metadata = metadata;
    app.initOptions.loadingSpinner = app.loadingSpinner;
    // Init function for the class (if present)
    if (typeof app.initialize === "function") {
      app.initialize();
    } else {
      if (this.developerMode)
        console.warn(
          "Your class file for " +
            item.ClassName +
            " does not have an initialize function."
        );
    }
    //finally add window
    if (popup) {
      GlobalWindowManager.createPopup(app.id, app.AppTitle, app.container);
    } else {
      GlobalWindowManager.addWindow(app.initOptions);
      GlobalWindowManager.closeToolbarWindows();
      GlobalWindowManager.loadingSpinner.hide();
    }
    GlobalWindowManager.loadingSpinner.hide();
    return app;
  }
  async start(AppObj, metadata = {}) {
    let context = this;
    let app;
    if (typeof GetApps === "function") {
      await GetApps(AppObj)
      .then(async (response) => {
        let result = response; 
        if (result.length) {
          result = result[0];
          // inject relevant class
          await context.inject(result.ClassFile).then(async function () {
            if (AppObj.orientation) result.position = AppObj.orientation;
            app = await context.onclick(result, metadata);
          });
        } else {
          console.error(
            "Failed to start",
            AppObj,
            " No results returned from db."
          );
        }
      })
      .catch((error) => console.error(error));
    } else {
      await context.inject(AppObj.ClassFile).then(async function () {
        app = await context.onclick(AppObj, metadata);
      });
    }
    return app;
  }
  async startCollection(AppCollectionObj) {
    let context = this;
    this.Collection = AppCollectionObj;
    await GetAppCollections(AppCollectionObj)
      .then(async (response) => {
        context.collections = response;
        if (
          !context.auth(
            context.collections[0].Roles,
            context.collections[0].Title
          )
        ) {
          GlobalWindowManager.warn(
            "You are not authorized to use this collection of Apps."
          );
          context.collections = [];
          return;
        } else {
          context.setAppCollectionsApps(context.collections[0].Title);
          await this.getCollectionsApps(context.collections[0]).then(
            async (response) => {
              context.AppCollectionApps.forEach(async (app) => {
                // inject relevant class
                await context.inject(app.ClassFile).then(async function () {
                  context.onclick(app);
                });
              });
            }
          );
        }
      })
      .catch((error) => console.error(error));
  }
  async favorite(AppID, e) {
    let context = this;
    let PersonID = JSON.parse(sessionStorage.getItem("user")).id; // TODO: change based on source of authentication (token)
    //check if favorite exists
    await GetFavorites({ fk_PersonID: PersonID, fk_AppID: AppID })
      .then(async (result) => {
        let AppFavoritesObj = result[0];
        let id = AppFavoritesObj
          ? AppFavoritesObj.id || AppFavoritesObj.AppFavoriteID
          : ""; // supabase specific
        let Active = AppFavoritesObj ? !AppFavoritesObj.Active : true;
        // set collection fav state if present:
        this.favoriteStyle(e.target.style.color === "gray", e.target);
        if (!AppFavoritesObj || !AppFavoritesObj.id) {
          AppFavoritesObj = {}; //TODO add app favorite source
          AppFavoritesObj.fk_AppID = AppID;
        } else {
          AppFavoritesObj = AppFavoritesObj;
          AppFavoritesObj.id = id;
          AppFavoritesObj.Active = Active;
        }
        await Favorite(AppFavoritesObj)
          .then(async (response) => {
            await context.getFavoritedApps();
            context.setMenuItems();
          })
          .catch((error) => console.error(error));
      })
      .catch((err) => console.error(err));
  }
  async getFavoritedApps(AppFavoritesObj) {
    let context = this;
    if (!this.parent.authRequired) {
      context.setFavorites([]);
      return;
    }
    GetFavoritedApps()
      .then(async (response) => {
        let result = response.map((app) => app.Apps); // this is specific to Supabase's API and how it returns data.
        context.setFavorites(result);
        return result;
      })
      .catch((error) => console.error(error));
  }
  setFavorites(favorites) {
    this.favorites = favorites;
    if (!this.parent.authRequired) this.favorites = [];
    if (!this.parent.EnableFavorites) return;
    let context = this;
    let menu = document.querySelector(".Apps-Favorites-List");
    menu.innerHTML = ` <li class="list-group-item rounded-0 text-center " style="background-color: #BFB8AB;">
                                <div class="text-center items-center text-bold">Favorited Apps</div>
                            </li>`;
    if (!favorites.length) {
      let cardContainer = document.createElement("li");
      cardContainer.classList.add(
        "App-List-Item",
        "list-group-item",
        "rounded-0",
        "w-full",
        "border-0"
      );
      cardContainer.innerHTML = ` <div class="text-center">${
        this.parent.authRequired
          ? "No favorites yet . . ."
          : "You must log in to view/add favorites."
      }</div>`;
      menu.appendChild(cardContainer);
      return;
    } else {
      this.favorites.forEach((item) => {
        let cardContainer = document.createElement("li");
        cardContainer.classList.add(
          "App-List-Item",
          "list-group-item",
          "rounded-0",
          "w-full"
        );
        cardContainer.style.cursor = "pointer";
        cardContainer.innerHTML = context.listTemplate;
        let unAuthorized = document.createElement("i");
        unAuthorized.classList.add("ms-3", "pfi-lock-closed", "is-1");
        if (!context.auth(item.Roles)) {
          cardContainer.appendChild(unAuthorized);
          unAuthorized.style.color = "red";
        }
        if (typeof item.URL === "string") {
          cardContainer.onclick = (e) => {
            if (
              !e.target.classList.contains("pfi-star-empty") &&
              !e.target.classList.contains("pfi-star-filled")
            ) {
              if (!item.OpenNewTab) {
                window.location.href = item.URL;
              } else {
                window.open(item.URL);
              }
            }
          };
        } else {
          cardContainer.onclick = async function (e) {
            // inject relevant class
            if (
              !e.target.classList.contains("pfi-star-empty") &&
              !e.target.classList.contains("pfi-star-filled")
            ) {
              await context.inject(item.ClassFile).then(async function () {
                context.onclick(item);
              });
            }
          };
        }

        cardContainer.setAttribute(
          "title",
          item.Description || item.menuAltTitle
        );
        let cardTitle = cardContainer.querySelector(".list-item-title");
        cardContainer.setAttribute(
          "aria-label",
          (item.menuAltTitle || item.AppTitle) + " App Button"
        );
        cardTitle.innerHTML = item.AppTitle;
        let cardIcon = cardContainer.querySelector(".list-item-icon");
        cardIcon.classList.add(item.Icon, "is-1");
        cardIcon.style.color = item.iconColor;
        if (this.parent.authRequired) {
          let cardFavoriteIcon = cardContainer.querySelector(".pfi-star-empty");
          cardFavoriteIcon.style.color = "gold";
          cardFavoriteIcon.classList.add("pfi-star-filled");
          cardFavoriteIcon.classList.remove("pfi-star-empty");
          cardFavoriteIcon.onclick = async function (e) {
            // inject relevant class
            await context.favorite(item.AppID, e);
            if (context.collectionTitleText) {
              context.setAppCollectionsApps(context.collectionTitleText);
            }
          };
          cardFavoriteIcon.onmouseenter = this.favoriteIconHover;
          cardFavoriteIcon.onmouseleave = this.favoriteIconHover;
        }
        //append card to container
        if (context.auth(item.Roles)) menu.appendChild(cardContainer);
      });
    }
  }
  async setMenuItems(isUsage = false) {
    await this.getFavoritedApps();
    let context = this;
    let menu = document.querySelector(".Apps-List");
    menu.querySelectorAll(".App-List-Item").forEach((app) => {
      app.remove();
    });
    if (isUsage) {
      let cardContainer = document.createElement("li");
      cardContainer.classList.add(
        "App-List-Item",
        "list-group-item",
        "rounded-0",
        "w-full",
        "border-0",
        "border-bottom"
      );
      cardContainer.innerHTML = `
                                <div class="text-center text-small text-muted items-center">Frequently Used:</div>`;
      menu.appendChild(cardContainer);
    }
    if (context.Apps.length) {
      context.Apps.forEach((item) => {
        let cardContainer = document.createElement("li");
        cardContainer.classList.add(
          "App-List-Item",
          "list-group-item",
          "rounded-0",
          "w-full"
        );
        cardContainer.style.cursor = "pointer";
        cardContainer.innerHTML = context.listTemplate;
        let unAuthorized = document.createElement("i");
        unAuthorized.classList.add("ms-3", "pfi-lock-closed", "is-1");
        // console.log(context.auth(item.Roles))
        if (!context.auth(item.Roles)) {
          cardContainer.appendChild(unAuthorized);
          unAuthorized.style.color = "red";
        }
        if (typeof item.URL === "string") {
          cardContainer.onclick = (e) => {
            if (
              !e.target.classList.contains("pfi-star-empty") &&
              !e.target.classList.contains("pfi-star-filled")
            ) {
              if (!item.OpenNewTab) {
                window.location.href = item.URL;
              } else {
                window.open(item.URL);
              }
            }
          };
        } else {
          cardContainer.onclick = async function (e) {
            // inject relevant class
            if (
              !e.target.classList.contains("pfi-star-filled") &
              !e.target.classList.contains("pfi-star-empty")
            ) {
              await context.inject(item.ClassFile).then(async function () {
                context.onclick(item);
              });
            }
          };
        }
        cardContainer.setAttribute(
          "title",
          item.Description || item.menuAltTitle
        );
        cardContainer.setAttribute(
          "aria-label",
          (item.menuAltTitle || item.AppTitle) + "App Button"
        );
        let cardTitle = cardContainer.querySelector(".list-item-title");
        cardTitle.innerHTML = item.AppTitle;
        let cardIcon = cardContainer.querySelector(".list-item-icon");
        cardIcon.classList.add(item.Icon, "is-1");
        cardIcon.style.color = item.iconColor;
        let favorited = context.favorites.length
          ? context.favorites.filter((fav) => fav.AppID === item.AppID)
          : [false];
        favorited = favorited[0];
        if (this.parent.authRequired) {
          let cardFavoriteIcon = cardContainer.querySelector(".pfi-star-empty");
          //console.log(favorited)
          cardFavoriteIcon.onclick = async function (e) {
            // inject relevant class
            await context.favorite(item.AppID, e);
            if (context.collectionTitleText) {
              context.setAppCollectionsApps(context.collectionTitleText);
            }
          };
          this.favoriteStyle(favorited, cardFavoriteIcon);
          cardFavoriteIcon.onmouseenter = this.favoriteIconHover;
          cardFavoriteIcon.onmouseleave = this.favoriteIconHover;
        }
        //append card to container
        if (context.auth(item.Roles)) menu.appendChild(cardContainer);
      });
    } else {
      let cardContainer = document.createElement("li");
      cardContainer.classList.add(
        "App-List-Item",
        "list-group-item",
        "rounded-0",
        "w-full",
        "border-0"
      );
      cardContainer.innerHTML = `
                                <div class="text-center text-small text-muted items-center">No results ...</div>`;
      menu.appendChild(cardContainer);
    }
  }
  async searchCollections(keyword) {
    let context = this;
    if (!this.parent.EnableCollections) return;
    GetAppCollections()
      .then(async (response) => {
        context.collections = response.body;
        context.setCollections(context.collections);
        //    console.log("Collections Found:", context.collections)
      })
      .catch((error) => console.error(error));
  }
  async getCollectionsApps(collection) {
    let id = collection.AppCollectionID;
    let context = this;
    // get apps based on collection
    let AppCollectionsObj = {}; // TODO: add app collection data source
    AppCollectionsObj.Active = true;
    AppCollectionsObj.AppCollectionID = id;
    await GetCollectionsApps(AppCollectionsObj)
      .then(async (response) => {
        context.AppCollectionApps = response;
        context.collectionTitleText = collection.Title;
        context.setAppCollectionsApps(collection.Title);
      })
      .catch((error) => console.error(error));
  }
  setCollections(collection, isUsage = false) {
    let context = this;
    if (!this.parent.EnableCollections) return;
    let collections = collection || context.collections;
    let menu = document.querySelector(".Apps-Collections-List");
    menu.innerHTML = `<ul class="list-group Apps-Collections-List">
                            <li class="list-group-item rounded-0 text-center " style="background-color: #BFB8AB;">
                                <div class="text-center items-center text-bold">Workspaces</div>
                            </li>
                        </ul>`;
    if (isUsage) {
      let cardContainer = document.createElement("li");
      cardContainer.classList.add(
        "App-List-Item",
        "list-group-item",
        "rounded-0",
        "w-full",
        "border-0",
        "border-bottom"
      );
      cardContainer.innerHTML = `<div class="text-center text-small text-muted items-center">Frequently Used:</div>`;
      menu.appendChild(cardContainer);
    }
    if (collections && collections.length) {
      collections.forEach((item) => {
        let accordionContainer = document.createElement("li");
        accordionContainer.classList.add(
          "App-List-Item",
          "w-full",
          item.AppCollectionID
        );
        accordionContainer.style.listStyle = "none";
        accordionContainer.style.cursor = "pointer";
        accordionContainer.innerHTML = `
                <div class="accordion accordion-flush" id="collectionAccordion-${item.AppCollectionID}">
                  <div class="accordion-item">
                    <h4 class="accordion-header" id="collectionAccordionHeading-${item.AppCollectionID}">
                      <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collectionAccordionCollapse-${item.AppCollectionID}" aria-expanded="" aria-controls="collectionAccordionCollapse-${item.AppCollectionID}">
                      </button>
                    </h2>
                    <div id="collectionAccordionCollapse-${item.AppCollectionID}" class="accordion-collapse collapse" aria-labelledby="collectionAccordionHeading-${item.AppCollectionID}" data-bs-parent="#collectionAccordion-${item.AppCollectionID}">
                      <div id="collectionAccordionBody-${item.AppCollectionID}" class=" accordion-body">
                      </div>
                    </div>
                  </div>
                </div>
                `;
        if (context.auth(item.Roles)) {
          menu.appendChild(accordionContainer);
          let accordion = document.querySelector(
            `#collectionAccordion-${item.AppCollectionID}`
          );
          let heading = accordion.querySelector(
            `#collectionAccordionHeading-${item.AppCollectionID}`
          );
          heading = heading.querySelector(".accordion-button");
          let headingText = document.createElement("span");
          headingText.classList.add("mx-2");
          headingText.innerHTML = item.Title || "No Collection Title";
          heading.style.backgroundColor = "#dee2e6";
          heading.style.color = "black";
          heading.style.width = "100%";
          heading.appendChild(headingText);
          let unAuthorized = document.createElement("i");
          unAuthorized.classList.add("mx-3", "pfi-lock-closed", "is-1");
          if (!context.auth(item.Roles)) {
            heading.appendChild(unAuthorized);
            heading.setAttribute("data-bs-toggle", "");
            unAuthorized.style.color = "red";
          }
          loadBootStrap();
          let body = accordion.querySelector(
            `#collectionAccordionBody-${item.AppCollectionID}`
          );
          let sideMenu = document.querySelector(".sidebar-menu-list");
          heading.onclick = async function (e) {
            context.Collection = item;
            if (!context.auth(item.Roles, item.Title)) {
              GlobalWindowManager.warn(
                "You are not authorized to use the apps in this collection. If you need access, please request access from PEC ITD."
              );
              return;
            }
            let usage = await context.recordUsage(false, item);
            //console.log('usage', usage);
            await context.getCollectionsApps(item);

            body.innerHTML = "";
            // sideMenu.querySelectorAll('li').forEach(item => item.remove());
            context.AppCollectionApps.forEach((app) => {
              let accordionListContainer = document.createElement("li");
              accordionListContainer.classList.add(
                "list-group-item",
                "rounded-0",
                "w-full"
              );
              accordionListContainer.style.cursor = "pointer";
              accordionListContainer.innerHTML = context.listTemplate;
              if (typeof app.URL === "string") {
                accordionListContainer.onclick = () => {
                  if (!app.OpenNewTab) {
                    window.location.href = app.URL;
                  } else {
                    window.open(app.URL);
                  }
                };
              } else {
                accordionListContainer.onclick = async function () {
                  // inject relevant class
                  await context.inject(app.ClassFile).then(async function () {
                    context.onclick(app);
                  });
                };
              }

              let unAuthorized = document.createElement("i");
              unAuthorized.classList.add("mx-3", "pfi-lock-closed", "is-1");
              if (!context.auth(app.Roles)) {
                accordionListContainer.appendChild(unAuthorized);
                unAuthorized.style.color = "red";
              }
              accordionListContainer.setAttribute("title", app.Description);
              let cardTitle =
                accordionListContainer.querySelector(".list-item-title");
              cardTitle.innerHTML = app.AppTitle;
              cardTitle.setAttribute(
                "aria-label",
                (app.menuAltTitle || app.AppTitle) + " App Button"
              );
              let cardIcon =
                accordionListContainer.querySelector(".list-item-icon");
              cardIcon.classList.add(app.Icon, "is-1");
              cardIcon.style.color = app.iconColor;
              if (context.parent.authRequired) {
                let cardFavoriteIcon =
                  accordionListContainer.querySelector(".pfi-star-empty");
                cardFavoriteIcon.classList.add("d-none");
              }
              //append card to container
              if (context.auth(app.Roles))
                body.appendChild(accordionListContainer);
              //append item to side menu
              let sideMenuItem = accordionListContainer.cloneNode(true);
              sideMenuItem.style.backgroundColor = "black";
              sideMenuItem.querySelector(".list-item-title").style.color =
                "#BFB8AB";
              if (
                app.IconColor &&
                (app.IconColor === "#000000" ||
                  app.IconColor.toLowerCase() === "black")
              )
                app.IconColor = "white";
              sideMenuItem.querySelector("i").style.color =
                app.IconColor || random_rgba();
              sideMenuItem.querySelector("i").classList.add("is-2");
              sideMenuItem.setAttribute(
                "aria-label",
                "Side Menu Item " + (app.menuAltTitle || app.AppTitle)
              );
              sideMenuItem.onclick = async function () {
                // inject relevant class
                await context.inject(app.ClassFile).then(async function () {
                  context.onclick(app);
                });
              };
              if (context.auth(app.Roles) && sideMenu)
                sideMenu.appendChild(sideMenuItem);
            });
          };
          heading.setAttribute("title", item.Description);

          let cardIcon = document.createElement("i");
          cardIcon.style.color = "black";
          cardIcon.classList.add(item.Icon, "is-1");
          heading.prepend(cardIcon);
          //append card to container
        }
      });
    } else {
      let cardContainer = document.createElement("li");
      cardContainer.classList.add(
        "App-List-Item",
        "list-group-item",
        "rounded-0",
        "w-full",
        "border-0"
      );
      cardContainer.innerHTML = `
                                <div class="text-center text-small text-muted items-center">No results ...</div>
                            `;
      menu.appendChild(cardContainer);
    }
  }
  setAppCollectionsApps(titleText) {
    let context = this;
    let container = this.cards;
    this.getFavoritedApps();
    container.innerHTML = "";
    this.collectionTitle.innerHTML = titleText;
    container.appendChild(this.collectionTitle);
    if (!this.AppCollectionApps || !this.AppCollectionApps.length) {
      if (this.developerMode)
        console.warn("This App Collection has no Apps yet.");
      container.innerHTML = `<h4 class="mb-4 mt-2">This App Collection has no apps yet.</h4>`;
      return;
    }
    context.AppCollectionApps.forEach((item) => {
      let cardContainer = document.createElement("div");
      cardContainer.innerHTML = context.baseTemplate;
      cardContainer = cardContainer.querySelector(".tile");
      cardContainer.style.backgroundColor = item.IconBkgColor || "transparent";
      if (!item.IconBkgColor || item.IconBkgColor === "none")
        cardContainer.style.border = "none";
      cardContainer.style.cursor = "pointer";
      cardContainer.style.zIndex = 1;
      if (typeof item.URL === "string") {
        cardContainer.onclick = (e) => {
          if (
            !e.target.classList.contains("pfi-star-empty") &&
            !e.target.classList.contains("pfi-star-filled")
          ) {
            if (!item.OpenNewTab) {
              window.location.href = item.URL;
            } else {
              window.open(item.URL);
            }
          }
        };
      } else {
        cardContainer.onclick = async function (e) {
          // inject relevant class
          if (
            !e.target.classList.contains("pfi-star-filled") &&
            !e.target.classList.contains("pfi-star-empty")
          ) {
            await context.inject(item.ClassFile).then(async function () {
              context.onclick(item);
            });
          }
        };
      }
      cardContainer.setAttribute(
        "title",
        (item.Description || item.AppTitle) + " App"
      );
      cardContainer.setAttribute(
        "aria-label",
        (item.menuAltTitle || item.AppTitle) + " App Button"
      );
      let cardTitle = cardContainer.querySelector(".card-title");
      cardTitle.innerHTML = item.AppTitle;
      let cardIcon = cardContainer.querySelector(".card-icon");
      cardIcon.classList.add(item.Icon, "is-1");
      cardIcon.style.color = item.IconColor || random_rgba();

      let favorited = context.favorites
        ? context.favorites.filter((fav) => fav.AppID === item.AppID)
        : [false];
      favorited = favorited[0];
      if (this.parent.authRequired) {
        let cardFavoriteIcon = cardContainer.querySelector(".pfi-star-empty");
        cardFavoriteIcon.classList.add("desktop-favorite-icon");
        cardFavoriteIcon.onclick = async function (e) {
          await context.favorite(item.AppID, e);
        };
        this.favoriteStyle(favorited, cardFavoriteIcon);
        cardFavoriteIcon.onmouseenter = this.favoriteIconHover;
        cardFavoriteIcon.onmouseleave = this.favoriteIconHover;
      }
      //append card to container
      if (context.auth(item.Roles)) container.appendChild(cardContainer);
    });
  }
  favoriteStyle(favorited, cardFavoriteIcon) {
    if (favorited) {
      cardFavoriteIcon.style.color = "gold";
      cardFavoriteIcon.classList.remove("pfi-star-empty");
      cardFavoriteIcon.classList.add("pfi-star-filled");
    } else {
      cardFavoriteIcon.style.color = "gray";
      cardFavoriteIcon.classList.add("pfi-star-empty");
      cardFavoriteIcon.classList.remove("pfi-star-filled");
    }
  }
  favoriteIconHover(e) {
    if (e.target.classList.contains("pfi-star-filled")) {
      e.target.style.color = "gray";
      e.target.classList.remove("pfi-star-filled");
      e.target.classList.add("pfi-star-empty");
    } else {
      e.target.style.color = "gold";
      e.target.classList.add("pfi-star-filled");
      e.target.classList.remove("pfi-star-empty");
    }
  }
  async recordUsage(AppObj = false, AppCollectionObj = false) {
    let AppUsageObj = {}; // TODO: add app usage source
    if (AppObj) {
      AppUsageObj.fk_AppID = AppObj.AppID;
    }
    if (AppCollectionObj) {
      AppUsageObj.fk_AppCollectionID = AppCollectionObj.AppCollectionID;
    }
    return RecordUsage(AppUsageObj)
      .then(async (response) => {
        return response;
      })
      .catch((error) => console.error(error));
  }
  async getUsage() {
    let context = this;
    if (!this.parent.authRequired) return;
    GetUsage().then((values) => {
      context.Apps = values;
      context.setMenuItems(true);
      // context.setCollections(values[0], true); needs to be wired in.
    });
  }
}
