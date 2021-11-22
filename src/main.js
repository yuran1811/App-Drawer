const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const canvas = $('#draw');
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'black';

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
	ctx.strokeStyle = $('#color').value;
	ctx.lineWidth = $('#size').value * 2;
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
	ctx.lineWidth = $('#size').value * 2;
	ctx.strokeStyle = $('#color').value;
	ctx.moveTo(prevX - react.left, prevY - react.top);
	ctx.lineTo(clientX - react.left, clientY - react.top);
	ctx.stroke();
}

// Draw Usage
const drawUsingPen = $('#pen');
drawUsingPen.addEventListener('click', () => {
	penPoint_status = true;
	penLine_status = false;

	canvas.removeEventListener('mousedown', lineMouseDown);
	canvas.removeEventListener('click', lineClick);

	canvas.addEventListener('mousedown', penMouseDown);
	document.addEventListener('mouseup', penMouseUp);
	canvas.addEventListener('mousemove', penMouseMove);
});

// Draw Line
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
}
$('#reset').addEventListener('click', () => {
	penPoint_status = penLine_status = 0;
	Reset();
});
$('#resize').addEventListener('click', () => Reset());

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
