'use strict';

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const canvas = $('#draw');
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'black';

let lineStack = [];
let lineStackIndex = -1;

let linePop = [];
let linePopIndex = -1;

let penPoint_status = false;
let penLine_status = false;
let isDown = false;
let prevX, prevY;

// Draw Functions
function drawPoint(x, y) {
	if (!penPoint_status) return;
	const circle = new Path2D();
	circle.arc(x, y, $('#size').value, 0, 2 * Math.PI);
	ctx.fillStyle = $('#color').value;
	ctx.fill(circle);
}

function drawLine(x1, y1, x2, y2) {
	ctx.beginPath();
	ctx.lineWidth = $('#size').value * 2;
	ctx.strokeStyle = $('#color').value;
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

function penMouseMove(e) {
	const x2 = e.offsetX;
	const y2 = e.offsetY;

	if (isDown) {
		drawPoint(x2, y2);
		drawLine(prevX, prevY, x2, y2);
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
	ctx.lineWidth = $('#size').value * 2 - 2;
	ctx.strokeStyle = $('#color').value;
	ctx.moveTo(prevX - react.left, prevY - react.top);
	ctx.lineTo(clientX - react.left, clientY - react.top);
	ctx.stroke();

	lineStack.push([
		ctx.lineWidth + 2,
		prevX - react.left,
		prevY - react.top,
		clientX - react.left,
		clientY - react.top,
		ctx.strokeStyle,
	]);
	lineStackIndex++;
}

// Draw Usage
$('#pen').addEventListener('click', () => {
	penPoint_status = true;
	penLine_status = false;

	canvas.removeEventListener('mousedown', lineMouseDown);
	canvas.removeEventListener('click', lineClick);

	canvas.addEventListener('mousedown', penMouseDown);
	document.addEventListener('mouseup', penMouseUp);
	canvas.addEventListener('mousemove', penMouseMove);
});

$('#line').addEventListener('click', () => {
	penLine_status = true;
	penPoint_status = false;

	canvas.removeEventListener('mousedown', penMouseDown);
	document.removeEventListener('mouseup', penMouseUp);
	canvas.removeEventListener('mousemove', penMouseMove);

	canvas.addEventListener('mousedown', lineMouseDown);
	canvas.addEventListener('click', lineClick);
});

// Clear & Resize
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

	$('#size').value = 5;
	$('#w-size').value = 900;
	$('#h-size').value = 500;
	$('#color').value = '#000000';

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
Mode.addEventListener('click', (e) => {
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

// Undo
window.addEventListener('keydown', (e) => {
	if (e.keyCode == 90) {
		if (lineStackIndex < 0) return;
		const lineItem = lineStack[lineStackIndex--];
		lineStack.pop();

		linePop.push(lineItem);
		linePopIndex++;

		console.log(lineItem);

		ctx.beginPath();
		ctx.lineWidth = lineItem[0];
		ctx.strokeStyle = '#ffffff';
		ctx.moveTo(lineItem[1], lineItem[2]);
		ctx.lineTo(lineItem[3], lineItem[4]);
		ctx.stroke();

		ctx.lineWidth = $('#size').value * 2;
		ctx.strokeStyle = $('#color').value;
	}

	if (e.keyCode == 89) {
		if (linePopIndex < 0) return;
		const lineItem = linePop[linePopIndex--];
		linePop.pop();

		lineStack.push(lineItem);
		lineStackIndex++;

		ctx.beginPath();
		ctx.lineWidth = lineItem[0] - 2;
		ctx.strokeStyle = lineItem[5];
		ctx.moveTo(lineItem[1], lineItem[2]);
		ctx.lineTo(lineItem[3], lineItem[4]);
		ctx.stroke();

		ctx.lineWidth = $('#size').value * 2;
		ctx.strokeStyle = $('#color').value;
	}
});
