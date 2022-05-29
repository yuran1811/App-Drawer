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
		id: 'move',
		label: 'Move',
		change: true,
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
		id: 'circle',
		label: 'Circle',
		change: true,
		content: `
		<div class="form-group">
			<label for="circle-fill">Fill</label>
			<input id="circle-fill" name="circle" type="radio" value="1" checked />

			<label for="circle-nofill">No fill</label>
			<input id="circle-nofill" name="circle" type="radio" value="0" />
		</div>`,
	},
	{
		id: 'rect',
		label: 'Rect',
		change: true,
		content: `
		<div class="form-group">
			<label for="rect-fill">Fill</label>
			<input id="rect-fill" name="rect" type="radio" value="1" checked />

			<label for="rect-nofill">No fill</label>
			<input id="rect-nofill" name="rect" type="radio" value="0" />
		</div>`,
	},
	{
		id: 'color',
		label: 'Color',
		change: false,
		content: `
		<div class="form-group">
			<div class="container-general">
				<label for="generalType">General</label>
				<input id="generalType" name="colorType" type="radio" value="0" checked />

				<input id="general-color" type="color" value="#000000" />
			</div>

			<div class="container-gradient">
				<label for="gradientType">Gradient</label>
				<input id="gradientType" name="colorType" type="radio" value="1" />

				<div class="gradient-color" onmouseover="app.colorInputHandle.updateGradient()" >
					<div class="config">
						<button class="add-point">
							<span class="ico"></span>
						</button>
						<input
							id="gradientAngle"
							type="number"
							min="0"
							max="360"
							value="45"
							oninput="app.colorInputHandle.onchange(event)"
						/>
					</div>
					<div class="colors">
						<input
							type="color"
							value="#ffc2c2"
							onchange="app.colorInputHandle.onchange(event)"
							oncontextmenu="app.colorInputHandle.oncontextmenu(event)"
						/>
						<input
							type="color"
							value="#ff8f8f"
							onchange="app.colorInputHandle.onchange(event)"
							oncontextmenu="app.colorInputHandle.oncontextmenu(event)"
						/>
						<input
							type="color"
							value="#d03e3e"
							onchange="app.colorInputHandle.onchange(event)"
							oncontextmenu="app.colorInputHandle.oncontextmenu(event)"
						/>
					</div>
				</div>
			</div>
		</div>`,
	},
	{
		id: '',
		label: 'Size',
		change: false,
		content: `<input id="size" type="number" value="5" min="1" max="400" placeholder="Change the size" />`,
	},
	{
		id: 'upload',
		label: 'Upload',
		change: false,
		content: `
		<input type="file" id="file-upload" name="filename" accept=".jpg, .png, .svg" multiple />
		<button class="add-img">Add</button>`,
	},
	{
		id: 'resize-container',
		label: '',
		change: false,
		content: `
		<span class="tool-label"> Width: </span>
		<input id="w-size" type="number" value="900" min="50" max="2000" placeholder="width" />
		
		<span class="tool-label"> Height: </span>
		<input id="h-size" type="number" value="500" min="50" max="2000" placeholder="height" />

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
		<canvas id="draw"></canvas>
	</div>
	<div class="menu">
		<div class="menu-ico"></div>
		<div class="menu-tool">
			<div class="tool-container">
				${toolContainerHTML}
			</div>
		</div>
	</div>`;

document.querySelector('.main').innerHTML = mainHTML;
