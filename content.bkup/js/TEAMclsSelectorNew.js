class clsSelectorNew
{
    /**
     * options.data: can be
     *  - null            - nothing added automatically
     *  - url string      - data populated from special path
     *  - object          - {url: '/T3/whatever', method: 'GET(default)/POST', data { opt: val, opt2: val2} }
     *  - class           - gets all active instances of this class
     *  - object instance - gets all matches of this object using Get(true) method
     *   can be
     *  - false  - staticlist, default
     *  - true   - do universal search no extra options
     *  - object - options object for universal search (see base class for further details)
    */
    constructor(options)
    {

        if (typeof options === 'undefined')
        {
            console.error('options must be defined - clsSelector');
        }

        this.options = options;

        if (typeof this.options.containerElement === 'undefined')
        {
            console.error('containerElement must be defined - clsSelector');
        }

        if (typeof this.options.placeHolder !== 'undefined')
        {
            this.options.placeholder = this.options.placeHolder;
        }

        if (typeof this.options.placeholder === 'undefined')
        {
            this.options.placeholder = 'Type to Search';
        }

        this.containerElement = this.options.containerElement;

        this.timeout; //Keyup timer
        this._value;

        this.options.onChange = this.options.onChange || function () { };

        this.loadImmediately = this.options.loadImmediately;

        if (!this.options.resultDataArray)
        {
            this.options.resultData = this.options.resultData || function (result) { return result; };
            this.options.resultDataArray = function (searchResults)
            {
                let results = [];
                if (searchResults && searchResults.length) searchResults.forEach((searchResult) => results.push(this.options.resultData(searchResult)));
                return results;
            }.bind(this);
        }

        this.options.minSearchLen = this.options.minSearchLen || 3;

        this.onChangeMuted = this.options.onChangeMuted;

        this.init();

    }

    init()
    {
        let id = this.randomDataListID();

        let template = `
                <div class="w-full block selector-container py-1">
                    <div class="input-group">
                        <input class="menu-input peer" type="text" role="listbox" data-bs-toggle="dropdown" data-bs-target="#${id}" aria-expanded="false" aria-controls="menu" placeholder="Select an option . . . " />
                        <label for="menu-input" class="selector-heading input-label">Select an option . . . </label>
                        <button aria-label="selector-refresh-button" role="button"
                        class="selector-button btn btn-light refresh-button">
                            &#8635;
                        </button>
                        <button role="button" aria-label="selector-cancel-button"
                        class="selector-button btn btn-yellow cancel-button">
                            &#x2715;
                        </button>                       
                    </div>
                    <menu id="${id}" role="dropdown" class="min-w-full min-h-full menu hidden border-0">
                        <div class="relative">
                            <div class="absolute top-2 ring-2 ring-gold min-w-full rounded-md overflow-hidden z-9000">
                                <option disabled class="min-w-full no-results p-2 bg-white z-9000">No Results . . .</option>
                                <ul class="min-w-full max-h-96 focus:outline-none overflow-auto z-9000"></ul>
                            </div>
                        </div>
                    </menu>
                </div>
        `

        let context = this;
        this.containerElement.innerHTML = template;
        this.containerElement.style.minWidth = 'max-content';
        this.label = this.containerElement.querySelector('.selector-heading');
        this.input = this.containerElement.querySelector('.menu-input');
        this.menu = this.containerElement.querySelector('.menu');
        this.refreshBtn = this.containerElement.querySelector('.refresh-button');
        this.cancelBtn = this.containerElement.querySelector('.cancel-button');
        this.input.placeholder = this.options.placeholder;
        if (this.options.universalSearch == 'false')
        {
            console.log('poot');
            context.refreshBtn.classList.add('hidden');
        }

        if (typeof this.options.label !== 'undefined')
        {
            this.label.innerHTML = this.options.label;
        }

        this.refreshBtn.addEventListener('click', () =>
        {
            this.refresh(true);
        });

        this.cancelBtn.addEventListener('click', () =>
        {
            this.cancel();
        });

        this.input.addEventListener('keyup', (e) =>
        {
            this.searchKeyup(e);
        });
        this.once = false;

        this.input.addEventListener('click', () =>
        {
            //GlobalWindowManager.loadingSpinner.show();
            this.menu.classList.remove('hidden');
            if (!this.once || !this._value)
            {
                this.refresh(true);
                this.once = true;
            } else
            {
                this.filterFunction(true);
            }
        });
        this.input.addEventListener('focus', () =>
        {
            //GlobalWindowManager.loadingSpinner.show();
            this.menu.classList.remove('hidden');
            if (!this.once || !this._value)
            {
                this.refresh(true);
                this.once = true;
            } else
            {
                this.filterFunction(true);
            }
        });
        // close selector menu if open and input was not clicked
        document.addEventListener('click', (e) =>
        {
            if (e.target !== this.input) this.menu.classList.add('hidden');
        });
        // close selector menu if open and input was not clicked
        document.addEventListener('keyup', (e) =>
        {
            if (e.key === "Tab")
            {
                if (this.contains(this.containerElement, e.target)) this.menu.classList.remove('hidden');
            }
            else if (e.target.getAttribute('text-value'))
            {
                if (this.contains(this.containerElement, e.target))
                {
                    this.menu.classList.add('hidden');
                    this.value(e.target.value);
                    this.filterFunction();
                }
            }
            else if (e.target !== this.input)
            {
                this.menu.classList.add('hidden');
            } 
        });
        //FOR DELETION
        //document.addEventListener("readystatechange", (event) =>
        //{
        //    if (event.target.readyState === "complete")
        //    {
        //        setTimeout(loadBootStrap, 500);
        //    }
        //});

        //populate with data for the first time
        if (this.loadImmediately)
        {
            this.refresh(true);
        }
    }
    contains(parent, child)
    {
            return parent !== child && parent.contains(child);
    }
    searchKeyup(e)
    {
        //'Delete', 'Backspace',
        let ignoreKeysArr = ['Escape', 'Shift', 'Home', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Control', 'Alt', 'Tab'];
        let removeKeysArr = [':', ';', '-', '_', '+', '*', '%']; //',', '.'

        let validKey = true;
        if (typeof e.key === 'undefined')
        {
            validKey = false;
        }
        if (ignoreKeysArr.indexOf(e.key) > -1)
        {
            validKey = false;
        }

        if (e.key === "Enter")
        {
            clearTimeout(this.timeout);
            this.refresh(!this.once);
            this.menu.classList.remove('hidden');
            return;
        }

        if (e.key === "Escape")
        {
            this.reset();
            return;
        }

        if (!validKey)
        {
            return;
        }

        clearTimeout(this.timeout);

        this.timeout = setTimeout(() =>
        {
            let ictr = 0;
            while (ictr <= this.input.value.toString().length + 1)
            {
                removeKeysArr.forEach((invalidKey) =>
                {
                    this.input.value = this.input.value.replace(invalidKey, '');
                    this.input.value = this.input.value.replace('  ', ' ');
                });
                ictr++;
            }

            if (validKey)
            {
                this.menu.classList.remove('hidden');
                this.refresh(!this.once);
            }
        }, 500);
    }

    _fromURL(options)
    {
        let fetchOptions = {
            method: options.data.method || 'GET',
            body: JSON.stringify(this.options.data.data),
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization': localStorage.getItem('token')
            }
        };
        let url = options.url || options.data.url;
        if (!url) throw "This selector was supplied with an invalid url: " + url;
        return fetch(url, fetchOptions);
    }

    /**
     * Reset selector
     * Developer needs to assign default values after reset
    */
    reset()
    {
        let changed = (this._value) ? true : false;
        this.refresh(true);
        this.cancel(changed);
    }

    clear() {
        let changed = (this._value) ? true : false;
        this.clearResults();//eliminate all the unnecessary calls to get basedata when in fact I just want to clear everything.
        this.muteOnChange(true);//for some reason, onchange causes error for me if value is empty on reset.
        this.cancel(changed);
        this.muteOnChange(false);
    }

    /**
     * Clears results from list
    */
    clearResults()
    {
        let options = this.menu.querySelectorAll('ul > li');
        for (var i = 0; i < options.length; i++)
        {
            options[i].remove();
        }
        this.isListEmpty();
    }

    /**
     * Trigger the onchange event
    */
    triggerChange()
    {
        if (!this.onChangeMuted)
        {
            this.options.onChange();
        }
    }

    /**
     * Mute the onchange event for the selector
     * @param {boolean} bit mute or unmute
     */
    muteOnChange(bit)
    {
        this.onChangeMuted = bit;
    }

    async refresh(hard = false)
    {
            if (!this.options.universalSearch)
            {
                if (hard && this.options.data)
                {
                    this.clearResults();
                    let results = [];
                    if (this.options.data && (!this.options.data[0] || this.options.data[0].value === "undefined"))
                    {
                        switch (this.options.data.constructor.name)
                        {
                            case 'Object': //url with data
                                results = await this._fromURL(this.options).then(async (response) =>
                                {
                                    return await response.json();
                                }).catch(e => console.error(e));
                                break;
                            case 'String': //url
                                this.options.data = { url: this.options.data, data: {} };
                                results = await this._fromURL(this.options).then(async (response) =>
                                {
                                    return await response.json();
                                }).catch(e => console.error(e));
                                break;
                            case 'Function': //class
                                results = new this.options.data().Get(true);
                                break;
                            default:
                                results = this.options.data.Get(true);
                        }
                    } else
                    {
                        results = this.options.data;
                    }
                    //console.log(results, "returned from selector.reset(true)")
                    results = this.options.resultDataArray(results);
                    results.forEach(result => this.addItem(result.value, result.textValue, result.displayValue));
                    this.results = results;
                }
                this.filterFunction();
            } else //universal search
            {
                if (this.input.value.length >= this.options.minSearchLen && this.options.data)
                {
                    let TEAMSearchOptions = (this.options.universalSearch.constructor.name == 'Boolean') ? {} : this.options.universalSearch;
                    TEAMSearchOptions.async = true;
                    await this.options.data.TEAMSearch(this.input.value.toString(), TEAMSearchOptions).then(function (results)
                    {
                        this.clearResults();
                        results = this.options.resultDataArray(results);
                        results.forEach(result => this.addItem(result.value, result.textValue, result.displayValue));
                        this.results = results;
                        this.filterFunction(); //shame we need this after a universal search, maybe I should make an "and" option vs an "or" ... but I do see the purpose of sort then filter...
                    }.bind(this));
                } else
                {
                    this.isListEmpty();
                }
            }
            GlobalWindowManager.loadingSpinner.hide();
    }

    cancel(changed=false)
    {
        if (!changed)
        {
            changed = (this._value) ? true : false;
        }
        this._value = null;
        this.input.value = '';
        this.filterFunction();
        if (changed)
        {
            this.triggerChange();
        }
    }

    addItem(value, textValue, displayValue)
    {
        if (!displayValue && textValue)
        {
            displayValue = textValue;
        }

        if (displayValue && !textValue)
        {
            textValue = displayValue.replace(/<[^>]*>?/gm, ' ');
        }

        if (!displayValue && !textValue && value)
        {
            textValue = value;
            displayValue = value;
        }

        if (!value || !value.toString().length > 0)
        {
            console.log('Item value not set');
            return;
        }

        let li = document.createElement('li');
        li.setAttribute('aria-role', 'listitem');
        //li.classList.add('z-9000', 'relative');
        li.setAttribute('value', value); //value
        li.setAttribute('text-value', textValue); //text value
        li.innerHTML = displayValue; //display value
        li.addEventListener('click', (e) =>
        {
            this._value = value;
            this._textValue = textValue;
            this._displayValue = displayValue;
            this.input.value = textValue;
            let ev = document.createEvent('Event');
            ev.initEvent('change', true, false);
            this.input.dispatchEvent(ev);
            this.filterFunction();
            this.triggerChange();
            this.menu.classList.add('hidden');
        });
        this.menu.querySelector('ul').appendChild(li);

        this.isListEmpty(); // now "checkResults" ???? maybe
    }
    displayValue()
    {
        return this._displayValue;
    }
    textValue()
    {
        return this._textValue;
    }
    value(val)
    {

        if (typeof val !== 'undefined' && val !== null)
        {
            val = val + '';
        }
        if (val && this._value !== val) // Has a value & current value is not already equal to value
        {
                this.refresh(true);
                //Check value against existing items in list;
                let listItems = Array.from(this.menu.querySelectorAll('li'));

                let selectedItem;
                //if (this.options.universalSearch && Object.getPrototypeOf(this) === clsSelectorNew.prototype)
                //{
                //    GlobalWindowManager.warn('Manual set value error! See console.');
                //    console.warn('For selectors using universal search, value() must be overloaded! (see clsSelectorPerson for an example).');
                //}

                listItems.every((listItem) =>
                {
                    if (listItem.getAttribute('value') === val)
                    {
                        selectedItem = listItem;
                        return false; //breaks loop
                    }
                    return true;
                });

                if (selectedItem)
                {
                    this._value = selectedItem.getAttribute('value');
                    this.input.value = selectedItem.getAttribute('text-value');
                    this.filterFunction();
                }
                else
                {
                    console.log('value not found ...', val)
                    //Value not found in list
                }
                this.triggerChange();
        }
        else
        {
            return this._value;
        }
    }

    isListEmpty()
    {
        let numResults = this.menu.querySelectorAll('li:not(.hidden)').length;

        if (this.options.universalSearch && !(this.input.value != null && this.input.value.length >= this.options.minSearchLen) && numResults <= 0)
        {
            this.menu.querySelector('.no-results').classList.remove('hidden');
            this.menu.querySelector('.no-results').innerHTML = 'Type to search . . .';
        }
        else if (numResults <= 0)
        {
            this.menu.querySelector('.no-results').classList.remove('hidden');
            this.menu.querySelector('.no-results').innerHTML = 'No results . . .';
        }
        else
        {
            this.menu.querySelector('.no-results').classList.add('hidden');
        }
    }

    filterFunction(showAll = false)
    {
        //Filter existing items in list

        let listItems = Array.from(this.menu.querySelectorAll('li'));
        let filter = this.input.value.toString().toUpperCase();
        listItems.forEach(li => li.setAttribute('tabindex', 0));
        if ((!filter || !filter.length || filter.length < this.options.minSearchLen) || showAll)
        {
            // SHOW EVERYTHING
            listItems.forEach(listItem => listItem.removeClass('hidden'));
        } else
        {
            // IT DEPENDS...
            listItems.forEach(listItem =>
            {
                let txtValue = listItem.getAttribute('text-value');
                let filterArr = filter.split(' ');
                if (filterArr.every(filt => (txtValue.toUpperCase().indexOf(filt) > -1)))
                {
                    listItem.removeClass('hidden');
                } else
                {
                    listItem.addClass('hidden');
                }
            });
        }

        this.isListEmpty();
    }

    enable()
    {
        this.input.removeAttribute('disabled');
        this.refreshBtn.removeAttribute('disabled');
        this.cancelBtn.removeAttribute('disabled');
    }

    disable()
    {
        this.input.setAttribute('disabled', true);
        this.refreshBtn.setAttribute('disabled', true);
        this.cancelBtn.setAttribute('disabled', true);
    }

    hide()
    {
        this.containerElement.querySelector('.selector-container').classList.add('hidden');
        this.containerElement.querySelector('.selector-container').classList.remove('inline-flex');
    }
    show()
    {
        this.containerElement.querySelector('.selector-container').classList.remove('hidden');
        this.containerElement.querySelector('.selector-container').classList.add('inline-flex');
    }
    randomDataListID()
    {
        let random = Math.randomIntBetween(1, 999);
        return 'selector' + '' + Date.now() + '' + random;
    }
}
