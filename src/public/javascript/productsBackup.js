var express = require('express');
const passport = require('passport');
var router = express.Router();
const registerUser = require('../database/oracle').registerUser
const putToCart = require('../database/oracle').putToCart
const getCartFromUser = require('../database/oracle').getCartFromUser
const getCartSuggestions = require('../database/oracle').getCartSuggestions
const deleteFromCart = require('../database/oracle').deleteFromCart
const initiateOrder = require('../database/oracle').initiateOrder



// Get the modal
var modal = document.querySelector('.products-preview');

// Get the button that opens the modal
var btn = document.querySelector('.btn-primary');

// When the user clicks the button, open the modal
//btn.onclick = function() {
//showModal();
//}

function showModal() {
    modal.style.display = "block";

}

function hideModal() {
    modal.style.display = "none";
    if(document.getElementById('removeAfterClose') != null){
        let remove = document.getElementById('removeAfterClose')
        remove.parentNode.removeChild(remove)
    }

    if(document.getElementById('removeAfterClose2') != null){
        remove = document.getElementById('removeAfterClose2')
        remove.parentNode.removeChild(remove)
    }
     

    if (document.getElementById('removeAfterClose3')!= null){
        console.log('Remove first')
        remove = document.getElementById('removeAfterClose3')
        remove.parentNode.removeChild(remove)
    }
    
    if(document.getElementById('removeAfterClose4') != null){
        console.log('Remove second')
        remove = document.getElementById('removeAfterClose4')
        remove.parentNode.removeChild(remove)
    }

     


}

function handleDetailShow(prod) {
    document.querySelector('.preis').innerHTML = parseFloat(prod.preis.toFixed(2))+'€'   
    document.querySelector('.namep').innerHTML = prod.bezeichnung
    document.querySelector('.herstellerp').innerHTML = prod.hersteller
    document.querySelector('.imgp').src = '/images/' + prod.kategorie.trim() + '.png'
    document.querySelector('.buyModal').id = prod.artikelnr
    document.querySelector('.artikelnrp').innerHTML = prod.artikelnr
    document.querySelector('.nettop').innerHTML = parseFloat(prod.nettogewicht.toFixed(2))
    document.querySelector('.bruttop').innerHTML = parseFloat(prod.bruttogewicht.toFixed(2))
    document.querySelector('.recyclep').innerHTML = prod.recycle
    

    let slideshow = document.createElement('div')
    let weiter = document.createElement('div')
    let back = document.createElement('div')
    let ul = document.createElement('ul')
    let divButton = document.createElement('div')


    ul.setAttribute('id', 'product-listEmpfohlen')

    divButton.classList.add('navButtons')

    weiter.innerHTML = "&#8594"
    weiter.classList.add('btn')
    weiter.classList.add('weiter')
    weiter.setAttribute('id', 'next-btnEmpfohlen')

    back.innerHTML = "&#8592"
    back.classList.add('btn')
    back.classList.add('weiter')
    back.setAttribute('id', 'prev-btnEmpfohlen')

    let heading1 = document.createElement('h2')
    heading1.classList.add('details')
    heading1.setAttribute('id','removeAfterClose3')
    heading1.innerHTML = 'Passend zu diesem Produkt'

    let heading2 = document.createElement('h2')
    heading2.classList.add('details')
    heading2.setAttribute('id','removeAfterClose4')
    heading2.innerHTML = 'Ähnliche Produkte'
    


    slideshow.classList.add('new-products')
    slideshow.setAttribute('id','removeAfterClose')

    divButton.appendChild(back)
    divButton.appendChild(weiter)

    slideshow.appendChild(divButton)
    slideshow.appendChild(ul)
    


    if(prod.suggestions.length > 0){
        document.querySelector('.slideshowd1').appendChild(heading1)
    }
    if(prod.suggestions2.length > 0){
        document.querySelector('.slideshowd2').appendChild(heading2)
    }

    for (let index = 0; index < prod.suggestions.length; index++) {
        let li = document.createElement('li')
        li.setAttribute('id','produktLI')
        let imgDiv = document.createElement('div')
        imgDiv.classList.add('imgDivDetails')
        let imga = document.createElement('img')
        imga.setAttribute('src','/images/'+prod.suggestions[index][7]+'.png')
        let head = document.createElement('h3')
        head.innerHTML = prod.suggestions[index][2]
        let goWarenkorbButton = document.createElement('button')
        goWarenkorbButton.innerHTML= 'In den Warenkorb'
        goWarenkorbButton.setAttribute('onclick','goWarenkorb(this.id)')
        goWarenkorbButton.setAttribute('id',prod.suggestions[index][0])
        goWarenkorbButton.setAttribute('class','btn WarenkorbButton')

        li.appendChild(imgDiv)
        imgDiv.appendChild(imga)
        li.appendChild(head)
        li.appendChild(goWarenkorbButton)
        ul.appendChild(li)  
        //console.log(prod.suggestions[index][0])
        
    }


    let slideshow2 = document.createElement('div')
    let weiter2 = document.createElement('div')
    let back2 = document.createElement('div')
    let ul2 = document.createElement('ul')
    let divButton2 = document.createElement('div')

    ul2.setAttribute('id', 'product-listWeitere')
    divButton2.classList.add('navButtons')

    weiter2.innerHTML = "&#8594"
    weiter2.classList.add('btn')
    weiter2.classList.add('weiter')
    weiter2.setAttribute('id', 'next-btnWeitere')

    back2.innerHTML = "&#8592"
    back2.classList.add('btn')
    back2.classList.add('weiter')
    back2.setAttribute('id', 'prev-btnWeitere')


    slideshow2.classList.add('new-products')
    slideshow2.setAttribute('id','removeAfterClose2')
    
    divButton2.appendChild(back2)
    divButton2.appendChild(weiter2)
    slideshow2.appendChild(divButton2)
    slideshow2.appendChild(ul2)


    for (let index = 0; index < prod.suggestions2.length; index++) {
        let li2 = document.createElement('li')
        li2.setAttribute('id','produktLI')
        let imgDiv2 = document.createElement('div')
        imgDiv2.classList.add('imgDivDetails')
        let imga2 = document.createElement('img')
        imga2.setAttribute('src','/images/'+prod.suggestions2[index][7]+'.png')
        let head2 = document.createElement('h3')
        head2.innerHTML = prod.suggestions2[index][2]
        let goWarenkorbButton2 = document.createElement('button')
        goWarenkorbButton2.innerHTML= 'In den Warenkorb'
        goWarenkorbButton2.setAttribute('onclick','goWarenkorb(this.id)')
        goWarenkorbButton2.setAttribute('id',prod.suggestions2[index][0])
        goWarenkorbButton2.setAttribute('class','btn WarenkorbButton')

        li2.appendChild(imgDiv2)
        imgDiv2.appendChild(imga2)
        li2.appendChild(head2)
        li2.appendChild(goWarenkorbButton2)
        ul2.appendChild(li2)  
        //console.log(prod.suggestions[index][0])
        
    }

    if(prod.suggestions.length > 0 ){
        document.querySelector('.slideshowd1').appendChild(slideshow)
        slideShowButtonFunction()
    }
    if(prod.suggestions2.length > 0){
        document.querySelector('.slideshowd2').appendChild(slideshow2)
        slideShowButtonFunction2()
    }
    
    showModal()
}

function buildVorschläge (slideshow,suggestions){
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        
    }
}

router.post('/', async (req,res)=>{
    if(req.isAuthenticated()){
       await initiateOrderNew(req.user.id)
        res.sendStatus(200)
    }else{
      res.sendStatus(401)
    }
})


router.post('/', async (req,res)=>{
    if(req.isAuthenticated()){
       await initiateOrder(req.user.id)
        res.sendStatus(200)
    }else{
      res.sendStatus(401)
    }
})


function showDetail(id) {

    var modal = document.getElementById('productContainerID');

    modal.style.overflow = 'hidden';



    fetch('/products/detail', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            productid: id
        })
    })
        .then(response => response.json())
        .then((response) => handleDetailShow(response))
        .catch(error => console.error('Error:', error));
}

function goWarenkorb(productID) {
    fetch('/cart/add', {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            productid: productID
        })
    })
        .then(response => response.status)
        .then(status => handleResponse(status))
        .catch(error => console.error('Error:', error));
}

function handleResponse(status) {
    if (status === 200) {
        const div = document.createElement('div');
        div.classList.add('notificationgreen');
        const p = document.createElement('p');
        p.textContent = 'Produkt erfolgreich hinzugefügt';
        div.appendChild(p);
        document.body.appendChild(div);
        setTimeout(function () {
            div.remove();
        }, 3000);
    } else {
        const div = document.createElement('div');
        div.classList.add('notificationred');
        const p = document.createElement('p');
        p.textContent = 'Fehler!';
        div.appendChild(p);
        document.body.appendChild(div);
    }
}


function slideShowButtonFunction(){
    const nextBtnEmpfohlen = document.getElementById("next-btnEmpfohlen");
const prevBtnEmpfohlen = document.getElementById("prev-btnEmpfohlen");
const productListEmpfohlen = document.getElementById("product-listEmpfohlen");

const ulElement4 = document.getElementById('product-listEmpfohlen');
const liElements4 = ulElement4.querySelectorAll('#produktLI');

prevBtnEmpfohlen.style.display = "none";


if(liElements4.length <=5){
    nextBtnEmpfohlen.style.display = "none"
    prevBtnEmpfohlen.style.display = "none"
}

let offsetEmpfohlen = 0;
let displayedItemsEmpfohlen = 5;

nextBtnEmpfohlen.addEventListener("click", () => {
    prevBtnEmpfohlen.style.display = "inline-block"
    offsetEmpfohlen += 5;
    displayedItemsEmpfohlen += 5;

    for (let i = offsetEmpfohlen; i < displayedItemsEmpfohlen; i++) {
    const li = productListEmpfohlen.children[i];
    if (li) {
      li.style.display = "list-item";
    } else {
      nextBtnEmpfohlen.style.display = "none";
      break;
    }
  }

  for (let i = offsetEmpfohlen - 5; i < offsetEmpfohlen; i++) {
    const li = productListEmpfohlen.children[i];
    if (li) {
      li.style.display = "none";
    } else {
      break;
    }
  }
});

prevBtnEmpfohlen.addEventListener("click", () => {
    nextBtnEmpfohlen.style.display = "inline-block"

    offsetEmpfohlen -= 5;
    displayedItemsEmpfohlen -= 5;

if(displayedItemsEmpfohlen <= 5){
    prevBtnEmpfohlen.style.display = "none"
}

for (let i = offsetEmpfohlen; i < displayedItemsEmpfohlen; i++) {
const li = productListEmpfohlen.children[i];
if (li) {
    li.style.display = "list-item";
} else {
    break;
}
}

for (let i = displayedItemsEmpfohlen; i > offsetEmpfohlen; i++) {
    const li = productListEmpfohlen.children[i];
    console.log('I ist ' + i)

if (li) {
    li.style.display = "none";
} else {
    break;
}
}
})
}

function slideShowButtonFunction2(){
const nextBtnWeitere = document.getElementById("next-btnWeitere");
const prevBtnWeitere = document.getElementById("prev-btnWeitere");
const productListWeitere = document.getElementById("product-listWeitere");

const ulElement3 = document.getElementById('product-listWeitere');
const liElements3 = ulElement3.querySelectorAll('#produktLI');

prevBtnWeitere.style.display = "none";


if(liElements3.length <=5){
    nextBtnWeitere.style.display = "none"
    prevBtnWeitere.style.display = "none"
}

let offsetWeitere = 0;
let displayedItemsWeitere = 5;

nextBtnWeitere.addEventListener("click", () => {
    prevBtnWeitere.style.display = "inline-block"
    offsetWeitere += 5;
    displayedItemsWeitere += 5;

    for (let i = offsetWeitere; i < displayedItemsWeitere; i++) {
    const li = productListWeitere.children[i];
    if (li) {
      li.style.display = "list-item";
    } else {
      nextBtnWeitere.style.display = "none";
      break;
    }
  }

  for (let i = offsetWeitere - 5; i < offsetWeitere; i++) {
    const li = productListWeitere.children[i];
    if (li) {
      li.style.display = "none";
    } else {
      break;
    }
  }
});

prevBtnWeitere.addEventListener("click", () => {
    nextBtnWeitere.style.display = "inline-block"

    offsetWeitere -= 5;
    displayedItemsWeitere -= 5;

if(displayedItemsWeitere <= 5){
    prevBtnWeitere.style.display = "none"
}

for (let i = offsetWeitere; i < displayedItemsWeitere; i++) {
const li = productListWeitere.children[i];
if (li) {
    li.style.display = "list-item";
} else {
    break;
}
}

for (let i = displayedItemsWeitere; i > offsetWeitere; i++) {
    const li = productListWeitere.children[i];
    console.log('I ist ' + i)

if (li) {
    li.style.display = "none";
} else {
    break;
}
}
});
}
