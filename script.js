/**
 * Circular Light Controller
 * https://github.com/marclura/circular-light-controller/tree/main
 * 
 */ 


/**
 * Settings
 */

const pixel_count = 12; // amount of pixels
const pixel_width = 50; // px
const max_ring_size = 600;  // px


/**
 * Setup
 */

let ring_container = document.getElementById('ring-container');
let color_pickers = document.getElementsByClassName('color-picker');

const windows_width = document.documentElement.clientWidth;
const windows_height =document.documentElement.clientHeight;

let ring_size = 0;

if(windows_width < windows_height) {
    ring_size = windows_width - pixel_width;
}
else {
    ring_size = windows_height - pixel_width;
}

if(ring_size > max_ring_size) ring_size = max_ring_size;

ring_container.style.width = ring_size + 'px';
ring_container.style.height = ring_size + 'px';

let current_active_group = 1;


/*
* Add websocket 
*/
var gateway = `ws://${window.location.hostname}/ws`;
var websocket;
window.addEventListener('load', onLoad);
function initWebSocket() {
    console.log('Trying to open a WebSocket connection...');
    websocket = new WebSocket(gateway);
    websocket.onopen = onOpen;
    websocket.onclose = onClose;
    websocket.onmessage = onMessage; //This event acts as a client's ear to the server. Whenever the server sends data, the onmessage event gets fired
}

function onOpen(event) {
	console.log('Connection opened');
}
function onClose(event) {
	console.log('Connection closed');
	setTimeout(initWebSocket, 2000);
}
function onMessage(event) {
	console.log(event.data);
}
function onLoad(event) {
	initWebSocket();
}

/**
 * Add pixel to the ring
 */

const angle = 360 / pixel_count;
let rotation = 0;

for(let i=0; i<pixel_count; i++) {
    let pixel = document.createElement('div');
    pixel.style.transform = 'rotate(' + rotation + 'deg) translate(' + ring_size / 2 + 'px)';
    pixel.classList.add('pixel');
    pixel.id = 'pixel-' + i;
    pixel.innerHTML = i;
    ring_container.append(pixel);

    rotation = rotation + angle;
}

function pixelAction(p) {
    p.classList.toggle('active-pixel');
    if(p.classList.contains('active-pixel')) {
        p.setAttribute('group', current_active_group);
    }
    else {
        p.removeAttribute('group');
    }
    updatePixels();
}

function updatePixels() {
    console.log("current_active_group: " + current_active_group);

    for(let i=0; i<pixels.length; i++) {
        let p = pixels[i];

        if(p.getAttribute('group') == current_active_group) {
            p.style.backgroundColor = color_pickers[current_active_group - 1].value;
            websocket.send(i + ',' + color_pickers[current_active_group - 1].value);		//Send pixel data id + color
        }
        else {
            if(p.getAttribute('group') == null) {
                p.style.backgroundColor = null;
                websocket.send(i + ',' + "#000000");	//When pixel is off swend black color
            }
        }
    }

}

let pixels = ring_container.children;

// add event listener click to every pixel
for(let i=0; i<pixels.length; i++) {
    pixels[i].addEventListener('click', pixelAction.bind(this, pixels[i]));
}

/**
 * Color pickers
 */

// add event listener click to every color picker

function colorPickerAction(group) {
    current_active_group = group;
    //selectActiveGroup();
    updatePixels();
}

function updateColorPickerListener() {
    for(let i=0; i<color_pickers.length; i++) {
        color_pickers[i].removeEventListener('input',colorPickerAction.bind(this, i+1));
        color_pickers[i].addEventListener('input', colorPickerAction.bind(this, i+1));
    }
}

updateColorPickerListener();


/**
 * Groups
 */

let groups_container = document.getElementById('groups-container');
let groups = groups_container.children;

function addGroup() {
    
    
    let id = groups.length + 1;
    current_active_group = id;

    // new div
    let div = document.createElement('div');
    div.id = 'group-' + id;
    div.setAttribute('group', id);
    div.classList.add('group');

    // h2 group
    let h2 = document.createElement('h2');
    h2.classList.add('group-title');
    h2.innerHTML = 'Group' + String(id).padStart(2, '0');
    div.append(h2);

    console.log(h2);

    // input color picker
    let input_color = document.createElement('input');
    input_color.type = 'color';
    input_color.id = 'color-picker-' + id;
    input_color.classList.add('color-picker');
    input_color.setAttribute('value', '#808080');
    input_color.setAttribute('group', id);
    div.append(input_color);

    // remove group button
    /*
    let remove_group_button = document.createElement('span');
    remove_group_button.setAttribute('group', id);
    remove_group_button.classList.add('remove-group-button');
    remove_group_button.innerHTML = '+';
    div.append(remove_group_button);
    */

    // append to the groups container
    groups_container.append(div);

    // add the event listener to the new color picker
    updateColorPickerListener();

    // add event listener to the group for current active group selection and on the group remove button
    for(let i=0; i<groups.length; i++) {
        // selection active
        groups[i].removeEventListener('click', selectActiveGroup.bind(this, i+1));
        groups[i].addEventListener('click', selectActiveGroup.bind(this, i+1));

        /* TODO: fix the group and current_group numbers when a group is removed
        // remove button
        groups[i].getElementsByClassName('remove-group-button')[0].removeEventListener('click', removeGroup.bind(this, i+1));
        groups[i].getElementsByClassName('remove-group-button')[0].addEventListener('click', removeGroup.bind(this, i+1));
        */
    }    

    // change current active group
    selectActiveGroup(id);

}

function selectActiveGroup(current) {

    current_active_group = current;

    for(let i = 0; i < groups.length; i++) {
        // let group_id = groups[i].getElementsByTagName('input')[0].getAttribute('group');
        let group_id = groups[i].getAttribute('group');

        //console.log('group_id: ' + group_id + ', current_active_group' + current_active_group);

        if(group_id == current_active_group) {
            groups[i].classList.add('active-group');
        } else {
            groups[i].classList.remove('active-group');
        }
    }
}

/* TODO: fix the group and current_group numbers when a group is removed
function removeGroup(group_to_remove) {
    console.log("group_to_remove: " + group_to_remove);

    current_active_group -= 1;

    for(let i = 0; i < groups.length; i++) {
        if(groups[i].getAttribute('group') == group_to_remove) {
            groups[i].remove();
            break;
        }
    }
}
*/

/**
 *  button add group
 */ 
let add_group_button = document.getElementById('add-group-button');
add_group_button.addEventListener('click', addGroup);

