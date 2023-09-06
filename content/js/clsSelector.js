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
            <div class="input-group">
                <input class="selector-input peer" type="text" role="listbox" data-bs-toggle="dropdown" data-bs-target="#${id}" aria-expanded="false" aria-controls="menu" placeholder="Select an option . . . " />
                <label for="selector-input" class="selector-heading input-label">Select an option . . . </label>
                <button aria-label="selector-refresh-button" role="button" class="selector-button btn btn-light refresh-button">
                    &#8635;
                </button>
                <button role="button" aria-label="selector-cancel-button" class="selector-button btn btn-yellow cancel-button">
                    &#x2715;
                </button>                       
            </div>
            <menu id="${id}" role="dropdown" class="min-w-full min-h-full menu hidden border-0">
                <div class="relative">
                    <div class="absolute top-2 ring-2 ring-gold min-w-full rounded-md overflow-hidden z-9000">
                        <option disabled class="min-w-full no-results p-2 bg-white z-9000">No Results . . .</option>
                        <ul class="min-w-full max-h-96 focus:outline-none overflow-auto z-9000">
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
            this.cancelBtn();
        });

        this.containerElement.querySelector('.refresh-button').addEventListener('click', () =>
        {
            this.refreshBtn();
        });

        this.selectorInput = this.containerElement.querySelector('.selector-input');

        this.selectorMenu = this.containerElement.querySelector('.menu');

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