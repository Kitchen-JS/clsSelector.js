const fs = require('fs');
const path = require('path');
const pkg = require('./package.json');

let jsInputPath = path.join(__dirname, '/www/content/js/clsSelector.js');
let jsOutputPath = path.join(__dirname, '/output/clsSelector.js');
let jsContent = '';

fs.readFile(jsInputPath, {encoding: 'utf-8'}, async (err,data) =>
{
    if (!err) 
    {
        jsContent = `/**************************************
* ${pkg.name} - ${pkg.description}
* @version ${pkg.version}
* @lastBuild ${new Date()}
* TailWind: v${pkg.dependencies.tailwindcss}
* @author KitchenJS
* @link https://github.com/Kitchen-JS/${pkg.name}
**************************************/

${data}`;

        fs.writeFile(jsOutputPath, jsContent, err => 
        {
            if (err) 
            {
                console.error(err);
            }
            else
            {
                console.log('/output/clsSelector.js:' + ' written successfully')
            }
        });
    } 
    else 
    {
        console.log(err);
    }
});

let cssInputPath = path.join(__dirname, '/www/content/css/clsSelector.css');
let cssOutputPath = path.join(__dirname, '/output/clsSelector.css');
let cssContent = '';

fs.readFile(cssInputPath, {encoding: 'utf-8'}, async (err,data) =>
{
    if (!err) 
    {
        cssContent = `/**************************************
* ${pkg.name} - ${pkg.description}
* @version ${pkg.version}
* @lastBuild ${new Date()}
* PEC T3-Tailwind-Theme Latest Version
* TailWind: v${pkg.dependencies.tailwindcss}
* @author KitchenJS
* @link https://github.com/Kitchen-JS/${pkg.name}
**************************************/

${data}`;

        fs.writeFile(cssOutputPath, cssContent, err => 
        {
            if (err) 
            {
                console.error(err);
            }
            else
            {
                console.log('/output/clsSelector.css:' + ' written successfully')
            }
        });
    } 
    else 
    {
        console.log(err);
    }
});