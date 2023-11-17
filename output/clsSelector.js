/**************************************
clsSelector: v3.0.0
TailWind: v^3.3.5
**************************************/

class clsSelector extends clsBaseClass
{
    constructor(options)
    {
        super();

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

        this.options.minSearchLen = 0;

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
                            <li>Blah</li>
                            <li>Fubar</li>
                            <li>Blah</li>
                            <li>Fubar</li>
                            <li>Blah</li>
                            <li>Fubar</li>
                        </ul>
                    </div>
                </div>
            </menu>
        `;

        this.containerElement.querySelector('.cancel-button').addEventListener('click', () =>
        {
            console.log('cancel');
            this.cancelBtn();
        });

        this.containerElement.querySelector('.refresh-button').addEventListener('click', () =>
        {
            console.log('refresh');
            this.refreshBtn();
        });

        this.selectorInput = this.containerElement.querySelector('.selector-input');

        this.selectorMenu = this.containerElement.querySelector('.selector-dropdown');

        this.selectorInput.addEventListener('click', () =>
        {
            console.log('selectorInput');
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

    cancelBtn()
    {
        this.selectorInput.value = '';
    }

    refreshBtn()
    {

    }

    isListEmpty()
    {
        let numResults = this.selectorMenu.querySelectorAll('li:not(.hidden)').length;

        //this.options.universalSearch &&
        if (!(this.selectorInput.value != null && this.selectorInput.value.length >= this.options.minSearchLen) && numResults <= 0)
        {
            this.selectorMenu.querySelector('.no-results').classList.remove('hidden');
            this.selectorMenu.querySelector('.no-results').innerHTML = 'Type to search . . .';

            console.log(1)
        }
        else if (numResults >= 0)
        {
            this.selectorMenu.querySelector('.no-results').classList.remove('hidden');
            this.selectorMenu.querySelector('.no-results').innerHTML = 'No results . . .';

            console.log(2)
        }
        else
        {
            this.selectorMenu.querySelector('.no-results').classList.add('hidden');

            console.log(3)
        }
    }
}