class clsSelector extends clsBaseClass
{
    constructor(options)
    {
        super();

        this.changeEvents = [];

        if (typeof options === 'undefined')
        {
            console.error('clsSelector: options must be defined');
        }

        this.options = options;

        if (typeof this.options.containerElement === 'undefined')
        {
            console.error('clsSelector: containerElement must be defined');
        }

        if (typeof this.options.placeHolder !== 'undefined')
        {
            this.options.placeholder = this.options.placeHolder;
        }

        if (typeof this.options.placeholder === 'undefined')
        {
            this.options.placeholder = 'Type to Search';
        }

        if(typeof this.options.liveSearch === 'undefined')
        {
            this.options.liveSearch = null;
        }
        else
        {
            console.error('clsSelector - liveSearch: not implemented yet');
        }

        if(typeof this.options.refresh === 'undefined')
        {
            this.options.refresh = null;
        }

        if(this.options.refresh && this.options.liveSearch)
        {
            console.error('clsSelector: can not have both refresh and liveSearch options');
        }

        if(typeof this.options.onChange !== 'undefined')
        {
            this.addChangeListener(this.options.onChange);
        }

        this.options.minSearchLen = 3;

        this.containerElement = this.options.containerElement;

        // Search via DB or API

        this.selectorInput;
        this.selectorMenu;

        this.init();
    }

    init()
    {
        let id = this.randomID();

        this.containerElement.classList.add('clsSelector');        

        this.containerElement.innerHTML = `
            <div class="main-input input-group">
                <input class="selector-input peer" type="text" role="listbox" data-bs-toggle="dropdown" data-bs-target="#${id}" aria-expanded="false" aria-controls="menu" placeholder="Select an option . . . " />
                <label for="selector-input" class="selector-heading input-label">Select an option . . . </label>
                <button aria-label="selector-refresh-button" role="button" class="selector-button btn btn-light refresh-button">
                    &#8635;
                </button>
                <button role="button" aria-label="selector-cancel-button" class="selector-button btn btn-yellow cancel-button">
                    &#x2715;
                </button>                       
            </div>
            <menu id="${id}" role="dropdown" class="selector-dropdown menu hidden">
                <div class="dropdown-main-container">
                    <div class="dropdown-inner-container">
                        <option disabled class="no-results">No Results . . .</option>
                        <ul class="">
                        </ul>
                    </div>
                </div>
            </menu>
        `;

        // If not live search and no refresh method not provided refresh not needed
        if(!this.options.liveSearch && !this.options.refresh)
        {
            this.containerElement.querySelector('.refresh-button').classList.add('hidden');
        }

        this.containerElement.querySelector('.cancel-button').addEventListener('click', () =>
        {
            this.cancel();
        });

        this.containerElement.querySelector('.refresh-button').addEventListener('click', () =>
        {
            this.refresh();
        });

        this.selectorInput = this.containerElement.querySelector('.selector-input');

        this.selectorMenu = this.containerElement.querySelector('.selector-dropdown');

        this.selectorInput.addEventListener('click', () =>
        {
            this.selectorMenu.classList.remove('hidden');

            // if (!this.once || !this._value)
            // {
            //     this.refresh(true);
            //     this.once = true;
            // } else
            // {
            //     this.filterFunction(true);
            // }
        });

        this.selectorInput.addEventListener('focus', () =>
        {
            this.selectorMenu.classList.remove('hidden');
            
            // if (!this.once || !this._value)
            // {
            //     this.refresh(true);
            //     this.once = true;
            // } else
            // {
            //     this.filterFunction(true);
            // }
        });

        // close selectorMenu if clicked off
        document.addEventListener('click', (e) =>
        {
            if (e.target !== this.selectorInput) 
            {
                this.selectorMenu.classList.add('hidden');
            }
        });

        this.isListEmpty();
    }

    addChangeListener(func)
    {
        this.changeEvents.push(func);
    }

    onChange()
    {
        this.changeEvents.forEach((func) =>
        {
            func();
        });
    }

    cancel()
    {
        let changed = false;
        if(this.value())
        {
            changed = true;
        }

        this.selectorInput.value = '';
        this.deselectItems();
        this.isListEmpty();

        if(changed)
        {
            this.onChange();
        }
    }

    refresh()
    {
        if(this.options.refresh)
        {
            this.options.refresh().then((res) =>
            {
                this.cancel();
                this.clearItems();

                if(typeof res.jsonData === 'object' && res.jsonData.then)
                {
                    res.jsonData
                    .then((jsonData) =>
                    {
                        this.addItems(jsonData, res.keysArr);
                    });
                }
                else
                {
                    this.addItems(res.jsonData, res.keysArr);
                }
            })
        }
    }

    isListEmpty()
    {
        let numResults = Array.from(this.selectorMenu.querySelectorAll('li:not(.hidden)')).length;

        if (!(this.selectorInput.value != null && this.selectorInput.value.length >= this.options.minSearchLen) && numResults <= 0)
        {
            // No items in list, search value present, no results found
            this.selectorMenu.querySelector('.no-results').classList.remove('hidden');
            this.selectorMenu.querySelector('.no-results').innerHTML = 'No results . . .';
        }
        else if (numResults > 0)
        {
            // items in list, search value not present, results present
            this.selectorMenu.querySelector('.no-results').classList.add('hidden');
            this.selectorMenu.querySelector('.no-results').innerHTML = 'Type to search . . .';
        }
        else
        {
            // items in list, search value could be present, results found
            this.selectorMenu.querySelector('.no-results').classList.remove('hidden');
            this.selectorMenu.querySelector('.no-results').innerHTML = '';
        }
    }

    addItem(value, textValue, listValue)
    {
        let li = document.createElement('li');
        li.setAttribute('value', value);
        li.innerHTML = listValue;
        li.setAttribute('textValue', textValue);

        // Value changed
        li.addEventListener('click', () =>
        {
            //console.log(li, li.getAttribute('value'));
            this.onChange();

            this.selectorInput.value = li.getAttribute('textValue');

            this.deselectItems();

            li.setAttribute('selected', true);
        });

        this.containerElement.querySelector('ul').appendChild(li);
        this.isListEmpty();
    }

    addItems(jsonData, keysArr)
    {
        if(typeof jsonData !== 'undefined' && jsonData && Array.isArray(jsonData) && jsonData.length <= 0)
        {
            console.log('clsSelector: Array is empty');
            return;
        }
        else if(typeof jsonData === 'undefined' || !jsonData || !Array.isArray(jsonData))
        {
            console.log('clsSelector: jsonData is not array');
            return;
        }

        //******** Determine scenario and parse Data ********

        // Simple array of values no keys provided
        if((typeof keysArr === 'undefined' || !keysArr) && Array.isArray(jsonData) && typeof jsonData[0] !== 'object')
        {
            jsonData.forEach((val) =>
            {
                this.addItem(val, val, val);
            });
        }
        // Multi dimensional array but no keys passed in
        else if(typeof keysArr === 'undefined' || !keysArr || typeof keysArr !== 'object' || !Array.isArray(keysArr) || (Array.isArray(keysArr) && keysArr.length <=0) )
        {
            /**
            * Assumes a pattern of ```value, textValue, listValue```
            * Then defaults to ```value, textValue``` or ```value, textValue, textValue```
            * Finally ```value``` or ```value, value, value```
            **/

            //Default to first 3
            jsonData.forEach((val) =>
            {
                let val1, val2, val3;

                // First value
                if(typeof Object.keys(jsonData[0])[0] !== 'undefined')
                {
                    val1 = val[Object.keys(jsonData[0])[0]];
                }

                // Second value
                if(typeof Object.keys(jsonData[0])[1] !== 'undefined')
                {
                    val2 = val[Object.keys(jsonData[0])[1]];
                }
                else
                {
                    // default to first value
                    val2 = val1;
                }

                // Third value
                if(typeof Object.keys(jsonData[0])[2] !== 'undefined')
                {
                    val3 = val[Object.keys(jsonData[0])[2]];
                }
                else
                {
                    // default to second value assumes pattern addItem(value, textValue, listValue)
                    val3 = val2;
                }

                this.addItem(val1, val2, val3);
            });
        }
        // Array of objects multi dimensional 
        else
        {
            if(keysArr.length !== 3)
            {
                console.error('clsSelector - addItems: key array not valid');
                return;
            }

            if(typeof jsonData[0][keysArr[0]] === 'undefined' || typeof jsonData[0][keysArr[1]] === 'undefined' || (typeof [keysArr[2]] !== 'object' && typeof jsonData[0][keysArr[2]] === 'undefined' ))
            {
                console.error('clsSelector - addItems: key array not valid');
                return;
            }
            else
            {
                jsonData.forEach((item) =>
                {
                    if(typeof keysArr[2] === 'object' && Array.isArray(keysArr[2]))
                    {
                        //Handle stacked mapping of display value

                        let displayValue = ``;
                        let fieldCtr = 0;
                        keysArr[2].forEach((field) =>
                        {
                            if(fieldCtr === 0)
                            {
                                displayValue = `${item[field]}
                                `;
                            }
                            else if(fieldCtr < keysArr[2].length)
                            {
                                displayValue += `${item[field]}
                                `;
                            }
                            else
                            {
                                displayValue += `${item[field]}`
                            }

                            fieldCtr++;
                        });

                        this.addItem(item[keysArr[0]], item[keysArr[1]], displayValue);
                    }
                    else
                    {
                        //value, textValue, listValue
                        this.addItem(item[keysArr[0]], item[keysArr[1]], item[keysArr[2]]);
                    }
                });
            }
        }
    }

    deselectItems()
    {
        Array.from(this.containerElement.querySelector('ul').querySelectorAll('li')).forEach((li) =>
        {
            li.setAttribute('selected', false);
        });
    }

    clearItems()
    {
        this.deselectItems();
        this.containerElement.querySelector('ul').innerHTML = '';
    }

    value()
    {
        let val = null;
        Array.from(this.containerElement.querySelector('ul').querySelectorAll('li')).filter((li) =>
        {
            if(li.getAttribute('selected') === 'true')
            {
                val = li.getAttribute('value');
            }
        });

        return val;
    }
}