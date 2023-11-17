const fs = require('fs');
const pkg = require('./package.json');

let outputJSStr = `/**************************************
T3-TailWind-Theme: ${pkg.version}
TailWind: v${pkg.devDependencies.tailwindcss}
**************************************/
`;

outputJSStr += 'const tailWind = ' + JSON.stringify(outputJS);

// Write JS File
// fs.writeFile(outputPath, outputJSStr, err => 
// {
//     if (err) 
//     {
//       console.error(err);
//     }
//     else
//     {
//         console.log(outputPath + ' written successfully')
//     }
// });