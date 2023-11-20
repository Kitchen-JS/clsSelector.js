/**
 * clsBaseClass - Helper class consumed by other classes that returns details about the class that consumes it.
 * @author KitchenJS
 * @version 0.3.0
 * @link https://github.com/Kitchen-JS/clsBaseClass.js
 */
const baseClassMap = {}; //Key value map of classes ex:// baseClassMap["baseClass"] = baseClass;
class clsBaseClass
{
    /**
     * Class constructor
     * @constructor
     */
    constructor(instanceName)
    {
        /** Debug flag set here will be set by all classes that inherit it */
        this.debug = true;

        this._instanceName = instanceName || null;
    }

    /**
     * Returns current instance class name
     * @return {*}
     */
    className()
    {
        return this.constructor.name;
    }

    //Requires class be added to baseClassMap
    classDef()
    {
        if(typeof baseClassMap[this.className()] !== 'undefined')
        {
            return baseClassMap[this.className()];
        }
        else
        {
            return null;
        }
    }

    clone()
    {
        let origClass = this.classDef();

        if(origClass)
        {
            let clonedClassInstance = Object.assign(new origClass, this);

            return clonedClassInstance;
        }
        else //Backup method for unmapped classes
        {
            let clonedClassInstance = {};

            let methods = this.methods();

            methods.forEach((method) => 
            {
                clonedClassInstance[method] = this[method];
            });

            let keys = Object.keys(this);
            keys.forEach((key) =>
            {
                clonedClassInstance[key] = this[key];
            });

            return clonedClassInstance;
        }
    }

    /**
     * Returns current class instance name
     * @return {*}
     */
     classInstanceName()
     {
        return this._instanceName;
     }

    /**
     * Returns current instance class method names
     * @return {*}
     */
    methods()
    {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(this));
    }

    /**
     * Returns current instance class property names
     * @return {*}
     */
    properties()
    {
        return Object.getOwnPropertyNames(this);
    }

    //Remove keys that are needed when passing to API
    removeInternalProperties()
    {
        let keys = Object.keys(this);
        keys.forEach((key) =>
        {
            if(key.indexOf('_') > -1 || key.indexOf('#') > -1 )
            {
                delete this[key];
            }
        });

        // if(typeof this._dataTypes !== 'undefined')
        // {
        //     delete this._dataTypes;
        // }
        // if(typeof this.created !== 'undefined')
        // {
        //     delete this.created;
        // }
        // if(typeof this.updated !== 'undefined')
        // {
        //     delete this.updated;
        // }
        // if(typeof this.id !== 'undefined')
        // {
        //     delete this.id;
        // }
    }

    randomNumber(min, max)
    {
        return Math.floor(Math.random() * (max - min) ) + min;
    }

    randomLetter()
    {
        let letters =  'abcdefghijklmnopqrstuvwxyz'.split('');
        let num = Math.floor(Math.random() * letters.length);
        return letters[num];
    }

    randomID()
    {
        let datetime = Date.now();
        return 'kbc-' + this.randomLetter() + this.randomNumber(100, 900) + '-' + datetime;
    }
}
baseClassMap["clsBaseClass"] = clsBaseClass;