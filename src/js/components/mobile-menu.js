const header = document.querySelector('.header');

header.addEventListener('click', function(event) {
    let target = event.target.closest('.header__sidebar-btn') || event.target.closest('.header__user-profile-btn');

    if(!target) return;

    let sideMenuOne;
    let sideMenuTwo;
    let sign = 1;
    let active = '';

    if (target.classList.contains('header__sidebar-btn')) {
        sideMenuOne = document.querySelector('.sidebar');
        sideMenuTwo = document.querySelector('.toolbar');
        sign = -1;
        active = 'header__sidebar-btn--active';
    } 
    else {
        sideMenuOne = document.querySelector('.toolbar');
        sideMenuTwo = document.querySelector('.sidebar');
        active = 'header__user-profile-btn--active';
    }

    if (sideMenuTwo.hasAttribute('data-open')) return;

    if (!sideMenuOne.hasAttribute('data-open')) {
        sideMenuOne.style.transform = 'translateX(0)';
        sideMenuOne.setAttribute('data-open', true);
        target.classList.add(active);
    }
    else {
        sideMenuOne.style.transform = `translateX(${sign * 100}%)`;
        sideMenuOne.removeAttribute('data-open');
        target.classList.remove(active);
    }
});