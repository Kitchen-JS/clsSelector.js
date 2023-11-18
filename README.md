# clsSelector
Simple JS Selector Class that is populated with json data

## Usage
Download the latest release from the release section
```
let selector = new clsSelector(
{
    containerElement: document.querySelector('.mySelector')
});
```

### Options
- refresh - method provided to get a list of possible results used in a static fashion. The refresh button can be pushed to update/repopulate list.
- liveSearch - method provided to search an API given a search term

### Usage notes
- Does not work inside an input-group but does work well within a flex-form

### Add single items to selector
```selector.addItem('value1', 'textValue1', 'listValue1');```

### Add simple array of items
```selector.addItems(['one', 'two', 'three']);```

### Arrays of data
#### Preferred
```
selector.addItems([object array], [key array in order of value, textValue, listValue])
or
selector.addItems([{name:'one',id:1,email:'one@sample.com'}, {name:'two',id:2,email:'two@sample.com'}, {name:'three',id:3,email:'three@sample.com'}], ['id','name','email'])
```
#### Fallback
```
selector.addItems([{name:'one',id:1,email:'one@sample.com'}, {name:'two',id:2,email:'two@sample.com'}, {name:'three',id:3,email:'three@sample.com'}]);
selector.addItems([['one',1,'one@sample.com'], ['two',2,'two@sample.com'], ['three',3,'three@sample.com']]);
```
- Assumes a pattern of ```value, textValue, listValue```
- Then defaults to ```value, textValue``` or ```value, textValue, textValue```
- Finally ```value``` or ```value, value, value```

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

### Tests
```
selector.addItems([]); //Empty
selector.addItems({}); //Object instead of array
selector.addItems(); //Nothing
```

### Build
npm run build

#### Just JavaScript output
node build

### Package
npm run build

//Copy all references to ```.clsSelector``` inside of [/www/content/css/clsSelector.css] to [/output/clsSelector.css] but none of the tailwind components beyond those.