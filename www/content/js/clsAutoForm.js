/**
 * Project defined on GitHub https://github.com/orgs/PEC-Developement-Team/projects/1/views/1
 */

/**
 * Auto creates forms from JSON Data Structure Onjects and JSON
 * @class
 */
class clsAutoForm
{
    /**
    * Instantiate with options
    * @param {Object} options Options to initialize the component with
    * @param {HTMLElement} options.container The target element.
    * @param {Object} options.dataStructureObject Object from DataStructure either options.dataStructureObject or options.jsonObject have to be set
    * @param {Object} options.jsonObject Object from a Json Structure either options.dataStructureObject or options.jsonObject have to be set (not implemented yet)
    * @param {Object} options.fieldOptions Options for fields
    * @param {HTMLElement} options.fieldOptions.targetDiv Target container element to place html element
    * @param {boolean} options.fieldOptions.readOnly Sets ReadOnly attribute
    * @param {boolean} options.fieldOptions.ignore Do not create field exclude
    * @param {number} options.fieldOptions.min Minimum value number/range, min date
    * @param {number} options.fieldOptions.max Maximum value number/range, max date
    * @param {Object} options.fieldOptions.value Default value if not already set | bool if checkbox or radio
    * @param {Array} options.fieldOptions.roles If set only these roles can edit else ReadOnly ['Admin', 'Staff']
    * @param {Function} options.fieldOptions.changeEvent Change event for field
    * @param {Function} options.fieldOptions.validation Validation event
    * @param {string} options.fieldOptions.type Input type string - hidden, text, number, radio, checkbox, datepicker, date display, selector
    * @param {Object} options.fieldOptions.valueOptions [], //Either array or datastructure object for selector, drag/drop, datalist
    * @param {number} options.fieldOptions.order Order number option or order provided in fieldOptions if not provided then default to alpha
    * @param {HTMLElement} options.formTop Container element for default 3 containers top document.querySelector
    * @param {HTMLElement} options.formMiddle Container element for default 3 containers middle document.querySelector
    * @param {HTMLElement} options.formMeta Container element for default 3 containers meta document.querySelector
    * 
    * @method
    * @name createForm - creates form from object defined
    * 
    */
    constructor(options)
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

        if (typeof options === 'undefined')
        {
            console.error('clsAutoForm - options must be defined');
            return;
        }

        if (typeof options.container === 'undefined')
        {
            console.error('clsAutoForm - options.container must be defined');
            return;
        }

        if (typeof options.dataStructureObject === 'undefined' && typeof options.jsonObject === 'undefined')
        {
            console.error('clsAutoForm - either options.dataStructureObject or options.jsonObject have to be set');
            return;
        }
        else if (typeof options.dataStructureObject === 'undefined')
        {
            options.dataStructureObject = null;
        }
        else if (typeof options.jsonObject === 'undefined')
        {
            options.jsonObject = null;
        }

        if (typeof options.fieldOptions === 'undefined' || !options.fieldOptions)
        {
            options.fieldOptions = {};
        }

        this.options = options;

        this.container = options.container;

        this.formTop;
        this.formMiddle;
        this.formMeta;

        // Set formTop, formMiddle, formMeta from options
        if (typeof options.formTop !== 'undefined')
        {
            this.formTop = options.formTop;
        }
        if (typeof options.formMiddle !== 'undefined')
        {
            this.formMiddle = options.formMiddle;
        }
        if (typeof options.formMeta !== 'undefined')
        {
            this.formMeta = options.formMeta;
        }

        this.fieldOptions = options.fieldOptions;


        this.initialize();
    }

    initialize()
    {
        let existingNodes = Array.from(this.container.children);

        console.log(existingNodes)

        existingNodes.forEach((existingNode) =>
        {
            if (Array.from(existingNode.classList).indexOf('formTop') > -1)
            {
                this.formTop = this.container.querySelector('.formTop')
            }

            if (Array.from(existingNode.classList).indexOf('formMiddle') > -1)
            {
                this.formMiddle = this.container.querySelector('.formMiddle')
            }

            if (Array.from(existingNode.classList).indexOf('formMeta') > -1)
            {
                this.formMeta = this.container.querySelector('.formMeta')
            }
        });

        if (!this.formTop)
        {
            this.formTop = document.createElement('div');
            this.formTop.classList.add('flex-form', 'mt-5', 'formTop');
            this.container.append(this.formTop);
        }
        if (!this.formMiddle)
        {
            this.formMiddle = document.createElement('div');
            this.formMiddle.classList.add('flex-form', 'mt-5', 'formMiddle');
            this.container.append(this.formMiddle);
        }
        if (!this.formMeta)
        {
            this.formMeta = document.createElement('div');
            this.formMeta.classList.add('flex-form', 'mt-5', 'formMeta');
            this.container.append(this.formMeta);
        }
    }

    createForm()
    {
        if (this.options.dataStructureObject)
        {
            this.createFormFromDataStructure();
        }
        else if (this.options.jsonObject)
        {
            this.createFormFromJson();
        }
        else
        {
            console.error('clsAutoForm - createForm object type not found');
        }
    }

    createFormFromDataStructure()
    {
        let obj = this.options.dataStructureObject;

        let keyArr = Object.keys(obj);

        // item = keyArr.indexOf('Description'), to = position in array
        const move = (item, to) =>
        {
            // remove `from` item and store it
            let f = keyArr.splice(item, 1)[0];
            // insert stored item into position `to`
            keyArr.splice(to, 0, f);
        };

        //Move description and active fields to end of array to push name/title to front
        //Reorder keys and meta data
        move(keyArr.indexOf('Active'), 0);
        move(keyArr.indexOf('Name'), 0);
        move(keyArr.indexOf('Description'), 0);
        move(keyArr.indexOf('description'), 0);

        keyArr.forEach((key) =>
        {
            if (key.indexOf('fk_') > -1)
            {
                move(keyArr.indexOf(key), 0);
            }
        });
        move(keyArr.indexOf(keyArr.indexOf(obj._primaryKey)), 0);

        move(keyArr.indexOf('CreatedBy'), keyArr.length);
        move(keyArr.indexOf('RecordCreatedDateTime'), keyArr.length);

        move(keyArr.indexOf('LastUpdatedBy'), keyArr.length);
        move(keyArr.indexOf('RecordLastUpdateDateTime'), keyArr.length);

        Object.keys(obj._dataTypes).forEach((objE) =>
        {
            if (objE !== 'Active' && obj._dataTypes[objE] === 'bit')
            {
                move(keyArr.indexOf(objE), keyArr.length);
            }
        });

        keyArr.forEach((key) =>
        {
            let field = document.createElement('div');
            //field.classList.add('relative','py-4','px-2');

            let label = document.createElement('label');
            label.classList.add('input-label');
            let fieldInput = document.createElement('input');
            fieldInput.classList.add('peer');
            fieldInput.placeholder = key;
            setTimeout(() =>
            {
                fieldInput.setAttribute('style', '');
            }, 500);
            fieldInput.type = 'text';
            fieldInput.readOnly = true;
            field.append(fieldInput);
            field.append(label);

            label.innerHTML = key;
            fieldInput.classList.add(key);

            let isMetaData = false;

            // Foreign Key
            if (key && key.indexOf('fk_') > -1)
            {
                isMetaData = true;
            }

            switch (key)
            {
                case obj._primaryKey:
                    isMetaData = true;
                    break;
                case 'CreatedBy':
                    isMetaData = true;
                    break;
                case 'RecordCreatedDateTime':
                    isMetaData = true;
                    break;
                case 'LastUpdatedBy':
                    isMetaData = true;
                    break;
                case 'RecordLastUpdateDateTime':
                    isMetaData = true;
                    break;
            };

            if (isMetaData)
            {
                fieldInput.disabled = true;
                this.container.querySelector('.formMeta').append(field);
            }
            else if (key.indexOf('_') <= -1)
            {
                fieldInput.readOnly = false;

                switch (obj._dataTypes[key])
                {
                    case 'bit':
                        label.append(fieldInput);
                        label.classList.remove('input-label');
                        field.classList.add('checkbox-div');
                        fieldInput.type = 'checkbox';
                        let span = document.createElement('span');
                        span.classList.add('checkbox-span');
                        label.append(span);
                        //fieldInput.classList.add('form-check-input', 'align-middle');
                        setTimeout(() =>
                        {
                            //fieldInput.style.appearance = 'auto';
                        }, 600);
                        break;
                };

                let topArr = ['name', 'title', 'description', 'active'];

                if (topArr.indexOf(key.toLowerCase()) > -1)
                {
                    this.container.querySelector('.formTop').append(field);
                }
                else
                {
                    this.container.querySelector('.formMiddle').append(field);
                }
            }
        });
    }

    createFormFromJson()
    {
        //options.jsonObject
        console.error('clsAutoForm - createFormFromJson not implemented yet');
    }
}