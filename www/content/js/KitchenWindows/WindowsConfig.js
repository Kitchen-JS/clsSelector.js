// ***************************************** API LAYER ************************************************ //
const GetFavorites = async (options) => 
{
    return [];
};
const GetApps = async (options) => 
{
    return [];
};
const GetAppFavorites = async (options) => 
{
    return [];
};
const GetFavoritedApps = async (options) =>
{
    return [];
};
const Favorite = async (options) => {
  // must reach out to your AppFavorites table and UPSERT a row
};
const GetAppCollections = async (options) => 
{
    return [];
};
const GetCollectionsApps = async (options) => 
{
    return [];
};
const SearchApps = async (keyword) => 
{
    // searches Apps Table by keyword
    return [];
};
const SearchCollections = async (keyword) => 
{
    //searches AppCollections Table by keyword
    return [];
};
const GetUsage = async (options) => 
{
    // returns an array of Apps, ranked by most rows in AppUsage Table, by person/user
    return [];
};
const RecordUsage = async (options) => 
{
    // Creates new row in usage table
    return [];
};
const logIn = async (options, context) => 
{
    // returns auth token, sets the token into the session.
    return;
};
const signUp = async (options, context) => 
{
    return;
};
const logOut = async () => 
{
    // must clear session from browser and logout from server
    return;
};
// not wired in - this is specific to the backend you are using
const thirdPartyAuthenticate = async (provider) => 
{
};
// must return boolean.
const authorize = (userRoles, appRoles) => 
{
    // change this to return "auth", manually overidden for dev mode
    return true;
};
// Get and set user settings
const GetSettings = async () => 
{
    return [];
};
const SaveSettings = async (options) => 
{
  // UPSERT settings object by person/user
};
// this method is for refresh or loading of bootstrap JS each time a new window is opened.
// **Required if you are using bootstrap.
if (typeof (loadBootStrap) === 'undefined' || !loadBootStrap)
{
    const loadBootStrap = () => 
    {
        console.log("loadboostrap method not detected");
    };
}

// ******************************************* Windows Instance ******************************************//
//Windows Options, adjust to the needs of your app
// everything that is commented out is optional.
const WindowsOptions = {
    title: "Kitchen Windows", // *REQUIRED* rename to your app's title
    container: document.querySelector(".windowContainer"), // HTML container element from the body of your index
    // darkMode: false, // dark mode on by default
    // authRequired: false, // turn on to require users to login
    themeColors: [
    {
        name: "standard",
        color: "#000",
        backgroundColor: "#ebebeb",
        headerColor: "#b0b0b0",
        focusColor: "#757575",
        borderColor: "#4f4f4f",
        darkModeColor: "#FFF",
        darkModeBackgroundColor: "#4f4f4f",
        darkModeHeaderColor: "#242424",
        darkModeFocusColor: "#000",
        darkModeBorderColor: "#757575",
    },
    {
        name: "helloThere",
        color: "#2B2729",
        backgroundColor: "#918781",
        headerColor: "#74635E",
        focusColor: "#4E97E9",
        borderColor: "#2B2729",
        darkModeColor: "#4E97E9",
        darkModeBackgroundColor: "#3F383B",
        darkModeHeaderColor: "#2B2729",
        darkModeFocusColor: "#000000",
        darkModeBorderColor: "#FFFFFF",
    },
    {
        name: "t3",
        color: "#000",
        backgroundColor: "#f8f9fa",
        headerColor: "#BFB8AB",
        focusColor: "#FFD530",
        borderColor: "#000000",
        darkModeColor: "#8A8A8A",
        darkModeBackgroundColor: "#212121",
        darkModeHeaderColor: "#000000",
        darkModeFocusColor: "#FFD530",
        darkModeBorderColor: "#000000",
    },
    {
        name: "humanCyborgRelations",
        color: "#0B2F79",
        backgroundColor: "#E7E6EC",
        headerColor: "#B7B6BC",
        focusColor: "#F1C330",
        borderColor: "#0B2F79",
        darkModeColor: "#E7E6EC",
        darkModeBackgroundColor: "#282829",
        darkModeHeaderColor: "#051433",
        darkModeFocusColor: "#0B2F79",
        darkModeBorderColor: "#F1C330",
    },
    {
        name: "iAmYourFather",
        color: "#000",
        backgroundColor: "#fff",
        headerColor: "#dbdbdb",
        focusColor: "#F00",
        borderColor: "#000",
        darkModeColor: "#fff",
        darkModeBackgroundColor: "#1a1a1a",
        darkModeHeaderColor: "#000",
        darkModeFocusColor: "#F00",
        darkModeBorderColor: "#000",
    },
  ], //  *REQUIRED* available/selectable theme color palettes.
  theme: "t3", // *REQUIRED* default theme
  // hiddenToolBar: true, // tool bar can be hidden with `.hideToolbar()`
  // autoHide: true, // toolbar will autohide
  // EnableFavorites: false, // start menu contains favorites
  toolBarPosition: "left", // use to position toolbar by default
  // EnableCollections: false, // start menu contains collections
  toolBarWidth: 82, // measured in px
  logo: "/Content/img/logo.png", //  *REQUIRED* will propogate a logo opposite from the hamburger
  //darkModeLogo: "/darkModeLogo.png", //  *REQUIRED* logo will flip to this when dark mode is selected
    backgroundImage: "/Content/img/logo.png", // will cover the background, preserving ratio
    backgroundVisible: true, // whether or not the logo image will show on the background.
  // logoOnclick: function () {
  //   GlobalWindowManager.toolBarVisible ? GlobalWindowManager.hideToolbar() : GlobalWindowManager.showToolbar();
  // }, // fires when logo icon is clicked
  // this array determines what icons (usually each opens an app) you see by default in the toolbar
  toolBarItems: [
    // *REQUIRED*
    //array of App Objects, the below are all required params:
    {
      AppID: 99,
      AppTitle: "icons",
      Description: "Icon Package",
      Icon: "pfi-icons",
      AppMenuAltTitle: "Icons",
      AppHeader: "Icons",
      AppFooter: null,
      URL: null,
      OpenNewTab: null,
      ClassFile: "/Content/js/apps/icons.js",
      ClassName: "icons",
      Roles: "admin",
      KeyWords: null,
    },
    {
      AppID: 98,
      AppTitle: "Auto Form",
      Description: "Auto Form",
      Icon: "pfi-form",
      AppMenuAltTitle: "Auto Form",
      AppHeader: "Auto Form",
      AppFooter: null,
      URL: null,
      OpenNewTab: null,
      ClassFile: "/Content/js/apps/autoForm.js",
      ClassName: "autoForm",
      Roles: "admin",
      KeyWords: null,
    },
    {
      AppID: 97,
      AppTitle: "Notes App",
      Description: "Note taking app",
      Icon: "pfi-notes",
      AppMenuAltTitle: "Notes App",
      AppHeader: "Notes App",
      AppFooter: null,
      URL: null,
      OpenNewTab: null,
      ClassFile: "/Content/js/apps/notes.js",
      ClassName: "notes",
      Roles: "admin",
      KeyWords: null,
    },
    {
      AppID: 2,
      id: "toolbar-Settings-button",
      AppTitle: "Settings",
      Description: "Customize your Kitchen Windows . . . ",
      Icon: "pfi-gear",
      ClassFile: "/Content/js/apps/Settings.js",
      ClassName: "Settings",
      onclick: async function (context) {
        // onclick method will be fired off when button/icon is clicked.
        context.showPopup(
          context.settingsButton,
          context.settingsWindow.window
        );
      },
    },
    //{
    //  AppTitle: "App Start Menu",
    //  Description: "Find and open a new app ... ",
    //  Icon: "pfi-math-plus",
    //  URL: "https://calebtrachte.com", //use this if the icon should link somewhere
    //  init: createAppsManagerMenu, // right now this method is in extensions.t3.js
    //  id: "toolbar-newWSI-button",
    //  width: "auto",
    //  onclick: async function (context) {
    //    context.AppsManager.favorites = context.AppsManager.getFavoritedApps();
    //    context.showPopup(
    //      context.newAppButton,
    //      context.appsManagerWindow.window
    //    );
    //    context.AppsManager.usageData = context.AppsManager.getUsage();
    //    context.appsManagerWindow.window
    //      .querySelector("#windows-toolbar-search")
    //      .focus();
    //  },
    //},
  ],
};

//instantiate windows
const GlobalWindowManager = new DraggableWindows(WindowsOptions);
