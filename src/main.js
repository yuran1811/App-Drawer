'use strict';

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const sizeEle = $('#size');
const colorEle = $('#color');
const canvas = $('#draw');
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'black';

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
	prevX = e.clientX;
	prevY = e.clientY;
}
function lineClick(e) {
	const { top, left } = canvas.getBoundingClientRect();

	const x = prevX - left;
	const y = prevY - top;
	const toX = e.clientX - left;
	const toY = e.clientY - top;
	const size = sizeEle.value;
	const color = colorEle.value;

	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = size * 2;
	ctx.moveTo(x, y);
	ctx.lineTo(toX, toY);
	ctx.stroke();
	ctx.closePath();

	drawPoint(x, y);
	drawPoint(toX, toY);

	lineStack.push([ctx.lineWidth, x, y, toX, toY, ctx.strokeStyle]);
	lineStackIndex++;
}

// Draw Usage
const removeAllEvent = () => {
	document.removeEventListener('mouseup', penMouseUp);
	canvas.removeEventListener('mousedown', eraseMouseDown);
	canvas.removeEventListener('mousedown', lineMouseDown);
	canvas.removeEventListener('mousedown', penMouseDown);
	canvas.removeEventListener('mousemove', penMouseMove);
	canvas.removeEventListener('mousemove', eraseFunc);
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
	canvas.addEventListener('click', lineClick);
};

$('#pen').addEventListener('click', drawUsePen);
$('#line').addEventListener('click', drawUseLine);

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

	const lastActive = $('.btn--active');
	if (lastActive)
		lastActive.className = lastActive.className.replace('btn--active', '');

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
	let img = new Image();
	img.src = URL.createObjectURL(files[0]);
	img.onload = () => {
		$('#upload button').addEventListener('click', () => {
			removeAllEvent();
			canvas.imgData = img;
			canvas.addEventListener('click', fileLocate);
		});
	};
});

// Button When Click
$$('.btn--change').forEach((item) => {
	item.addEventListener('click', (e) => {
		const lastActive = $('.btn--active');
		if (lastActive)
			lastActive.className = lastActive.className.replace(
				'btn--active',
				''
			);
		e.target.className += ' btn--active';
	});
});

// Theme Toggle
let isDark = 0;
const Mode = $('#switch-mode');
Mode.addEventListener('click', () => {
	document.body.classList.toggle('dark');
	if (isDark) {
		Mode.innerHTML = 'Dark';
		isDark = 0;
	} else {
		Mode.innerHTML = 'Light';
		isDark = 1;
	}
});

// Menu
$('.menu-ico').addEventListener('click', (e) => {
	e.target.classList.toggle('active');
	$('.all-tool').classList.toggle('active');
});
$('.tool-container').addEventListener('dblclick', () => {
	$('.all-tool').classList.remove('active');
	$('.menu-ico').classList.remove('active');
});

// Undo
window.addEventListener('keydown', (e) => {
	if (e.key == 'z') {
		if (lineStackIndex < 0) return;
		const lineItem = lineStack[lineStackIndex--];
		lineStack.pop();

		linePop.push(lineItem);
		linePopIndex++;

		ctx.beginPath();
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = lineItem[0] + 2;
		ctx.moveTo(lineItem[1], lineItem[2]);
		ctx.lineTo(lineItem[3], lineItem[4]);
		ctx.stroke();
		ctx.closePath();

		drawPoint(lineItem[1], lineItem[2], lineItem[0] / 2 + 1, '#ffffff');
		drawPoint(lineItem[3], lineItem[4], lineItem[0] / 2 + 1, '#ffffff');

		ctx.lineWidth = sizeEle.value * 2;
		ctx.strokeStyle = colorEle.value;
	}

	if (e.key == 'y') {
		if (linePopIndex < 0) return;
		const lineItem = linePop[linePopIndex--];
		linePop.pop();

		lineStack.push(lineItem);
		lineStackIndex++;

		ctx.beginPath();
		ctx.lineWidth = lineItem[0];
		ctx.strokeStyle = lineItem[5];
		ctx.moveTo(lineItem[1], lineItem[2]);
		ctx.lineTo(lineItem[3], lineItem[4]);
		ctx.stroke();
		ctx.closePath();

		drawPoint(lineItem[1], lineItem[2], lineItem[0] / 2, lineItem[5]);
		drawPoint(lineItem[3], lineItem[4], lineItem[0] / 2, lineItem[5]);

		ctx.lineWidth = sizeEle.value * 2;
		ctx.strokeStyle = colorEle.value;
	}
});
