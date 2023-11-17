class notes extends WindowTemplate
{
    constructor()
    {
        super(); // to inherit from base class
        this.id = this.randomWindowID();

        this.container = document.createElement('div');
        this.container.classList.add('d-flex', 'bg-red');

        let appContent = 
        `
        <div class="">
            <h1>FUBAR</h1>
            <div class="mt-5 notesForm">
                <div class="flex-form formTop mt-5">
                        
                </div>

                <div class="flex-form formMiddle mt-5"> 
                        
                </div>

                <div class="flex-form formMeta mt-5">
                        
                </div>
            </div>
        </div>
        `;

        this.container.innerHTML = appContent;

        this.formObject = clsNotes;

        // windows options, REQUIRED
        this.initOptions = {
            body: this.container, //should always be the container you created above
            inject: [], //String Array of js files, DB will add any additional to this
            roles: [], //String Array of Roles, OVERWRITTEN BY DB, pipe delimited "|"
            snapping: true, // makes window snap to grid positions
            draggable: true,
            shadows: true,
            resizeable: false, // enables/disables dragging corners of window to resize (not grid positions)
            position: ["middle", "middle"],
            locked: true, //Have to pick a grid - snap locked to grid (does NOT stop user from dragging)
            id: this.id, //in template base class, should always be a random ID to prevent overlaps
            Icon: "pfi-notes",
            IconColor: '#21dbd2',
            IconBkgColor: "black",
            title: "Auto Form",
            minimize: true,
            maximize: true
        };
    }

    // THIS METHOD REQUIRED TO MAKE YOUR APP FUNCTION
    async initialize()
    {

        this.autoForm();

    }

    autoForm()
    {
        /*
        options = {
            container: document.querySelector('.container'),
            dataStructureObject: {},
            jsonObject: {},
            fieldOptions: {
                'field1': {
                    targetDiv: document.querySelector('.formDiv'), //Target element to place html element
                    readOnly: false, //Sets ReadOnly attribute
                    required: false, //Required field
                    ignore: false, //Do not create field exclude
                    min: 0, //Minimum value number/range, min date
                    max: 10, //Maximum value number/range, max date
                    value: 1, //Default value if not already set | bool if checkbox or radio
                    roles: ['Admin', 'Staff'], //Only these roles can edit else ReadOnly
                    changeEvent: () => { }, //Change event for field
                    validation: () => { }, //Validation function
                    type: '', //hidden, text, number, radio, checkbox, datepicker, date display, selector
                    valueOptions: [], //Either array or datastructure object for selector, drag/drop, datalist
                    order: 0, //Order option or order provided in fieldOptions
                    //Start and End DatePickers are usually one datepicker (future one json object)
                }
            },
            formTop: document.querySelector('.formTop'),
            formMiddle: document.querySelector('.formMiddle'),
            formMeta: document.querySelector('.formMeta')
        };
        */
        let form = new clsAutoForm(
            {
                container: this.container.querySelector('.notesForm'),
                dataStructureObject: new this.formObject(),
                fieldOptions: {}
            }
        );

        form.createForm();

        
    }
}

//add to windows scope - REQUIRED
GlobalWindowManager.AppsManager.addClass({ "notes": notes });