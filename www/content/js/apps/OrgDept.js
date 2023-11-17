// You can copy/paste this any time you need a starting point for a new window.
class OrgDept extends WindowTemplate
{
    constructor()       
    {
        super(); // to inherit from base class
        this.id = this.randomWindowID();
        //this.footerID = this.id + '-footer';
        this.container = document.createElement('div');
        this.container.classList.add('d-flex');

        let title = 'Manage Departments';

        this.baseTemplate = `    

        <div class="d-block h-100 w-100 mt-5 p-3">

            <div class="row">
                <h3>${title}</h3>
            </div>
            <div class="row">
                <div class="col-sm-12 col-md-6 col-lg-4 text-end">
                    <div class="deptSelector"></div>
                    <div class="form-check form-switch">
                        <label class="form-check-label">Only show enabled Dept Sections</label>
                        <input type="checkbox" role="switch" class="SelectorActive form-check-input" checked="true"/>
                    </div>
                    <button class="btn btn-light-camo Apps_Save">Add New</button>
                </div>
            </div>

            <div class="d-flex flex-column justify-content-evenly mt-5">
                <div class="appForm">
                
                    <div class="flex-form formTop mt-5">
                    
                    </div>

                    <div class="flex-form formMiddle mt-5"> 
                    
                    </div>

                    <div class="flex-form formMeta mt-5">
                    
                    </div>
                </div>
            </div>

        </div>                         
        `;

/*        
        Name
        Description
        SchoolCode
        TrainingCenterPOC
        TrainingCenterEmail
        TrainingCenterPhone
        Active
        
        ADGroup
        OfficeSymbol
        DeptEmail
        IsTrainingCenter
        IsDepartment
        ParentOrgElementID
        BaseFolderSharedDrive
        ADCourseDevelopersGroup
        ADCourseManagersGroup
        ADInstructorsGroup
        ADAssistantsGroup
        ADStudentsGroup
        Seal
        Logo
        StockImage1
        TrainingCenterPurpose
        StockImage2
*/

        this.deptSelector;

        this.selectorDeptObj;

        this.initOptions = {
            body: this.container, //should always be the container you created above
            footer: this.buttonsContainer, // usually null, pretty rare we will need a footer
            header: title,  //Defined in DB overides this
            title: title, //Defined in DB overides this
            menuAltTitle: title, //Formerly menu item title //Defined in DB overides this, alt attribute, not required
            icon: "pfi-organization-hierarchy-alt-1", //Defined in DB overides this
            inject: [], //String Array of js files, DB will add any additional to this
            //roles: [], //String Array of Roles, OVERWRITTEN BY DB, pipe delimited "|"
            snapping: true, // makes window snap to grid positions
            resizeable: true, // enables/disables dragging corners of window to resize (not grid positions)
            draggable: true, // whether or not the user can drag the window
            locked: true, //Have to pick a grid - snap locked to grid (does NOT stop user from dragging)
            id: this.id, //in template base class, should always be a random ID to prevent overlaps
            //height: "50%", // optional
            //width: "50%",// optional
            //left: `${randomNumber(250, 350)}px`,// optional - distance to left of screen
            //top: `${randomNumber(250, 350)}px`,// optional - distance to top of screen
            initialPosition: ["middle", "middle"], // Which grid position if defined
            //onClose: function () { console.log('window closed') }, // event listener function
            //onOpen: function () { console.log('window opened') },
            //onMinimize: function () { console.log('window min') },
            //onMaximize: function () { console.log('window max') }
        };
    }

    async initialize()
    {
        this.container.innerHTML = this.baseTemplate;

        this.selectorDeptObj = new clsOrgElements();

        this.deptSelector = new clsSelectorNew({
            containerElement: this.container.querySelector('.deptSelector'),
            placeHolder: "Select Section",
            data: this.selectorDeptObj,
            resultData: function (searchResult)
            {
                let value = searchResult.OrgElementID;
                let textValue = searchResult.Name;
                let displayValue = textValue;
                return { value: value, textValue: textValue, displayValue: displayValue };
            },
            onChange: function ()
            {
                
            }.bind(this)
        });


        this.buildMetaData();
    }

    buildMetaData()
    {



        let obj = new clsOrgElements();

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
            field.classList.add("form-floating");
            let label = document.createElement('label');
            let fieldInput = document.createElement('input');
            fieldInput.classList.add("form-control");
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
                this.container.querySelector('.appForm .formMeta').append(field);
            }
            else if (key.indexOf('_') <= -1)
            {
                fieldInput.readOnly = false;

                switch (obj._dataTypes[key])
                {
                    case 'bit':
                        field.classList.add('align-middle')
                        fieldInput.type = 'checkbox';
                        fieldInput.classList.add('form-check-input', 'align-middle');
                        setTimeout(() =>
                        {
                            fieldInput.style.appearance = 'auto';
                        }, 600);
                        break;
                };

                let topArr = ['name', 'title', 'description', 'active'];

                if (topArr.indexOf(key.toLowerCase()) > -1)
                {
                    this.container.querySelector('.appForm .formTop').append(field);
                }
                else
                {
                    this.container.querySelector('.appForm .formMiddle').append(field);
                }
            }
        });

    }

    cancel()
    {
        this.selectorDeptObj = new clsOrgElements();
    }
    reset()
    {

    }
}

GlobalWindowManager.AppsManager.addClass({ 'OrgDept': OrgDept });