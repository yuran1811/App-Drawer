'use strict';

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const canvas = $('#draw');
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'black';

const sizeSelect = $('#size');
const colorSelect = $('#color');

let linePop = [];
let lineStack = [];
let linePopIndex = -1;
let lineStackIndex = -1;

let penPoint_status = false;
let penLine_status = false;
let isDown = false;
let prevX, prevY;

// Draw Functions
const drawHeadLine = (x, y, size, color) => {
	const circle = new Path2D();
	circle.arc(x, y, size, 0, 2 * Math.PI);
	ctx.fillStyle = color;
	ctx.fill(circle);
};

function drawPoint(x, y, size, color) {
	if (!penPoint_status) return;
	drawHeadLine(x, y, size, color);
}

function drawLine(x1, y1, x2, y2, size, color) {
	ctx.beginPath();
	ctx.lineWidth = size * 2;
	ctx.strokeStyle = color;
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

// Pen Function
function penMouseDown(e) {
	isDown = 1;
	prevX = e.offsetX;
	prevY = e.offsetY;
	drawPoint(prevX, prevY);
}

function penMouseUp() {
	isDown = 0;
	prevX = undefined;
	prevY = undefined;
}

function penMouseMove(e, size = sizeSelect.value, color = colorSelect.value) {
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
	const { clientX, clientY } = e;
	prevX = clientX;
	prevY = clientY;
}

function lineClick(e) {
	if (!penLine_status) return;
	const react = canvas.getBoundingClientRect();
	const { clientX, clientY } = e;
	ctx.beginPath();
	ctx.lineWidth = sizeSelect.value * 2;
	ctx.strokeStyle = colorSelect.value;
	ctx.moveTo(prevX - react.left, prevY - react.top);
	ctx.lineTo(clientX - react.left, clientY - react.top);
	ctx.stroke();

	drawHeadLine(
		prevX - react.left,
		prevY - react.top,
		sizeSelect.value,
		colorSelect.value
	);
	drawHeadLine(
		clientX - react.left,
		clientY - react.top,
		sizeSelect.value,
		colorSelect.value
	);

	lineStack.push([
		ctx.lineWidth,
		prevX - react.left,
		prevY - react.top,
		clientX - react.left,
		clientY - react.top,
		ctx.strokeStyle,
	]);
	lineStackIndex++;
}

// Draw Usage
const removeAllEvent = () => {
	document.removeEventListener('mouseup', penMouseUp);
	canvas.removeEventListener('mousedown', penMouseDown);
	canvas.removeEventListener('mousemove', penMouseMove);
	canvas.removeEventListener('mousemove', eraseFunc);
	canvas.removeEventListener('mousedown', lineMouseDown);
	canvas.removeEventListener('click', lineClick);
};

const eraseFunc = (e) => {
	penMouseMove(e, sizeSelect.value * 2, '#ffffff');
};

const fileLocate = (e) => {
	ctx.drawImage(e.target.imgData, e.offsetX, e.offsetY);
};

const drawUsePen = () => {
	penPoint_status = true;
	penLine_status = false;

	canvas.removeEventListener('mousedown', lineMouseDown);
	canvas.removeEventListener('click', lineClick);
	canvas.removeEventListener('mousemove', eraseFunc);
	canvas.removeEventListener('click', fileLocate);

	canvas.addEventListener('mousedown', penMouseDown);
	document.addEventListener('mouseup', penMouseUp);
	canvas.addEventListener('mousemove', penMouseMove);
};

const drawUseLine = () => {
	penLine_status = true;
	penPoint_status = false;

	canvas.removeEventListener('mousedown', penMouseDown);
	document.removeEventListener('mouseup', penMouseUp);
	canvas.removeEventListener('mousemove', penMouseMove);
	canvas.removeEventListener('mousemove', eraseFunc);
	canvas.removeEventListener('click', fileLocate);

	canvas.addEventListener('mousedown', lineMouseDown);
	canvas.addEventListener('click', lineClick);
};

$('#pen').addEventListener('click', drawUsePen);
$('#line').addEventListener('click', drawUseLine);

// Clear & Resize & Eraser
$('#eraser').addEventListener('click', () => {
	penPoint_status = true;
	penLine_status = false;

	canvas.removeEventListener('mousedown', lineMouseDown);
	canvas.removeEventListener('click', lineClick);
	canvas.removeEventListener('mousemove', penMouseMove);

	canvas.addEventListener('mousedown', penMouseDown);
	document.addEventListener('mouseup', penMouseUp);
	canvas.addEventListener('mousemove', eraseFunc);
});

function Reset() {
	canvas.width = $('#w-size').value;
	canvas.height = $('#h-size').value;

	const lastItemSelect = $('.btn--active');
	if (lastItemSelect) {
		lastItemSelect.className = lastItemSelect.className.replace(
			'btn--active',
			''
		);
	}

	canvas.removeEventListener('mousedown', lineMouseDown);
	canvas.removeEventListener('click', lineClick);
	canvas.removeEventListener('mousedown', penMouseDown);
	document.removeEventListener('mouseup', penMouseUp);
	canvas.removeEventListener('mousemove', penMouseMove);
}

$('#reset').addEventListener('click', () => {
	penPoint_status = penLine_status = 0;
	Reset();

	linePopIndex = lineStackIndex = -1;
	linePop = [];
	lineStack = [];

	sizeSelect.value = 5;
	$('#w-size').value = 900;
	$('#h-size').value = 500;
	colorSelect.value = '#000000';

	canvas.width = 900;
	canvas.height = 500;
	ctx.fillStyle = 'black';
});

$('#resize').addEventListener('click', () => {
	localStorage.setItem('img', canvas.toDataURL());
	Reset();
	let dataURL = localStorage.getItem('img');
	let img = new Image();
	img.src = dataURL;
	img.onload = function () {
		ctx.drawImage(img, 0, 0);
	};
});

// Get Img from file
const reader = new FileReader();
$('#file-upload').addEventListener('change', (e) => {
	const files = e.target.files;
	let img = new Image();
	img.src = URL.createObjectURL(files[0]);
	img.onload = function () {
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
		const lastItemSelect = $('.btn--active');
		if (lastItemSelect) {
			lastItemSelect.className = lastItemSelect.className.replace(
				'btn--active',
				''
			);
		}
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
	if (e.keyCode == 90) {
		if (lineStackIndex < 0) return;
		const lineItem = lineStack[lineStackIndex--];
		lineStack.pop();

		linePop.push(lineItem);
		linePopIndex++;

		ctx.beginPath();
		ctx.lineWidth = lineItem[0] + 2;
		ctx.strokeStyle = '#ffffff';
		ctx.moveTo(lineItem[1], lineItem[2]);
		ctx.lineTo(lineItem[3], lineItem[4]);
		ctx.stroke();

		drawHeadLine(lineItem[1], lineItem[2], lineItem[0] / 2 + 1, '#ffffff');
		drawHeadLine(lineItem[3], lineItem[4], lineItem[0] / 2 + 1, '#ffffff');

		ctx.lineWidth = sizeSelect.value * 2;
		ctx.strokeStyle = colorSelect.value;
	}

	if (e.keyCode == 89) {
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

		drawHeadLine(lineItem[1], lineItem[2], lineItem[0] / 2, lineItem[5]);
		drawHeadLine(lineItem[3], lineItem[4], lineItem[0] / 2, lineItem[5]);

		ctx.lineWidth = sizeSelect.value * 2;
		ctx.strokeStyle = colorSelect.value;
	}
});
