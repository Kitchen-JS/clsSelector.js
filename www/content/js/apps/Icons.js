class icons extends WindowTemplate
{
    constructor()
    {
        super(); // to inherit from base class
        this.id = this.randomWindowID();

        this.container = document.createElement('div');
        this.container.classList.add("icons", "d-flex", "align-content-center", "align-items-center", "flex-wrap", "mt-4");

        let appContent = `<div class="row align-content-center align-items-center text-center m-auto">
            <div class="items-center content-center text-center col-10">
                <input type="text" class="searchInput" placeholder="Search for icons.." style="color: #000;" title="Search for icons"><span class="iconCount"></span>
                <ul class="iconsList flex flex-wrap justify-content-around">
                </ul>
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
            draggable:true,
            shadows:true,
            resizeable: false, // enables/disables dragging corners of window to resize (not grid positions)
            position: ["middle", "middle"],
            locked: true, //Have to pick a grid - snap locked to grid (does NOT stop user from dragging)
            id: this.id, //in template base class, should always be a random ID to prevent overlaps
            Icon: "pfi-icons",
            IconColor: '#21dbd2',
            IconBkgColor:"black",
            title: "Icons Package",
            minimize:true,
            maximize:true
        };
    }

    // THIS METHOD REQUIRED TO MAKE YOUR APP FUNCTION
    async initialize()
    {
        let container = this.container.querySelector('.iconsList');

        Object.keys(pfi).forEach((icon) =>
        {
            let li = document.createElement('li');
            li.classList.add('p-1', 'border', 'border-solid', 'rounded-lg', 'm-2');
            li.innerHTML = '<i class="' + icon +' is-5"></i>' + '<p class="text-ellipsis">' + icon + '</p>';
            container.appendChild(li);
        });

        let searchInput = this.container.querySelector('.searchInput');

        let iconCount = this.container.querySelector('.iconCount');
        
        let totalIcons = container.getElementsByTagName('li').length;

        let ictr = 0;

        iconCount.innerHTML = '&nbsp;' + totalIcons + ' icons';

        searchInput.addEventListener('keyup', () =>
        {
            let icons = container.getElementsByTagName('li');
            ictr = 0;
            Array.from(icons).forEach((icon) =>
            {
                if(searchInput.value.length <= 0)
                {
                    icon.classList.remove('hidden');
                    ictr++;
                }
                else if(icon.innerHTML.indexOf(searchInput.value) > -1)
                {
                    icon.classList.remove('hidden');
                    ictr++;
                }
                else
                {
                    icon.classList.add('hidden');
                }
            });
            iconCount.innerHTML = '&nbsp;' + ictr + '/' + totalIcons + ' icons';
        });
    }
}

//add to windows scope - REQUIRED
GlobalWindowManager.AppsManager.addClass({ "icons": icons });