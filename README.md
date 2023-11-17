# clsSelector
Simple JS Selector Class that is populated with json data

## Usage
Download the latest release
```
let selector = new clsSelector(
{
    containerElement: document.querySelector('.mySelector')
});
```

## Development

### Setup
- npm i -g tailwindcss
- npm install
- npm update

### Dependencies

#### Theme
Use latest PEC theme www folder https://github.com/PEC-Development-Team/T3-Tailwind-Theme replacing local
- www/content/css/tailwindTheme.css
- www/Form.html (for reference)

#### clsBaseClass.js
Depends on clsBaseClass.js https://github.com/Kitchen-JS/clsBaseClass.js

### Edit
/tailwindInput/clsSelector.css
/www/content/js/clsSelector.js

### Run
1st Terminal
```
npm run build-run
```
2nd Terminal
```
node serve
```

### Build
npm run build

#### Just JavaScript output
node build

### Package
npm run build

//Copy all references to ```.clsSelector``` inside of [/www/content/css/clsSelector.css] to [/output/clsSelector.css] but none of the tailwind components beyond those.