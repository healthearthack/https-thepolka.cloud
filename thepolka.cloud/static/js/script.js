// Get all your menu items and all your content sections
const menuItems = document.querySelectorAll('.left-margin-menu li');

menuItems.forEach(item => {
    // When mouse hovers over a menu line item
    item.addEventListener('mouseenter', () => {
        const targetId = item.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            targetSection.classList.add('reveal-preview');
        }
    });

    // When mouse leaves the menu line item
    item.addEventListener('mouseleave', () => {
        const targetId = item.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            targetSection.classList.remove('reveal-preview');
        }
    });
});
