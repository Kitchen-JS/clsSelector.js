class autoForm extends WindowTemplate
{
    constructor()
    {
        super(); // to inherit from base class
        this.id = this.randomWindowID();

        this.container = document.createElement('div');
        this.container.classList.add('d-flex', 'bg-red');

        let appContent = `<div class="d-block h-100 w-100 mt-3 p-3 bg-primary">
            
        <h1>FUBAR</h1>
        
        <div class="d-flex flex-column justify-content-evenly mt-5 appForm"> &nbsp;
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
            Icon: "pfi-form",
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
        

        
    }
}

//add to windows scope - REQUIRED
GlobalWindowManager.AppsManager.addClass({ "autoForm": autoForm });