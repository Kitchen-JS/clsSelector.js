/// Automapping of Form Elements to Object Properties - This maps the data structure classes to the form elements
/// The form element classes need to match the following naming schema in order to achive automapping of elements to object properties
/// Schema: {Name of the Table}{Name of the Column}
/// Example: EventTemplate.Title would be EventTemplateTitle
class clsBaseData
{
    constructor(options = {})
    {
        this._options;
        this._objName = this.constructor.name.substring(3, this.constructor.name.length)

        if (!options)
        {
            options = {};
        }
        this._options = options;

        if (typeof this._options.Auth == 'undefined')
        {
            this._options.Auth = true;
        }

        if (!this._options.containerElement)
        {
            this._options.containerElement = null;
        }
        if (!this._options.mapFirst)
        {
            this._options.mapFirst = [];
        }
        if (!this._options.fieldMapFunctions)
        {
            this._options.fieldMapFunctions = [{}];
        }
        //Should mirror classname Ex:// InventoryItemTypesObj
        if (!this._options.objectParameterName)
        {
            this._options.objectParameterName = this._objName + 'Obj';
        }
        if (typeof this._options.createPath === 'undefined')
        {
            this._options.createPath = '/T3/Crud/Create';
        }
        if (!this._options.createResultFunction)
        {
            this._options.createResultFunction = function () { };
        }
        if (typeof this._options.getPath === 'undefined')
        {
            this._options.getPath = '/T3/Crud/Get';
        }
        if (!this._options.getResultFunction)
        {
            this._options.getResultFunction = function () { };
        }
        if (typeof this._options.updatePath === 'undefined')
        {
            this._options.updatePath = '/T3/Crud/Update';
        }
        if (!this._options.updateResultFunction)
        {
            this._options.updateResultFunction = function () { };
        }
        if (!this._options.cancelResultFunction)
        {
            this._options.cancelResultFunction = function () { };
        }
        if (!this._options.failResultFunction)
        {
            this._options.failResultFunction = function () { };
        }
        if (!this._options.autoButtons)
        {
            this._options.autoButtons = false;
        }
        if (!this._options.cancelDefaults)
        {
            this._options.cancelDefaults = {};
        }
        if (!this._options.validateFunction)
        {
            this._options.validateFunction = function ()
            {
                return null;
            }
        }
        if (!this._options.verbose)
        {
            this._options.verbose = false;
        }

        if (this._options.containerElement)
        {
            setTimeout(() =>
            {
                this.mapObjects();
            }, 1);
        }

        if (this._options.autoButtons)
        {
            let autoButtonsContainerElement;
            if (typeof (this._options.autoButtons) == 'boolean')
            {
                autoButtonsContainerElement = this._options.containerElement;
            } else
            {
                autoButtonsContainerElement = this._options.autoButtons;
            }
            if (autoButtonsContainerElement)
            {
                let cancelBtn = null;
                let btnFunctions = {

                    'Delete': function (value)
                    {
                        if (this[this._primaryKey])
                        {
                            let archiveFunc = function ()
                            {
                                this.Get(); //reverts back to server state so we aren't making additional changes the user hadn't saved.
                                this.Active = false;
                                let deleteSuccess = this.Update(this._objName.split(/(?=[A-Z])/).join(' ') + ' deleted successfully', 'Failed to delete ' + this._objName.split(/(?=[A-Z])/).join(' '));
                                if (deleteSuccess && cancelBtn)
                                {
                                    cancelBtn.click(); //perform the page specific cancel button behavior
                                }
                            }.bind(this);
                            let archivePrompt = 'Are you sure you want to delete this ' + this._objName.split(/(?=[A-Z])/).join(' ') + '?';
                            if (this.isT3())
                            {
                                GlobalWindowManager.confirm(archivePrompt, archiveFunc);
                            } else
                            {
                                if (confirm(archivePrompt))
                                {
                                    archiveFunc();
                                }
                            }
                        } else
                        {
                            globalCallouts.fail('Can not delete ' + this._objName.split(/(?=[A-Z])/).join(' ') + ' - Nothing Selected!');
                        }
                    }.bind(this),

                    'Cancel': function (value)
                    {
                        this.Cancel();
                    }.bind(this),

                    'Reset': function (value)
                    {
                        if (this[this._primaryKey])
                        {
                            this.Get();
                        } else
                        {
                            this.Cancel();
                        }
                    }.bind(this),

                    'Save': function (value)
                    {
                        let validateMsg = this._options.validateFunction();
                        if (validateMsg)
                        {
                            globalCallouts.fail(validateMsg);
                        } else
                        {
                            if (this[this._primaryKey])
                            {
                                this.Update(this._objName.split(/(?=[A-Z])/).join(' ') + ' updated successfully', 'Failed to update ' + this._objName.split(/(?=[A-Z])/).join(' '));
                            } else
                            {
                                this.Create(this._objName.split(/(?=[A-Z])/).join(' ') + ' created successfully', 'Failed to create ' + this._objName.split(/(?=[A-Z])/).join(' '));
                            }
                        }
                    }.bind(this),

                };

                Object.entries(btnFunctions).forEach(([name, func]) =>
                {
                    var n = 0;
                    autoButtonsContainerElement.querySelectorAll('button.' + this._objName + '_' + name).forEach(button =>
                    {
                        if (this._options.verbose)
                        {
                            console.log(name + ' function MAPPED to:');
                            console.log(button);
                        }
                        button.addEventListener('click', func);
                        if (name == 'Cancel') { cancelBtn = button; }
                        n++;
                    });
                    if (this._options.verbose && n == 0)
                    {
                        console.log(name + ' function NOT AUTO-MAPPED!');
                    }
                });

            } else
            {
                throw '_options.containerElement must be defined to use autoButtons true, otherwise set autoButtons as another container element: TEAMclsBaseData.js';
            }

        }

    }

    isT3()
    {
        return window.location.pathname.toLowerCase().startsWith('/t3');
    }

    preFormat()
    {
        this.jsonFormat('stringify');
        Object.keys(this).forEach((key) =>
        {
            if (this._dataTypes[key] == 'datetime' && typeof (this[key]) == 'string')
            {
                if (this[key].toLowerCase() == 'invalid date')
                {
                    this[key] = null;
                }
            }
            else if (this._dataTypes[key] == 'date' && typeof (this[key]) == 'string')
            {
                if (this[key].toLowerCase() == 'invalid date')
                {
                    this[key] = null;
                }
            }
            else if (this._dataTypes[key] == 'int' && typeof (this[key]) == 'string')
            {
                this[key] = parseInt(this[key]);
            }
            else if (this._dataTypes[key] == 'decimal' && typeof (this[key]) == 'string')
            {
                this[key] = parseFloat(this[key]);
            }
        });
    }

    postFormat()
    {
        this.jsonFormat('parse');
        Object.keys(this).forEach((key) =>
        {
            if (this._dataTypes[key] == 'datetime')
            {
                this[key] = moment(this[key]).format('MM/DD/YYYY HH:mm');
            }
            else if (this._dataTypes[key] == 'date')
            {
                this[key] = moment(this[key]).format('MM/DD/YYYY');
            }
        });
    }

    /**
    * ONLY WORKS IN T3
    * @arg whichFunc - "stringify" or "parse"
    */
    jsonFormat(whichFunc)
    {
        if (this.isT3())
        {
            Object.keys(this).map(ObjProperty =>
            {
                if (!ObjProperty.startsWith('_') && ObjProperty.toLowerCase().includes('json') && this._dataTypes[ObjProperty].indexOf('varchar') > -1)
                {
                    this[ObjProperty] = JSON[whichFunc](this[ObjProperty]);
                }
            });
        }
    }

    validateConstructorForMapping()
    {
        if (!this._options.containerElement)
        {
            throw '_options.containerElement must be defined: TEAMclsBaseData.js';
        }
    }

    mapObjects()
    {
        this.validateConstructorForMapping();
        let doubleDatePickers = [];
        let singleDatepickers = [];
        Object.keys(this).map(ObjProperty =>
        {
            if (!ObjProperty.startsWith('_'))
            {

                let FormElementClassName = this._objName + ObjProperty;
                let formElement = this._options.containerElement.querySelector('.' + FormElementClassName);
                if (ObjProperty in this._options.fieldMapFunctions)
                {

                    let changeObj = this._options.fieldMapFunctions[ObjProperty].changeEvent[0];
                    let changeFuncName = this._options.fieldMapFunctions[ObjProperty].changeEvent[1];
                    if (changeObj && typeof changeObj.containerElement !== 'undefined' && (changeObj.containerElement.nodeName === "SELECTOR" || changeObj.containerElement.nodeName === "DIV"))
                    {
                        changeObj = changeObj.containerElement.querySelector('input');
                        changeObj.addEventListener('change', (e) =>
                        {
                            this[ObjProperty] = this._options.fieldMapFunctions[ObjProperty].valueAfterChange();
                        });
                        return true;
                    }
                    if (changeObj && typeof changeObj.containerElement !== 'undefined' && changeObj.containerElement.nodeName === "DATEPICKER")
                    {
                        doubleDatePickers.push({ 'name': ObjProperty, 'datepicker': changeObj, 'context': this });
                        if (doubleDatePickers.length > 1 && doubleDatePickers[0].datepicker === doubleDatePickers[1].datepicker)
                        {
                            let first = doubleDatePickers[0];
                            let second = doubleDatePickers[1];
                            changeObj.onChange = () =>
                            {
                                this[first.name] = this._options.fieldMapFunctions[first.name].valueAfterChange();
                                this[second.name] = this._options.fieldMapFunctions[second.name].valueAfterChange();
                            }
                            doubleDatePickers = [];
                        } else if (doubleDatePickers.length > 1 && doubleDatePickers[0].datepicker.containerElement !== doubleDatePickers[1].containerElement)
                        {
                            singleDatepickers.push(doubleDatePickers[0]);
                            doubleDatePickers = [doubleDatePickers[1]];
                        }
                        return true;
                    }
                    else if (changeObj)
                    {
                        let forminfo = this.determineFormObjectType(changeObj);
                        if (forminfo)
                        {
                            if (Object.keys(forminfo['events']).includes(changeFuncName))
                            {
                                changeObj.addEventListener(changeFuncName, function (e)
                                {
                                    this[ObjProperty] = this._options.fieldMapFunctions[ObjProperty].valueAfterChange();
                                }.bind(this));
                                return true;
                            }
                        }
                    }

                    let oldChangeFunc = changeObj[changeFuncName] || function () { };
                    changeObj[changeFuncName] = function ()
                    {
                        oldChangeFunc(); //so as not to override any function already in place
                        this[ObjProperty] = this._options.fieldMapFunctions[ObjProperty].valueAfterChange();
                    }.bind(this);

                }
                else if (formElement)
                {
                    this.createFormObjectListener(ObjProperty, formElement);
                }
                else
                {
                    if (this._options.verbose)
                    {
                        console.warn(ObjProperty + ' NOT MAPPED!');
                    }
                }
            }
        });
        if (doubleDatePickers.length) singleDatepickers.push(doubleDatePickers[0]);
        if (singleDatepickers.length)
        {
            singleDatepickers.forEach((datepicker) =>
            {
                datepicker.datepicker.onChange = () =>
                {
                    datepicker.context[datepicker.name] = datepicker.context._options.fieldMapFunctions[datepicker.name].valueAfterChange();
                }
            });
        }
    }

    createFormObjectListener(ObjProperty, formElement)
    {
        this.validateConstructorForMapping();

        let forminfo = this.determineFormObjectType(formElement);
        if (forminfo)
        {
            Object.keys(forminfo['events']).forEach(eventName =>
            {

                let eventTimeout = forminfo['events'][eventName];

                let changeFunc = function ()
                {
                    setTimeout(() =>
                    {
                        this[ObjProperty] = formElement[forminfo['elemAttr']];
                    }, eventTimeout);
                }.bind(this);
                formElement.addEventListener(eventName, function (e)
                {
                    if (ObjProperty == 'Active' && this.Active)
                    {

                        let changePrompt = 'This could remove this item from view. Do you want to continue?';
                        if (this.isT3())
                        {
                            GlobalWindowManager.confirm(changePrompt, changeFunc, () => { this.populateFormObject('Active', formElement); });
                        } else
                        {
                            if (confirm(changePrompt))
                            {
                                changeFunc();
                            } else
                            {
                                e.preventDefault();
                            }
                        }

                    } else
                    {
                        changeFunc();
                    }

                }.bind(this));

            })

            if (this._options.verbose)
            {
                console.log(ObjProperty + ' MAPPED TO events: [' + Object.keys(forminfo['events']).join(',') + '] attr: ' + forminfo['elemAttr'], formElement);
            }
        }
        else
        {
            if (this._options.verbose)
            {
                console.warn(ObjProperty + ' of unknown form type!');
            }
        }
    }

    determineFormObjectType(formElement)
    {
        this.validateConstructorForMapping();

        if (formElement.getAttribute('contenteditable'))
        {
            formElement.classList.add('textarea');
        }

        let formTypeMap = {
            'text': [{ 'keyup': 0, 'cut': 0, 'paste': 0 }, 'value'],
            'textarea': [{ 'keyup': 0, 'cut': 0, 'paste': 0 }, 'value'],
            'number': [{ 'change': 0 }, 'value'],
            'checkbox': [{ 'click': 0 }, 'checked'],
            'select-one': [{ 'change': 0 }, 'value']
        };
        let formClassMap = {
            'textarea': [{ 'keyup': 0, 'cut': 0, 'paste': 0, 'click': 0 }, 'innerHTML']
        };
        if (formElement.type in formTypeMap)
        {
            return {
                'events': formTypeMap[formElement.type][0],
                'elemAttr': formTypeMap[formElement.type][1]
            };
        }
        let foundClass = Object.keys(formClassMap).find(function (thisclass)
        {
            return formElement.classList ? formElement.classList.contains(thisclass) : false;
        });

        if (foundClass)
        {
            return {
                'events': formClassMap[foundClass][0],
                'elemAttr': formClassMap[foundClass][1]
            };
        }
        return false;
    }

    populateFormObjectsFromClassObjects()
    {
        this.validateConstructorForMapping();

        let keys = Object.keys(this);

        for (var priority of this._options.mapFirst.slice().reverse())
        {
            keys.sort(function (x, y) { return x == priority ? -1 : y == priority ? 1 : 0; });
        }

        keys.map(ObjProperty =>
        {
            if (ObjProperty in this._options.fieldMapFunctions)
            {
                this._options.fieldMapFunctions[ObjProperty].populateFunc(this[ObjProperty]);
            }
            else
            {
                let FormElementClassName = this._objName + ObjProperty;
                let formElement = this._options.containerElement.querySelector('.' + FormElementClassName);
                if (formElement)
                {
                    this.populateFormObject(ObjProperty, formElement);
                }
                return formElement;
            }
        });
    }

    populateFormObject(ObjProperty, formElement)
    {
        this.validateConstructorForMapping();

        let forminfo = this.determineFormObjectType(formElement);
        if (forminfo)
        {
            formElement[forminfo['elemAttr']] = this[ObjProperty];
        }
    }

    Create(callbackSuccess = null, callbackFail = null)
    {
        return this.ServerRequest(this._options.createPath, this._options.createResultFunction, callbackSuccess, callbackFail,
            { className: this._objName },
            (this._options.createPath === '/T3/Crud/Create') ? 'obj' : this._options.objectParameterName
        );
    }

    Get(multiReturn = false, callbackSuccess = null, callbackFail = null)
    {
        return this.ServerRequest(this._options.getPath, this._options.getResultFunction, callbackSuccess, callbackFail,
            { className: this._objName },
            (this._options.getPath === '/T3/Crud/Get') ? 'obj' : this._options.objectParameterName,
            multiReturn
        );
    }

    Update(callbackSuccess = null, callbackFail = null)
    {
        return this.ServerRequest(this._options.updatePath, this._options.updateResultFunction, callbackSuccess, callbackFail,
            { className: this._objName },
            (this._options.updatePath === '/T3/Crud/Update') ? 'obj' : this._options.objectParameterName
        );
    }

    ServerRequest(path, resultFunction, callbackSuccess = null, callbackFail = null, params = {}, objectParameterName = this._options.objectParameterName, multiReturn = false)
    {
        this.preFormat()
        params[objectParameterName] = this;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', path, false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        if (this._options.Auth)
        {
            xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
        }
        xhr.send(JSON.stringify(params, function (key, value)
        {
            return (key.startsWith('_')) ? undefined : value;
        }));
        if (xhr.status === 200)
        {
            if (!xhr.responseText && multiReturn)
            {
                return [];
            }
            let data = JSON.parse(xhr.responseText);

            if (multiReturn)
            {

                //compatibility in reverse - start
                if (data.constructor != Array)
                {
                    data = [data];
                }
                //comaptibility in reverse - end
                data = data.map(item =>
                {
                    item = Object.assign(new this.constructor(), item);
                    item.postFormat();
                    return item;
                });

                if (callbackSuccess)
                {
                    globalCallouts.success(callbackSuccess);
                }

                resultFunction();

                return data;

            } else
            {

                //compatibility - start | for older crud methods that return single object instead of array
                if (data.constructor == Array)
                {
                    data = data[0];
                }
                //comaptibility - end
                Object.assign(this, data);
                this.postFormat();

                if (callbackSuccess)
                {
                    globalCallouts.success(callbackSuccess);
                }

                //Automatically populate if form elements exist
                if (typeof this._options.containerElement !== 'undefined' && this._options.containerElement)
                {
                    this.populateFormObjectsFromClassObjects();
                }

                resultFunction();

                return true;

            }

        }
        else
        {
            if (callbackFail)
            {
                globalCallouts.fail(callbackFail);
            }
            this._options.failResultFunction();
            console.error(xhr.responseText);
            return false;
        }
    }

    Cancel()
    {
        Object.keys(this).map(function (attr)
        {
            if (!attr.startsWith('_'))
            {
                if (Object.keys(this._options.cancelDefaults).includes(attr))
                {
                    let attrDefault = this._options.cancelDefaults[attr];
                    this[attr] = (typeof attrDefault === 'function') ? attrDefault() : attrDefault;
                } else
                {
                    this[attr] = (attr == 'Active') ? true : null;
                }
            }
        }.bind(this));

        //Automatically populate if form elements exist
        if (typeof this._options.containerElement !== 'undefined' && this._options.containerElement)
        {
            this.populateFormObjectsFromClassObjects();
        }

        this._options.cancelResultFunction();

        return true;
    }

    static SearchParamsParser(param, DefaultSearchFields = null)
    {

        switch (typeof param)
        {
            case 'undefined':
                if (DefaultSearchFields)
                {
                    param = DefaultSearchFields.reduce((k, field) => ({ ...k, [field]: 1 }), {});
                } else
                {
                    param = {};
                }
                break;
            case 'string':
                if (!param.trim())
                {
                    param = {};
                } else if (param.includes('|'))
                {
                    param = param.split('|');
                } else
                {
                    param = param.trim().split(/\s+/)
                }
                param = param.reduce((k, field) => ({ ...k, [field]: 1 }), {});
                break;
            case 'object': //includes dict, array, null
                let constructor;
                try
                {
                    constructor = param.constructor.name;
                } catch (e)
                {
                    constructor = null;
                }
                switch (constructor)
                {
                    case 'Array':
                        param = param.reduce((k, field) => ({ ...k, [field]: 1 }), {});
                        break;
                    case 'Object':
                        //expected final state
                        break;
                    default:
                        throw 'null or invalid search parameter!';
                }
                break;
        };

        //remove special characters
        let adj = Object.keys(param).reduce(function (adj, key)
        {
            adj[key.replace(/[^0-9a-zA-Z ]+/g, "")] = param[key];
            return adj;
        }, {});
        param = adj;

        //filter (if fields, not terms)
        if (DefaultSearchFields)
        {
            let filtered = Object.keys(param).reduce(function (filtered, key)
            {
                if (DefaultSearchFields.includes(key)) filtered[key] = param[key];
                return filtered;
            }, {});
            param = filtered;
        }

        if (!Object.keys(param).length)
        {
            throw 'No text to search, or no searchable fields';
        }
        return param;

    }

    async TEAMSearch(searchText, options = {}, signal)
    { //the "instance" version
        return await this.constructor.TEAMSearch(searchText, Object.assign(options, { limitObj: this }), signal);
    }

    static async TEAMSearch(searchText, options = {}, signal)
    {
        /**
         * It will try to treat both searchText (required) and searchFields option (not required) in the following order...
         * 1. [searchFields only] If undefined, all string fields, equally weighted
         * 2. String (pipe delimited, equally weighted)
         * 3. String (space delimited, equally weighted)
         * 4. Array of strings, equally weighted
         * 5. Dictionary with keys as strings and 
         * 6. Otherwise throw error
         */

        let classTemplate = new this();
        let strFields = [];
        for (let [field, type] of Object.entries(classTemplate._dataTypes))
        {
            if (type.indexOf('varchar') > -1)
            {
                strFields.push(field);
            }
        }

        searchText = this.SearchParamsParser(searchText);
        options.searchFields = this.SearchParamsParser(options.searchFields, strFields);
        if (typeof options.active == 'undefined')
        {
            options.active = true;
        }
        if (typeof options.countLimit == 'undefined')
        {
            options.countLimit = null;
        }
        if (typeof options.sortAscending == 'undefined')
        {
            options.sortAscending = false;
        }
        if (typeof options.limitObj == 'undefined')
        {
            options.limitObj = classTemplate;
        }

        // ... but if "Active" isn't a legitimate field, don't use it!
        if (options.active && !Object.keys(classTemplate._dataTypes).includes('Active'))
        {
            options.active = false;
        }

        let reqBody = JSON.stringify({
            className: classTemplate._objName,
            fields: options.searchFields,
            terms: searchText,
            active: options.active,
            countLimit: options.countLimit,
            sortAscending: options.sortAscending,
            limitObj: options.limitObj
        });

        var doFetch = () => fetch('/T3/Crud/SearchAsync', {
            method: 'POST',
            body: reqBody,
            signal: signal,
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization': localStorage.getItem('token')
            }
        });

        return new Promise(async (resolve, reject) =>
        {
            await doFetch().then(async function (response)
            {
                await response.text().then(async function (data)
                {
                    if (!data)
                    {
                        resolve([]);
                    } else
                    {
                        data = JSON.parse(data);
                        if (data.constructor.name == 'Object')
                        {
                            data = [data];
                        }
                        data = data.map(item =>
                        {
                            item = Object.assign(new this(), item);
                            item.postFormat();
                            return item;
                        });
                        resolve(data);
                    }
                }.bind(this));
            }.bind(this));
        });

    }
}