async function inject(context, newWindow)
{
    if (!newWindow)
    {
        newWindow = context;
    }
    if (typeof newWindow.inject === 'object' && newWindow.inject.length)
    {
        newWindow.objectDependencies = [];
        await newWindow.inject.forEach(async (item, i) =>
        {
            if (typeof item === "string")
            {
                let script = new ScriptLoader({
                    src: item,
                    global: true,
                });
                let load = true;
                let head = document.querySelector('head');
                let currentScripts = Array.from(head.children);
                await currentScripts.forEach(async (currentScript) =>
                {
                    if (typeof currentScript.src === "string")
                    {
                        let relativeLoc = currentScript.src.split("T3")[1];
                        if (relativeLoc === item)
                        {
                            console.warn('dependency: "' + item + '" not injected. This reference is already in scope.');
                            load = false
                        }
                    }
                });
                if (load)
                {
                    await script.load().then((res) =>
                    {
                        // console.log('dependency: "' + item + '" injected.')
                    }).catch(error => console.error(error));
                }
            }
            if (typeof item === "function")
            {
                //let scriptElement = document.createElement('script');
                //scriptElement.innerHTML = item;
                //container ? container.appendChild(scriptElement) : context.container.appendChild(scriptElement);
                console.warn('Dangerously adding the dependency function: "' + item.name + '" to the DOM is not a safe practice. Add it to a project file, then pass a reference to that file instead.');
            }
            if (typeof item === "object")
            {
                context.objectDependencies[i] = item;
                console.warn('Object dependency injected to WorkspaceItem.objectDependencies[' + i + '].')
            }
        });
    }
}

class ScriptLoader
{
    constructor(options)
    {
        const { src, type, global, protocol = document.location.protocol } = options
        this.src = src
        this.global = global
        this.type = options.type;
        //this.protocol = protocol
        this.isLoaded = false;
        this.checkFileType = this.checkFileType.bind(this);
        this.loadScript = this.loadScript.bind(this);
        this.checkFileType(src)
    }
    checkFileType(fileString)
    {
        this.isCss = fileString.substr(fileString.split('').length - 3, fileString.split('').length - 1) === "css";
        this.isJs = fileString.substr(fileString.split('').length - 2, fileString.split('').length - 1) === "js";
        //console.log(fileString, fileString.substr(fileString.split('').length - 2, fileString.split('').length - 1))
        if (!this.isCss && !this.isJs) throw new Error(`Unrecognized file type: ${this.src} must be of file type CSS or JS to be injected.`)
    }
    loadScript()
    {
        let context = this;
        return new Promise((resolve, reject) =>
        {
            // Create script element and set attributes
            if (context.isJs)
            {
                const script = document.createElement('script')
                script.type = context.type || 'text/javascript'
                script.async = true
                script.src = `${this.src}`
                console.log('from load', script)
                // Append the script to the DOM
                let head = document.querySelector('head');
                head.appendChild(script)

                // Resolve the promise once the script is loaded
                script.addEventListener('load', () =>
                {
                    this.isLoaded = true
                    resolve(script)
                })

                // Catch any errors while loading the script
                script.addEventListener('error', () =>
                {
                    reject(new Error(`${this.src} failed to load.`))
                })
            } else if (context.isCss)
            {
                const style = document.createElement('link')
                style.rel = 'stylesheet'
                style.async = true
                style.href = `${this.src}`
                // Append the style to the DOM
                let head = document.querySelector('head');
                head.prepend(style);
                // Resolve the promise once the style is loaded
                style.addEventListener('load', () =>
                {
                    this.isLoaded = true
                    resolve(style)
                })

                // Catch any errors while loading the style
                style.addEventListener('error', () =>
                {
                    reject(new Error(`${this.src} failed to load.`))
                })
            }

        })
    }

    load()
    {
        return new Promise(async (resolve, reject) =>
        {
            if (!this.isLoaded)
            {
                try
                {
                    await this.loadScript()
                    resolve(window[this.global])
                } catch (e)
                {
                    reject(e)
                }
            } else
            {
                resolve(window[this.global])
            }
        })
    }
}