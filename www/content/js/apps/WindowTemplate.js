class WindowTemplate
{
    constructor()
    {
        this.container;
        this.baseTemplate;
        this.loadingSpinner = new clsLoadingElement({parent: GlobalWindowManager, container: this.container})
    }

    getTemplate(path)
    {
        var xhr = new XMLHttpRequest();

        xhr.open('GET', path, false); //Path
        xhr.setRequestHeader('Content-Type', 'text/html');
        xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
        xhr.send();
        if (xhr.status === 200)
        {
            let html = xhr.responseText;
            
            return html;
        }
        else
        {
            //Handle the error
        }
    }

    randomWindowID()
    {
        return 'Window-' + Math.abs(parseInt(this.randomNumber())) + '' + Date.now();
    }

    randomNumber()
    {
        return Math.random() * (1 - 1000) + 1;
    }

    random_rgba()
    {
        let o = Math.round, r = Math.random, s = 255;
        return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + 1 + ')';
    }
}

