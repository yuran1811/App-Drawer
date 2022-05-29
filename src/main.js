'use strict';

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const canvas = $('#draw');
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'black';

const canvasImage = [];

const sizeEle = $('#size');
const colorEle = $('#color');

const mouse = {
	x: undefined,
	y: undefined,
};
const coor = {
	x: 0,
	y: 0,
};

let linePop = [];
let lineStack = [];
let linePopIndex = -1;
let lineStackIndex = -1;
let isDown = false;
let prevX, prevY;

// Redo
function undoDraw() {
	if (canvasImage.length) {
		canvas.width = $('#w-size').value;
		canvas.height = $('#h-size').value;

		ctx.drawImage(canvasImage.pop(), 0, 0);
	}
}

// Draw Functions
function drawPoint(x, y, size = sizeEle.value, color = colorEle.value) {
	ctx.beginPath();
	ctx.arc(x, y, size, 0, 2 * Math.PI, false);
	ctx.fillStyle = color;
	ctx.fill();
	ctx.closePath();
}
function drawLine(
	x1,
	y1,
	x2,
	y2,
	size = sizeEle.value,
	color = colorEle.value
) {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.lineWidth = size * 2;
	ctx.strokeStyle = color;
	ctx.stroke();
	ctx.closePath();
}

// Pen Function
function penMouseDown(e) {
	isDown = 1;
	prevX = e.offsetX;
	prevY = e.offsetY;

	const img = new Image();
	img.src = canvas.toDataURL('image/bmp', 1.0);
	canvasImage.push(img);

	drawPoint(prevX, prevY);
}
function penMouseUp() {
	prevX = prevY = undefined;
	isDown = 0;
}
function penMouseMove(e, size = sizeEle.value, color = colorEle.value) {
	const x2 = e.offsetX;
	const y2 = e.offsetY;

	if (isDown) {
		drawPoint(x2, y2, size, color);
		drawLine(prevX, prevY, x2, y2, size, color);
	}

	prevX = x2;
	prevY = y2;
}

// Line Function
function lineMouseDown(e) {
	isDown = 1;
	prevX = e.offsetX;
	prevY = e.offsetY;
}
function lineClick(e) {
	const { top, left } = canvas.getBoundingClientRect();

	const toX = e.clientX - left;
	const toY = e.clientY - top;
	const size = sizeEle.value;
	const color = colorEle.value;

	undoDraw();

	const img = new Image();
	img.src = canvas.toDataURL('image/bmp', 1.0);
	canvasImage.push(img);

	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = size * 2;
	ctx.moveTo(prevX, prevY);
	ctx.lineTo(toX, toY);
	ctx.stroke();
	ctx.closePath();

	if (isDown) {
		drawPoint(prevX, prevY);
		drawPoint(toX, toY);
	}
}
function lineUp(e) {
	const { top, left } = canvas.getBoundingClientRect();

	const toX = e.clientX - left;
	const toY = e.clientY - top;
	const size = sizeEle.value;
	const color = colorEle.value;

	undoDraw();

	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = size * 2;
	ctx.moveTo(prevX, prevY);
	ctx.lineTo(toX, toY);
	ctx.stroke();
	ctx.closePath();

	if (isDown) {
		drawPoint(prevX, prevY);
		drawPoint(toX, toY);
	}

	prevX = prevY = undefined;
	isDown = 0;
}

// Draw Usage
const removeAllEvent = () => {
	document.removeEventListener('mouseup', penMouseUp);

	canvas.removeEventListener('mousedown', eraseMouseDown);
	canvas.removeEventListener('mousedown', lineMouseDown);
	canvas.removeEventListener('mousedown', penMouseDown);

	canvas.removeEventListener('mousemove', penMouseMove);
	canvas.removeEventListener('mousemove', eraseFunc);
	canvas.removeEventListener('mousemove', lineClick);

	canvas.removeEventListener('click', fileLocate);
	canvas.removeEventListener('click', lineClick);
};

const eraseFunc = (e) => penMouseMove(e, sizeEle.value * 2, '#ffffff');
const eraseMouseDown = (e) => {
	isDown = 1;
	prevX = e.offsetX;
	prevY = e.offsetY;
	drawPoint(prevX, prevY, sizeEle.value * 2, '#ffffff');
};

const fileLocate = (e) => ctx.drawImage(e.target.imgData, e.offsetX, e.offsetY);

const drawUsePen = () => {
	removeAllEvent();
	canvas.addEventListener('mousedown', penMouseDown);
	canvas.addEventListener('mousemove', penMouseMove);
	document.addEventListener('mouseup', penMouseUp);
};
const drawUseLine = () => {
	removeAllEvent();

	canvas.addEventListener('mousedown', lineMouseDown);
	canvas.addEventListener('mousemove', lineClick);
	document.addEventListener('mouseup', lineUp);
};

$('#pen').onclick = drawUsePen;
$('#line').onclick = drawUseLine;

// Clear & Resize & Eraser
$('#eraser').onclick = () => {
	removeAllEvent();
	canvas.addEventListener('mousemove', eraseFunc);
	canvas.addEventListener('mousedown', eraseMouseDown);
	document.addEventListener('mouseup', penMouseUp);
};

function Reset() {
	ctx.save();
	canvas.width = $('#w-size').value;
	canvas.height = $('#h-size').value;
	ctx.restore();

	const last = $('.btn--active');
	if (last) last.classList.remove('btn--active');

	document.removeEventListener('mouseup', penMouseUp);
	canvas.removeEventListener('click', lineClick);
	canvas.removeEventListener('mousedown', penMouseDown);
	canvas.removeEventListener('mousedown', lineMouseDown);
	canvas.removeEventListener('mousemove', penMouseMove);
}

$('#reset').onclick = () => {
	Reset();

	linePopIndex = lineStackIndex = -1;
	linePop = [];
	lineStack = [];

	sizeEle.value = 5;
	$('#w-size').value = 900;
	$('#h-size').value = 500;
	colorEle.value = '#000000';

	canvas.width = 900;
	canvas.height = 500;
	ctx.fillStyle = 'black';
};
$('#resize').onclick = () => {
	localStorage.setItem('img', canvas.toDataURL());
	Reset();
	let dataURL = localStorage.getItem('img');
	let img = new Image();
	img.src = dataURL;
	img.onload = () => ctx.drawImage(img, 0, 0);
};

// Get Img from file
const reader = new FileReader();
$('#file-upload').addEventListener('change', (e) => {
	const files = e.target.files;
	const img = new Image();
	img.src = URL.createObjectURL(files[0]);
	img.onload = () => {
		$('.add-img').addEventListener('click', () => {
			removeAllEvent();
			canvas.imgData = img;
			canvas.addEventListener('click', fileLocate);
		});
	};
});

// Button When Click
$$('.btn--change').forEach((item) => {
	item.addEventListener('click', () => {
		const last = $('.btn--active');
		if (last) last.className = last.className.replace(' btn--active', '');
		item.classList.toggle('btn--active');
	});
});

// Theme Toggle
let isDark = 0;
const Mode = $('#switch-mode');
Mode.onclick = () => {
	document.body.classList.toggle('dark');
	if (isDark) {
		Mode.innerHTML = 'Dark';
		isDark = 0;
	} else {
		Mode.innerHTML = 'Light';
		isDark = 1;
	}
};

// Menu
$('.menu-ico').onclick = (e) => {
	e.target.classList.toggle('active');
	$('.menu-tool').classList.toggle('active');
};
$('.tool-container').ondblclick = () => {
	$('.menu-tool').classList.remove('active');
	$('.menu-ico').classList.remove('active');
};

// Undo
onkeydown = (e) => {
	if (e.key == 'z') undoDraw();
};
