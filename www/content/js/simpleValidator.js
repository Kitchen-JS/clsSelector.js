class validator 
{
    constructor(options)
    {
        this.options = options;
        this.target = options.target;
        this.elementList = '.phone, .email';
        this.phoneRegex = /^\d{10}$/;
        this.emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        this.elements = [];
        this.init(this.target);
    }
    
    init()
    {
        this.findElements(this.target, this.elementList);
        this.setUpValidators(this.elements);
    }

    findElements(target, elementList)
    {
        this.elements = Array.from(target.querySelectorAll(elementList));
        console.log(this.elements);
    }

    setUpValidators(elements)
    {
        for (let i = 0; i < elements.length; i++) 
        {     
            let context = this;       
            let element = elements[i];
            if (element.classList.contains('phone'))
            {   
                console.log(element);             
                element.addEventListener('input', () => 
                {
                    this.validatePhone(element);
                });
            } 
            else if (element.classList.contains('email')) 
            {
                console.log(element);             
                element.addEventListener('input', () => 
                {
                    this.validateEmail(element);
                });
            }
        }
    }

    validatePhone(element) 
    {
        if (element) 
        {
            console.log(element);
            let value = element.value;
            const testPhone = this.phoneRegex.test(value);
    
            if (testPhone)
            {
                element.classList.remove('invalid');
                element.classList.add('valid');
            } 
            else 
            {
                element.classList.remove('valid');
                element.classList.add('invalid');
            }
        }
        
    }

    validateEmail(element) 
    {
        const value = element.value.trim();
        const testEmail = this.emailRegex.test(value);

        if (testEmail)
        {
            element.classList.remove('invalid');
            element.classList.add('valid');
        } 
        else 
        {
            element.classList.remove('valid');
            element.classList.add('invalid');
        }
    }
  
}

const validateForm = new validator (
    {
        target: document.querySelector('.appForm')
    });