const navBarLinksList = document.querySelector('.navbar__list');
let previousUlHeight = 0;


navBarLinksList.addEventListener('click', function (event) {
    if (event.target.nodeName !== 'SPAN') return;

    // console.log(event);
    let spanItem = event.target;
    let innerUl = spanItem.nextElementSibling;

    if (!innerUl.hasAttribute('data-open')) {
        innerUl.classList.add('navbar__list-inner--active');
        innerUl.setAttribute('data-open', 'true');
        spanItem.classList.add('navigation-link--nest-lvl-1--active');
    }
    else {
        innerUl.classList.remove('navbar__list-inner--active');
        innerUl.removeAttribute('data-open');
        spanItem.classList.remove('navigation-link--nest-lvl-1--active');
    }    
});
