/**************************************
* clsTailwind - Tailwind Helper see const tailwind at bottom of page
* @version 0.1.2
* @lastBuild Sun May 19 2024 15:43:05 GMT-0500 (Central Daylight Time)
* @author KitchenJS
* @link https://github.com/Kitchen-JS/kitchentwbasetheme
* TailWind: v^3.4.1
* Credit to work done by https://github.com/andrewdeclue
**************************************/

class clsTailwind
{
    constructor()
    {
        this.systemColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        this.userColorSchemeSet = localStorage.getItem('color-theme') === null ? false : true;
        this.currentColorScheme;
        this.currentColorClass;

        this.darkMode = false;
        
        this.LightDarkChangeEvents = [];
        this.ColorSchemeResetEvents = [];

        // Watch local system scheme
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => { this.systemColorSchemeChanged(e); })

        window.addEventListener('load', () =>
        {
            this.init();
        });
    }

    init()
    {
        //If Kitchen Windows Framework do not auto assign color scheme take default from Kitchen WindowsConfig
        if(typeof clsKitchenWindows === 'undefined')
        {
            this.checkColorScheme();
        }
    }

    isColorSchemeSetSet()
    {
        if(localStorage.getItem('color-theme') === null && !document.querySelector('html').classList.contains('light') && !document.querySelector('html').classList.contains('dark'))
        {
            return false;
        }
        else
        {
            return true;
        }
    }

    addLightDarkListener(func)
    {
        this.LightDarkChangeEvents.push(func);
    }

    LightDarkChangeEvent()
    {
        this.LightDarkChangeEvents.forEach((func) =>
        {
            func();
        });
    }

    checkColorScheme()
    {
        this.userColorSchemeSet = localStorage.getItem('color-theme') === null ? false : true;

        let isLightDarkSet = false;


        if(document.querySelector('html').classList.contains('light') || document.querySelector('html').classList.contains('dark'))
        {
            isLightDarkSet = true;
            this.currentColorClass = document.querySelector('html').classList.contains('light') ? 'light' : 'dark';
        }        

        if(!isLightDarkSet && this.userColorSchemeSet)
        {
            if(localStorage.getItem('color-theme') === 'dark')
            {
                this.setDark();
            }
            else
            {
                this.setLight();
            }
        }
        else if(!isLightDarkSet && !this.userColorSchemeSet)
        {
            if(this.systemColorScheme === 'dark')
            {
                this.setDark();
            }
            else
            {
                this.setLight();
            }
        }
    }

    isDark()
    {
        this.checkColorScheme();
        return this.darkMode;
    }

    setDark()
    {
        document.querySelector('html').classList.remove('light');
        document.querySelector('html').classList.add('dark');
        this.currentColorScheme = 'dark';
        this.darkMode = true;
        this.LightDarkChangeEvent();
    }

    setLight()
    {
        document.querySelector('html').classList.remove('dark');
        document.querySelector('html').classList.add('light');
        this.currentColorScheme = 'light';
        this.darkMode = false;
        this.LightDarkChangeEvent();
    }

    systemColorSchemeChanged(e)
    {
        this.systemColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        this.checkColorScheme();
        this.LightDarkChangeEvent();
    }

    toggleColorScheme()
    {
        this.userColorSchemeSet = true;
        this.checkColorScheme();

        if(this.currentColorScheme === 'dark')
        {
            this.setColorSchemeUserPreference('light');
            this.setLight();
        }
        else
        {
            this.setColorSchemeUserPreference('dark');
            this.setDark();
        }
    }

    setColorSchemeUserPreference(scheme)
    {
        localStorage.setItem('color-theme', scheme);
    }

    resetColorScheme()
    {
        this.currentColorScheme = null;
        this.currentColorClass = null;

        this.removeUserPreference();
        this.ColorSchemeResetEvent();
        this.checkColorScheme();
    }

    removeUserPreference()
    {
        localStorage.removeItem('color-theme');
        document.querySelector('html').classList.remove('light');
        document.querySelector('html').classList.remove('dark');
    }

    addSchemeResetListener(func)
    {
        this.ColorSchemeResetEvents.push(func);
    }

    ColorSchemeResetEvent()
    {
        this.ColorSchemeResetEvents.forEach((func) =>
        {
            func();
        });
    }
}
const tailwind = new clsTailwind();