// deleting a campground 

const deleteBtn = document.getElementById('delete-btn');
const loader = document.querySelector('.loader-wrapper');

if( deleteBtn ) {
    deleteBtn.onclick = (event) => {
        let willDelete = confirm('Do you want to delete this campground?');
        
        if (!willDelete) event.preventDefault();
        else loader.style.display = "flex";
    };
}

// async-btn
const asyncBtn = document.querySelector('.async-btn');
if (asyncBtn) {
    asyncBtn.onclick = () => {
        loader.style.display = "flex";
    };
}
