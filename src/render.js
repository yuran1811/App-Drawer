const TOOL = [
	{
		id: 'switch-mode',
		label: 'Switch Mode',
		change: false,
		content: ``,
	},
	{
		id: 'reset',
		label: 'Reset',
		change: false,
		content: ``,
	},
	{
		id: 'eraser',
		label: 'Eraser',
		change: true,
		content: ``,
	},
	{
		id: 'pen',
		label: 'Brush',
		change: true,
		content: ``,
	},
	{
		id: 'line',
		label: 'Line',
		change: true,
		content: ``,
	},
	{
		id: '',
		label: 'Color',
		change: false,
		content: `<input id="color" type="color" name="favcolor" value="#000000"/>`,
	},
	{
		id: '',
		label: 'Size',
		change: false,
		content: `
		<input
			id="size" type="number"
			value="5" min="1" max="400"
			placeholder="Change the size"
		/>`,
	},
	{
		id: 'upload',
		label: 'Upload',
		change: false,
		content: `
		<input type="file" id="file-upload" name="filename" accept=".jpg, .png, .svg" multiple/>
		<button class="add-img">Add</button>`,
	},
	{
		id: 'resize-container',
		label: '',
		change: false,
		content: `
		<span class="tool-label"> Width: </span>
		<input
			id="w-size" type="number"
			value="900" min="50" max="1200"
			placeholder="width"
		/>
		<span class="tool-label"> Height: </span>
		<input id="h-size" type="number" value="500" min="50" max="700" placeholder="height"/>
		<div id="resize">Resize</div>`,
	},
];

const toolContainerHTML = TOOL.map(
	(item) => `
		<div
			class="tool-btn ${item.change ? 'btn--change' : ''}"
			${item.id ? `id="${item.id}"` : ''}
		>
		${item.label ? `<span class="tool-label"> ${item.label} </span>` : ''}
		${item.content ? `${item.content}` : ''}
		</div>`
).join('');

const mainHTML = `
	<div class="canvas">
		<canvas id="draw" height="500" width="900"></canvas>
	</div>
	<div class="menu">
		<i class="fa-3x fas fa-plus-circle menu-ico"></i>
		<div class="menu-tool">
			<div class="tool-container">
				${toolContainerHTML}
			</div>
		</div>
	</div>`;

document.querySelector('.main').innerHTML = mainHTML;
