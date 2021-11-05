const canvas = document.querySelector('#draw');
const pen = canvas.getContext('2d');
pen.fillStyle = 'black';

var penPoint_status = false;
var penLine_status = false;
var pointSize = 10;


// Pen
function Pen_drawPoint(x, y)
{
	if (!penPoint_status) return;
	const circle = new Path2D();
	pointSize = document.querySelector('#size').value;
	circle.arc(x, y, pointSize, 0, 2 * Math.PI);
	pen.fillStyle = document.querySelector('#color').value;
	pen.fill(circle);
}

function Pen_drawFree(e, isDown)
{	
	if (!isDown) return;
	const {clientX, clientY} = e;
	const react = canvas.getBoundingClientRect();
	Pen_drawPoint(clientX - react.left, clientY - react.top);
}

const PenDraw = document.querySelector('#pen');
PenDraw.addEventListener('click', (e) =>
{
	let isDown = false;
	penPoint_status = true;
	penLine_status = false;
	canvas.addEventListener('mouseup', (e) => {isDown = false;})
	canvas.addEventListener('mousedown', (e) => {isDown = 1; Pen_drawFree(e, isDown);});
	canvas.addEventListener('mousemove', (e) => {Pen_drawFree(e, isDown)});
})


// Theme
var isDark = 0;
const Mode = document.querySelector('#switch-mode');
Mode.addEventListener('click', (e) => {
	document.body.classList.toggle("dark");
	if (isDark)
	{
		Mode.innerHTML = "Dark";
		isDark = 0;
	} else
	{
		Mode.innerHTML = "Light";
		isDark = 1;
	}
});


// Draw Line
const LineDraw = document.querySelector('#line');
LineDraw.addEventListener('click', (e) =>
{
	penLine_status = true;
	penPoint_status = false;

	var mouseX = 0;
	var mouseY = 0;
	canvas.addEventListener('mousedown', (e) =>
	{
		const {clientX, clientY} = e;
		mouseX = clientX;
		mouseY = clientY;
	})
	canvas.addEventListener('click', (e) =>
	{
		if (!penLine_status) return;
		const react = canvas.getBoundingClientRect();
		const {clientX, clientY} = e;
		pen.beginPath();
		pen.lineWidth = document.querySelector('#size').value;
		pen.strokeStyle = document.querySelector('#color').value;
		pen.moveTo(mouseX - react.left, mouseY - react.top);
		pen.lineTo(clientX - react.left, clientY - react.top);
		pen.stroke();
	})
})


// Clear & Resize
function Reset() {
	canvas.width = document.querySelector('#w-size').value;
	canvas.height = document.querySelector('#h-size').value;
}

const ButtonClear = document.querySelector('#reset');
ButtonClear.addEventListener('click', (e) =>
{
	penPoint_status = penLine_status = 0;
	Reset();
});
document.querySelector('#resize').addEventListener('click', (e) => Reset());


// Button When Click
const btnContainer = document.querySelector('.tool-container');
var btnList = btnContainer.getElementsByClassName("change");
btnContainer.addEventListener('mouseover', function() {
	for (var i = 0; i < btnList.length; i++) {
		btnList[i].addEventListener("click", function() {
			var current = document.getElementsByClassName("btn-active");
			current[0].className = current[0].className.replace(" btn-active", "");
			this.className += " btn-active";
		});
	}
});
