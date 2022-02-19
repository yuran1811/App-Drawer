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
		label: 'Pen',
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
		content: `<input
					id="size" type="number"
					value="5" min="1" max="400"
					placeholder="Change the size"
				/>`,
	},
	{
		id: 'upload',
		label: 'Upload',
		change: false,
		content: `<input type="file" id="file-upload" name="filename" accept=".jpg, .png, .svg" multiple/>
				<button class="add-img">Add</button>`,
	},
	{
		id: 'resize-container',
		label: '',
		change: false,
		content: `Width:
				<input
					id="w-size" type="number"
					value="900" min="50" max="1200"
					placeholder="width"
				/>
				Height:
				<input id="h-size" type="number" value="500" min="50" max="700" placeholder="height"/>
				<span class="tool-btn" id="resize">Resize</span>`,
	},
];

const toolContainerHTML = TOOL.map(
	(item) => `
		<div
			class="tool-btn ${item.change ? 'btn--change' : ''}"
			${item.id ? `id="${item.id}"` : ''}
		>
		${item.label ? `${item.label}` : ''}
		${item.content ? `${item.content}` : ''}
		</div>`
).join('');

const mainHTML = `
	<div class="canvas">
		<canvas id="draw" height="500" width="900"></canvas>
	</div>
	<div class="menu">
		<i class="fa-3x fas fa-plus-circle menu-ico"></i>
		<div class="all-tool">
			<div class="tool-container">
				${toolContainerHTML}
			</div>
		</div>
	</div>`;

const main = document.querySelector('.main');
main.innerHTML = mainHTML;
