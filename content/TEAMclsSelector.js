/**
* Creates custom TEAM Selector object class that is either static and/or populated by ajax
* @class
*/
class clsSelector
{
    /**
     * Instantiate with options
     * @param {Object} options Options to initialize the component with
     * @param {Object} options.containerElement The html element object to be transformed into a selector. Takes HTML Element object.
     * @param {Function} options.onChange The onchange function
     * @param {Function} options.resultData The result function to shape the way data is displayed and valued in list
     * @param {Object|String} options.data JSON data for the data table. Can be either object or string.
     * @param {String} options.data.url URL resource
     * @param {String} options.data.method HTTP method for URL resource
     * @param {Object} options.data.data Additional data for URL resource
     */

    constructor(options)
    {
        if (!options) //!options.onChange && !options.url &&
        {
            throw 'Options must be defined: TEAMclsSelector.js';
        }

        this.textbox; //Input text box
        this.datalist; //List of options
        this.refreshbtn; //Refresh
        this.cancelbtn; //Cancel

        this.originalSearchText = '';

        this.id = this.randomDataListID();

        //Delete References
        //this.results = this.containerElement.querySelector('.results');

        /**
        * The options javascript object
        * @type {Object}
        */
        this.options = options;

        if (typeof options.placeHolder !== 'undefined')
        {
            this.options.placeholder = options.placeHolder || 'Type here to search....';
        }
        if (typeof options.placeholder !== 'undefined')
        {
            this.options.placeholder = options.placeholder || 'Type here to search....';
        }

        this.data = //Value of selector
        {
            value: '', text: ''
        };

        this.onChange = this.options.onChange || function () { };
        this.onChangeSaved = this.options.onChange;

        if (typeof this.options.searchTextChangedFunction === 'undefined')
        {
            this.options.searchTextChangedFunction = function () { };
        }
        

        this.timeout; //Keyup timer

        if (typeof this.options.minSearchLen !== 'undefined')
        {
            this.options.minSearchLen = this.options.minSearchLen;
        }
        else
        {
            this.options.minSearchLen = 3;
        }

        this.off = false; //Complete progromatic disable

        this.options.blockedWords = this.options.blockedWords || '  '; //Comma delimited

        this.isStaticList = false; //Default to not static

        //Start off as Enabled or disabled
        if (typeof this.options.enabled === 'undefined')
        {
            this.options.enabled = true;
        }

        /**
        * The container of the selector object
        * @type {HTMLElement}
        */
        this.containerElement = this.options.containerElement;
        this.createElement();

        if (!this.options.data)
        {
            this.options.data = {};
        }

        if (!this.options.resultData)
        {
            // if function not passed in then handle here
            // need to assume first 3 keys are list values, if not then 2, if not then 1
            this.options.resultData = function () { };
        }

        //If Ajax defined
        if (this.isAjax())
        {
            this.options.filterRequired = true;
        }
        else
        {
            this.options.filterRequired = false;
        }

        if (typeof this.options.data.data === 'undefined')
        {
            this.options.filterRequired = false;
        }

        //If arguments will be required for ajax
        if (typeof this.options.filterRequired === 'undefined' && this.isAjax())
        {
            this.options.filterRequired = false;
        }

        //this.isStaticList = false; defined above so that first ajax pull is ajax
        if (typeof this.options.isStaticList !== 'undefined')
        {
            this.isStaticList = this.options.isStaticList;
        }
        else if (typeof this.options.isStaticList === 'undefined' && !this.isAjax())
        {
            //If not ajax and isStaticList not defined then it is a static list
            this.options.isStaticList = true;
            this.isStaticList = true;
        }
        else if (typeof this.options.isStaticList === 'undefined' && this.isAjax())
        {
            //If isStaticList not defined and ajax is set then assume not static
            this.options.isStaticList = false;
            this.isStaticList = false;
        }
        else if (typeof this.options.isStaticList === 'undefined')
        {
            //Catch all for option not passed in
            this.options.isStaticList = false;
            this.isStaticList = false;
        }
        else
        {
            this.isStaticList = this.options.isStaticList;
        }

        if (this.isStaticList && !this.isAjax())
        {
            //Handle Static Json Data
            this.handleResultData(this.options.data);
        }

        if (this.isAjax())
        {
            this.getAjaxData();
        }
    }

    /**
     * Creates HTML Elements inside of container on page
     *
     **/
    createElement()
    {
        const template = `
                    <div class="input-group selector">
                        <input class="peer inputbox" list="id" placeholder="Type here to search....">
                        <button class="btn-light refresh" type="button"><i class="fa fa-refresh"></i></button>
                        <button class="btn-yellow cancel" type="button"><i class="fa fa-times"></i></button>
                    </div>
                    <datalist id="id" class="bg-light"></datalist>
                    `;
        //`<!--<option key="volvo">Volvo</option>
        //<option key="volvo2">Volvo2</option>
        //<option key="saab">Saab</option>
        //<option key="mercedes">Mercedes</option>
        //<option key="audi">Audi</option>-->`

        this.containerElement.innerHTML = template;

        this.textbox = this.containerElement.querySelector('.inputbox');
        this.datalist = this.containerElement.querySelector('datalist');

        this.textbox.setAttribute('list', this.id);
        this.datalist.setAttribute('id', this.id);

        this.textbox.placeholder = this.options.placeholder;

        this.textbox.onkeyup = (e) => { this.keyup(e) };

        this.refreshbtn = this.containerElement.querySelector('.refresh');
        this.cancelbtn = this.containerElement.querySelector('.cancel');

        this.refreshbtn.addEventListener('click', () => { this.refresh() });
        this.cancelbtn.addEventListener('click', () => { this.reset() });

        if (!this.options.enabled)
        {
            this.disable();
        }

        //When value is selected
        this.textbox.addEventListener('change', () =>
        {
            if (this.textbox.value.length > 0)
            {
                this.value(this.textbox.value);

                let options = this.datalist.querySelectorAll('option');

                let option = Array.from(options).find((opt) =>
                {
                    if (opt.value === '' + this.textbox.value)
                    {
                        return opt;
                    }
                });

                if (Array.isArray(option))
                {
                    option = option[0];
                }

                if (option)
                {
                    //this.textbox.value = option.text;
                    this.textbox.value = option.getAttribute('textboxText');
                }
                else
                {
                    //No match
                }
            }
        });
    }

    randomDataListID()
    {
        let random = Math.randomIntBetween(1, 999);
        return 'datalist' + random + '' + Date.now();
    }

    /**
     * Keyup event that uses a counter to delay ajax call until user is done typing
    */
    keyup(e)
    {
        let ignoreKeysArr = ['Delete', 'Backspace', 'Escape', 'Shift', 'Home', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Control', 'Alt', ',', '.', ':', ';', '-', '_', '+', '*'];
        let validKey = true;
        if (typeof e.key === 'undefined')
        {
            validKey = false;
        }
        if (ignoreKeysArr.indexOf(e.key) > -1)
        {
            validKey = false;
        }

        //If min search = 0 then allow textbox len to be 0
        //If min search <> 0 and textbox len = 0 then reset
        //Search local only & Search ajax
        //Check to see if search term key exists

        //Set Search to previous value
        let txtBoxText = this.textbox.value;
        ignoreKeysArr.forEach((ignorekey) =>
        {
            if (validKey)
            {
                txtBoxText = txtBoxText.replace(ignorekey, '');
            }
        });
        if (validKey && txtBoxText.length > 0)
        {
            this.originalSearchText = this.textbox.value;
        }

        clearTimeout(this.timeout);

        //this.textbox.value.length < this.options.minSearchLen

        this.timeout = setTimeout(function ()
        {
            //Refill text with previous search if ajax
            if (this.isAjax() && this.isStaticList && this.textbox.value.length <= 0)
            {
                this.textbox.focus();
                //this.textbox.dispatchEvent(new Event('keydown'));
                //this.textbox.dispatchEvent(new Event('click'));
                this.textbox.value = this.originalSearchText;
            }

            if (!this.textbox.value || this.textbox.value.length < 0 || this.textbox.value === 'undefined' || this.textbox.value === null) //input should be empty string at minimum
            {
                this.textbox.value = '';
            }

            if (this.isBlockedWord(this.textbox.value))
            {
                return;
            }

            if (this.textbox.value && this.textbox.value.length >= this.options.minSearchLen)
            {
                //Universal Search
                this.options.searchTextChangedFunction(this.textbox.value);

                //If Search Filter then check search length first
                if (this.options.filterRequired && (this.options.data.data !== null && this.textbox.value.length.length < this.options.minSearchLen))
                {
                    return;
                }

                if (this.options.filterRequired && this.options.data.data !== null && typeof this.options.data !== 'undefined' && typeof this.options.data.data !== 'undefined' && typeof Object.keys(this.options.data.data)[0] !== 'undefined' && Object.keys(this.options.data.data)[0] === 'SearchTerm')
                {
                    this.options.data.data[Object.keys(this.options.data.data)[0]] = this.textbox.value;
                }

                if (!this.isStaticList) // && this.options.minSearchLen > 0)
                {
                    //Execute ajax here
                    this.getAjaxData();
                }
            }
            else if (!this.isStaticList && this.options.minSearchLen > 0)
            {
                this.clearResults();
            }

            this.isListEmpty();

            //else if (this.options.minSearchLen === 0 && !this.isStaticList)
            //{
            //WTF is this for
            //    this.clearResults();
            //}

            //if (this.isStaticList || this.options.minSearchLen === 0) //Static Search
            //{
            //    let items = []; // this.results.querySelectorAll('.item');

            //    //if (this.textbox.value.length <= 0)
            //    //{
            //    //    for (let y = 0; y < items.length; y++)
            //    //    {
            //    //        items[y].classList.remove('d-none');
            //    //    }
            //    //    return;
            //    //}

            //    let searchWords = this.textbox.value.toString().toLowerCase().trim().split(' ');

            //    let notFound = false;
            //    for (let y = 0; y < items.length; y++)
            //    {
            //        let SearchString = items[y].getAttribute('value') + ' ' + items[y].getAttribute('textValue') + ' ' + items[y].innerHTML.toString().replace(/(&nbsp;|<([^>]+)>)/ig, '');
            //        SearchString = SearchString.toString().toLowerCase();

            //        for (let x = 0; x < searchWords.length; x++)
            //        {
            //            let searchWord = searchWords[x];

            //            if (SearchString.indexOf(searchWord) === -1)
            //            {
            //                notFound = true;
            //            }
            //        }

            //        if (notFound)
            //        {
            //            items[y].classList.add('d-none');
            //        }
            //        else
            //        {
            //            items[y].classList.remove('d-none');
            //        }

            //        notFound = false;
            //    }
            //    this.isListEmpty();
            //}
        }.bind(this), 500);
    }

    /**
     * Checks if word equals blocked word to ignore during search
     * @param {String} word the word to check
     * @returns {Boolean} returns if word is blocked
     */
    isBlockedWord(word)
    {
        //Blocked words MIL, CIV, NFG, CTR by default and more can be added by developer

        word = word.toLowerCase().trim();
        //this.options.blockedWords
        let blockedwords = (this.options.blockedWords + 'MIL,CIV,NFG,CTR').toLowerCase().split(',');
        for (var i = 0; i < blockedwords.length; i++)
        {
            let blockedword = blockedwords[i].trim();
            if (blockedword === word)
            {
                return true;
            }
        }
        return false;
    }

    /**
     * Is the selector ajax based
     * @returns {Boolean} returns if method is ajax
    */
    isAjax()
    {
        if (this.options.data && typeof this.options.data.url !== 'undefined')
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    /**
     * Gets ajax data
    */
    getAjaxData()
    {
        if (this.off) //(!this.options.enabled || this.off)
        {
            return;
        }

        if (this.options.minSearchLen !== 0) // && !this.isStaticList)
        {
            this.clearResults();
        }

        //Is selector enabled
        //this.containerElement.querySelector('.disabled').classList.contains('d-none') //t = enabled f = disabled
        //if (!this.containerElement.querySelector('.disabled').classList.contains('d-none'))
        //{
        //    return;
        //}

        //if (this.options.data.data === null)
        //{
        //    return;
        //}

        //If Search Filter then check search length first
        if (this.options.filterRequired && (this.options.data.data !== null && this.options.data.data[Object.keys(this.options.data.data)[0]].length < this.options.minSearchLen))
        {
            return;
        }

        //if (this.options.filterRequired && (typeof this.options.data === 'undefined' || typeof this.options.data.data === 'undefined' || typeof this.options.data.data[Object.keys(this.options.data.data)[0]] === 'undefined' || this.options.data.data[Object.keys(this.options.data.data)[0]].length < this.options.minSearchLen))
        //{
        //    //typeof Object === 'undefined' || typeof Object.keys === 'undefined' ||
        //    return; //If search length is too short or default ajax data is not defined or is too short
        //}

        let resultData;

        if (!this.isAjax())
        {
            return;
        }
        if (!this.isStaticList)
        {
            this.clearResults();
        }

        if (!this.isStaticList && this.options.minSearchLen === 0 && this.options.filterRequired)
        {
            this.clearResults();
        }

        if (!this.options.filterRequired)
        {
            //console.log(this.options.data.data);
        }

        T.ajax({
            auth: true,
            method: this.options.data.method || 'GET',
            url: this.options.data.url,
            data: this.options.data.data,
            success: function (res)
            {
                if (!Array.isArray(res))
                {
                    throw 'AJax Error Occured';
                }

                if (!res.length)
                {
                    //No results
                }

                resultData = res;
            }
        });

        this.isListEmpty();

        this.handleResultData(resultData);
    }

    /**
     * Handles result data. Structures result data for display
     * @param {object} data from ajax filling value, textValue and displayValue
     */
    handleResultData(data)
    {
        this.clearResults();
        if (typeof data === 'undefined' || !data || data === null || data.length <= 0)
        {
            //this.containerElement.classList.add('nosearchresults');  //need explanation //isListEmpty
            return;
        }
        else
        {
            //this.containerElement.classList.remove('nosearchresults');
        }

        for (let i = 0; i < data.length; i++)
        {
            let tempdata = this.options.resultData(data[i]);
            this.addItem(tempdata.value, tempdata.textValue, tempdata.displayValue);
        }
    }

    /**
     * Clears results from list
    */
    clearResults()
    {
        let options = this.datalist.querySelectorAll('option');
        for (var i = 0; i < options.length; i++)
        {
            options[i].remove();
        }
        this.isListEmpty();
    }

    //this.options.enabled

    /**
     * Is the list empty if so change UI to reflect
    */
    isListEmpty()
    {
        let options = this.datalist.querySelectorAll('option');

        let searchLen = 0;

        if (this.options.minSearchLen && this.options.minSearchLen > 0)
        {
            searchLen = this.options.minSearchLen;
        }

        if ((this.options.minSearchLen > 0 && !this.isStaticList) && options.length <= 0 && this.textbox.value.length > searchLen)
        {
            this.textbox.classList.add('no-results');
        }
        else
        {
            this.textbox.classList.remove('no-results');
        }
    }

    /**
     * Add item to list
     * @param {any} value of the item
     * @param {any} textValue of the item
     * @param {any} displayValue of the item
     */
    addItem(value, textValue, displayValue)
    {
        if ((typeof displayValue === 'undefined' || !displayValue || displayValue.length <= 0) && typeof textValue !== 'undefined')
        {
            displayValue = textValue.toString().trim();
        }
        if (typeof textValue === 'undefined' || !textValue || textValue.length <= 0)
        {
            textValue = value.toString().trim();
            displayValue = value.toString().trim();
        }

        let newValue = document.createElement('option');
        newValue.setAttribute('key', value);
        newValue.value = value;
        newValue.innerHTML = displayValue;
        //newValue.text = textValue;
        newValue.setAttribute('textboxText', textValue);

        this.datalist.appendChild(newValue);

        this.isListEmpty();
    }

    /**
     * Remove item from list
     * @param {any} value of the item
     */
    removeItem(value)
    {
        let values = this.datalist.querySelectorAll('option')

        for (let i = 0; i < values.length; i++)
        {
            if (value === values[i].value)
            {
                this.results.removeChild(values[i]);
            }
        }

        this.isListEmpty();
    }

    /**
     * Add data from static array
     * [{value, textValue, displayValue}] displayValue optional
     * ToDo:// deal with 1D 2D & 3D arrays
     * @param {Array} dataArr [{value, textValue, displayValue}]
     */
    addDataFromArray(dataArr)
    {
        for (var i = 0; i < dataArr.length; i++)
        {
            if (dataArr[i].displayValue)
            {
                this.addItem(dataArr[i].value, dataArr[i].text, dataArr[i].displayValue);
            }
            else
            {
                this.addItem(dataArr[i].value, dataArr[i].text, dataArr[i].text);
            }

        }
        this.isListEmpty();
    }

    /**
     * Set or get value of selector
     * @param {any} val Value to set
     * @returns {any} value if not setting value
     */
    value(val)
    {
        if (typeof val !== 'undefined' && val !== null)
        {
            val = val + '';
        }

        if (val && this.data.value !== val) // Has a value & current value is not already equal to value
        {
            //Set Value - Get single value
            if (this.options.minSearchLen > 0)
            {
                let tmp = this.options.minSearchLen; //capture min len
                this.options.minSearchLen = 0; //Temp set to zero to grab results
                //this.ajaxInit(this.ajax.url, this.ajax.type, this.ajax.data, this.ajax.resultData, this.ajax.errorData);
                this.options.minSearchLen = tmp; //reset min len
            }

            let ictr = 0;
            let options = this.datalist.querySelectorAll('option');
            for (let i = 0; i < options.length; i++)
            {
                //if (val === this.datalist.querySelectorAll('option')[i].getAttribute('value'))
                if (val === options[i].value)
                {
                    ictr++; //Value found
                    //this.results.querySelectorAll('.item')[i].classList.add('selected');
                    //this.textbox.value = options[i].text;
                    this.textbox.value = options[i].getAttribute('textboxText');
                }
            }
            if (ictr > 0)
            {
                this.data.value = val;
                this.data.text = this.textbox.value;
                this.triggerChange();
            }
            else
            {
                //throw 'Error value does not exist in selector';
                console.log('clsSelector.js - Error value does not exist in selector. Line ~563');
            }
        }
        else
        {
            return this.data.value;
        }
    }

    /**
     * Trigger the onchange event
    */
    triggerChange()
    {
        if (!this.off)
        {
            this.onChange();
        }
    }

    /**
     * Mute the onchange event for the selector
     * @param {boolean} bit mute or unmute
     */
    muteOnChange(bit)
    {
        if (bit)
        {
            this.onChange = function () { };
        }
        else
        {
            this.onChange = this.onChangeSaved;
        }
    }

    /**
     * Reset selector
     * Developer needs to assign default values after reset
    */
    reset()
    {
        let changed = 1; //Did the value change?

        // If value not set then don't fire off triggerChange
        if (!this.data.value || this.data.value === null || this.data.value === "")
        {
            changed = 0;
        }

        if (this.options.data.url && this.options.minSearchLen !== 0 && !this.isStaticList) //If ajax and minsearch length is not 0 then empty list
        {
            this.clearResults();
        }

        this.containerElement.classList.remove('nosearchresults');

        this.textbox.placeholder = this.options.placeholder;

        this.textbox.value = '';
        this.data.value = '';
        this.data.text = '';

        if (this.options.data.url && !this.isStaticList)
        {
            /**
             * Developer needs to assign default values after reset.
             * or
             * We need to not do this and the developer needs to clear known values when the selector is cleared.
            */
            if (this.options.filterRequired)
            {
                this.options.data.data[Object.keys(this.options.data.data)[0]] = '';
            }
            const keys = Object.keys(this.options.data.data);
            for (var i = 0; i < keys.length; i++)
            {
                //if (typeof this.options.data.data[keys[i]] === 'boolean')
                //{
                //    this.options.data.data[keys[i]] = false;
                //}
                //else if (typeof this.options.data.data[keys[i]] === 'string')
                //{
                //    this.options.data.data[keys[i]] = '';
                //}
                //else if (typeof this.options.data.data[keys[i]] === 'number')
                //{
                //    this.options.data.data[keys[i]] = 0;
                //}
                //else if (typeof this.options.data.data[keys[i]] === 'object' && !this.options.data.data[keys[i]]) //null in js is an object
                //{
                //    try
                //    {
                //        if (typeof this.options.data.data[keys[i]].getMonth() === 'function')
                //        {
                //            //this.options.data.data[keys[i]] = new Date();
                //        }
                //    } catch (e)
                //    {
                //        if (Array.isArray(this.options.data.data[keys[i]]))
                //        {
                //            //this.options.data.data[keys[i]] = [];
                //        }
                //        else
                //        {
                //            //this.options.data.data[keys[i]] = {};
                //        }
                //    }
                //}
                //else if (typeof this.options.data.data[keys[i]] === 'function')
                //{
                //    //this.options.data.data[keys[i]] = function () {};
                //}
                //else if (typeof this.options.data.data[keys[i]] === 'symbol')
                //{
                //    //this.options.data.data[keys[i]];
                //}
                //else if (typeof this.options.data.data[keys[i]] === 'undefined')
                //{
                //    //this.options.data.data[keys[i]];
                //}
                //else
                //{
                //    this.options.data.data[keys[i]] = null;
                //}
            }

            this.originalSearchText = '';
            this.triggerChange();


            this.clearResults();
            this.getAjaxData();
        }

        this.isListEmpty();

        if (changed > 0)
        {
            this.triggerChange();
        }
    }

    /**
     * Refresh ajax/static data
     */
    refresh()
    {
        if (!this.isStaticList)
        {
            //this.reset();
            this.clearResults();
        }

        if (this.options.data.url)
        {
            //this.reset();
            this.clearResults();
            this.getAjaxData();
        }

        this.isListEmpty();
    }

    /**
     * Is the selector ajax based
     * @returns {Boolean} returns if method is ajax
    */
    isAjax()
    {
        if (this.options.data && typeof this.options.data.url !== 'undefined')
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    enable()
    {
        if (!this.off)
        {
            this.options.enabled = true;
            this.textbox.removeAttribute('disabled');
            this.refreshbtn.removeAttribute('disabled');
            this.cancelbtn.removeAttribute('disabled');
            this.refresh();
        }
    }

    disable()
    {
        this.options.enabled = false;
        this.textbox.setAttribute('disabled', true);
        this.refreshbtn.setAttribute('disabled', true);
        this.cancelbtn.setAttribute('disabled', true);
    }

    hide()
    {
        this.containerElement.classList.add('d-none');
    }

    show()
    {
        if (!this.off)
        {
            this.containerElement.classList.remove('d-none');
        }
    }

    //Complete progromatic disable
    turnOff()
    {
        this.off = true; //Complete disable
        this.hide();
        this.disable();
    }

    turnOn()
    {
        this.off = false;
        this.show();
        this.enable();
    }
}