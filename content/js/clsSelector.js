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

        this.containerElement = this.options.containerElement;

        this.init();
    }

    init()
    {
        let id = this.randomID();

        this.containerElement.classList.add('clsSelector');        

        this.containerElement.innerHTML = `
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
        `;
    }
}