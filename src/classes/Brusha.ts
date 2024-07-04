'use strict';

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

export class Brusha {
  constants = {
    UNDO_LIMIT: 100,
    MAX_WIDTH: Math.min(innerWidth * 2, 1e4),
    MAX_HEIGHT: Math.min(innerHeight * 2, 1e4),
  };
  devices = [
    { down: 'mousedown', move: 'mousemove', up: 'mouseup' },
    { down: 'touchstart', move: 'touchmove', up: 'touchend' },
  ];

  canvasEle: HTMLCanvasElement;
  circleEle: HTMLElement;
  colorEle: HTMLElement;
  colorGeneralEle: HTMLInputElement;
  colorGradientEle: HTMLElement;
  eraserEle: HTMLElement;
  fileUploadEle: HTMLElement;
  gradientAngleEle: HTMLInputElement;
  heightEle: HTMLInputElement;
  lineEle: HTMLElement;
  menuIconEle: HTMLElement;
  moveEle: HTMLElement;
  penEle: HTMLElement;
  rectEle: HTMLElement;
  resetEle: HTMLElement;
  resizeEle: HTMLElement;
  sizeEle: HTMLInputElement;
  themeSwitchEle: HTMLElement;
  widthEle: HTMLInputElement;

  ctx: CanvasRenderingContext2D;

  prevConfig = { size: '', color: '', colorType: 0 };
  prevCoor = { x: undefined, y: undefined };
  states = { undo: [] as any[], redo: [] as any[], move: [] as any[] };
  mouse = { x: undefined, y: undefined };
  imgData: { img: HTMLImageElement | null; w: number; h: number } = { img: null, w: 0, h: 0 };

  isDark = false;
  isDown = false;
  toolState = false;

  get: Record<string, () => any>;

  colorInputHandle;

  constructor(ele: Record<string, HTMLCanvasElement & HTMLInputElement & HTMLElement>) {
    this.canvasEle = ele.canvas;
    this.colorEle = ele.color;
    this.sizeEle = ele.size;
    this.moveEle = ele.move;
    this.penEle = ele.pen;
    this.lineEle = ele.line;
    this.circleEle = ele.circle;
    this.rectEle = ele.rect;
    this.eraserEle = ele.eraser;
    this.resetEle = ele.reset;
    this.resizeEle = ele.resize;
    this.widthEle = ele.width;
    this.heightEle = ele.height;
    this.gradientAngleEle = ele.gradientAngle;
    this.fileUploadEle = ele.fileUpload;
    this.themeSwitchEle = ele.themeSwitch;
    this.menuIconEle = $('.menu-ico')!;
    this.colorGeneralEle = $('#general-color')!;
    this.colorGradientEle = $('.gradient-color')!;

    this.canvasEle.width = this.constants.MAX_WIDTH;
    this.canvasEle.height = this.constants.MAX_HEIGHT;
    this.widthEle.value = '' + this.constants.MAX_WIDTH;
    this.heightEle.value = '' + this.constants.MAX_HEIGHT;

    this.ctx = this.canvasEle.getContext('2d')!;
    this.ctx.fillStyle = 'black';

    this.colorInputHandle = {
      updateGradient: () => {
        const colorValues = [
          ...(this.colorGradientEle.querySelectorAll('input[type=color]') as NodeListOf<HTMLInputElement>),
        ]
          .map((_: HTMLInputElement) => _.value)
          .join(',');
        const angle = +this.gradientAngleEle.value;

        this.colorGradientEle.style.backgroundImage = `linear-gradient(${angle}deg, ${colorValues})`;
        this.colorGradientEle.setAttribute('color-values', colorValues);
      },

      onchange(e: any) {
        e.target.setAttribute('value', e.target.value);
        this.updateGradient();
      },

      oncontextmenu(e: any) {
        e.preventDefault();

        const inps = [...e.target.closest('.colors').querySelectorAll('input[type=color]')];
        inps.length > 2 && e.target.remove();

        this.updateGradient();
      },
    };

    this.get = {
      getColorType: () => +($('input[name=colorType]:checked')! as HTMLInputElement).value,
      circleType: () => +($('input[name=circle]:checked')! as HTMLInputElement).value,
      rectType: () => +($('input[name=rect]:checked')! as HTMLInputElement).value,

      size: () => this.sizeEle.value,
      color: () => {
        const type = this.get.getColorType();
        if (!type) return this.colorGeneralEle.value;

        this.colorInputHandle.updateGradient();
        return this.colorGradientEle && this.colorGradientEle.getAttribute('color-values')!.split(',');
      },
      width: () => this.widthEle.value,
      height: () => this.heightEle.value,
      theme: () => this.themeSwitchEle.innerHTML,
      gradientAngle: () => this.gradientAngleEle.value,
    };
  }

  // Canvas Functions
  getMousePos(e: any) {
    const { top, left } = this.canvasEle.getBoundingClientRect();
    const { x, y } = this.prevCoor;

    return {
      x: (x || 0) - left,
      y: (y || 0) - top,
      toX: (e?.changedTouches ? e.changedTouches[0].pageX : e.clientX) - left,
      toY: (e?.changedTouches ? e.changedTouches[0].pageY : e.clientY) - top,
    };
  }

  clearCanvas = () => {
    this.canvasEle.width = this.get.width();
    this.canvasEle.height = this.get.height();
  };

  getCanvasImg = () => {
    const img = new Image();
    img.src = this.canvasEle.toDataURL('image/bmp', 1.0);
    return img;
  };

  reset = () => {
    const img = this.getCanvasImg();
    this.clearCanvas();
    this.drawImage(img);
    this.removeAllEvent();

    const last = $('.btn--active');
    last && last.classList.remove('btn--active');
  };

  resetHandle = () => {
    this.reset();

    this.states.undo.length = 0;
    this.states.redo.length = 0;

    this.canvasEle.width = this.constants.MAX_WIDTH;
    this.canvasEle.height = this.constants.MAX_HEIGHT;
    this.widthEle.value = '' + this.constants.MAX_WIDTH;
    this.heightEle.value = '' + this.constants.MAX_HEIGHT;
    this.sizeEle.value = '' + 5;
    this.colorGeneralEle.value = '#000000';

    this.ctx.fillStyle = 'black';
  };

  // Draw Functions
  drawPoint(x: number, y: number, { size, color, type = 1 }: { size: number; color: string | string[]; type: number }) {
    this.ctx.beginPath();

    if (!Array.isArray(color)) {
      if (!type || !this.get.getColorType()) this.ctx.fillStyle = color;
    } else {
      const grd = this.ctx.createLinearGradient(x - size, y - size, x + size, y + size);
      const lth = color.length - 1;

      color.forEach((_: string, idx) => grd.addColorStop((idx * 1) / lth, _));
      this.ctx.fillStyle = grd;
    }

    this.ctx.arc(x, y, size, 0, 2 * Math.PI, false);
    this.ctx.fill();
    this.ctx.closePath();
  }

  drawLine(
    x: number,
    y: number,
    toX: number,
    toY: number,
    { size, color, type = 1 }: { size: number; color: string | string[]; type?: number },
  ) {
    this.ctx.beginPath();
    this.ctx.lineWidth = size * 2;

    if (!Array.isArray(color)) {
      if (!type || !this.get.getColorType()) this.ctx.strokeStyle = color;
    } else {
      const grd = this.ctx.createLinearGradient(x, y, toX, toY);
      const lth = color.length - 1;

      color.forEach((_, idx) => grd.addColorStop((idx * 1) / lth, _));
      this.ctx.strokeStyle = grd;
    }

    this.ctx.moveTo(x, y);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  drawRect(
    x: number,
    y: number,
    toX: number,
    toY: number,
    { size, color, type = 1 }: { size: number; color: string | string[]; type?: number },
  ) {
    this.ctx.beginPath();
    this.ctx.lineWidth = size;

    if (!Array.isArray(color)) {
      if (!type || !this.get.getColorType()) {
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
      }
    } else {
      const grd = this.ctx.createLinearGradient(x, y, x + toX / 2, y + toY / 2);
      const lth = color.length - 1;

      color.forEach((_, idx) => grd.addColorStop((idx * 1) / lth, _));
      this.ctx.fillStyle = grd;
      this.ctx.strokeStyle = grd;
    }

    this.get.rectType() ? this.ctx.fillRect(x, y, toX, toY) : this.ctx.strokeRect(x, y, toX, toY);
    this.ctx.closePath();
  }

  drawCircle(
    x: number,
    y: number,
    toX: number,
    toY: number,
    { radius, color, type = 1 }: { radius: number; color: string | string[]; type?: number },
  ) {
    this.ctx.beginPath();

    if (!Array.isArray(color)) {
      if (!type || !this.get.getColorType()) {
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
      }
    } else {
      const unitVector = {
        x: (toX - x) * 2,
        y: (toY - y) * 2,
      };
      const grd = this.ctx.createLinearGradient(toX - unitVector.x, toY - unitVector.y, toX, toY);
      const lth = color.length - 1;

      color.forEach((_, idx) => grd.addColorStop((idx * 1) / lth, _));
      this.ctx.fillStyle = grd;
      this.ctx.strokeStyle = grd;
    }

    this.ctx.lineWidth = this.get.size();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    this.get.circleType() ? this.ctx.fill() : this.ctx.stroke();
    this.ctx.closePath();
  }

  drawImage(img: any, x = 0, y = 0, width = -1, height = -1) {
    if (width == -1 || height == -1) this.ctx.drawImage(img, x, y);
    else this.ctx.drawImage(img, x, y, width, height);
  }

  // Pen Functions
  penDown = (e: any) => {
    this.undoAdd();

    this.isDown = true;
    this.prevCoor.x = e.clientX || (e.changedTouches && e.changedTouches[0].pageX);
    this.prevCoor.y = e.clientY || (e.changedTouches && e.changedTouches[0].pageY);

    const size = this.get.size();
    const color = this.get.color();
    const colorIsArr = Array.isArray(color);
    const { x, y } = this.getMousePos(e);

    this.drawPoint(x, y, {
      size,
      color: colorIsArr ? color[0] : color,
      type: 0,
    });
  };

  penMove = (e: any) => {
    const { x, y, toX, toY } = this.getMousePos(e);

    if (this.isDown) {
      const size = this.get.size();
      const color = this.get.color();
      const colorIsArr = Array.isArray(color);
      const config = {
        size,
        color: colorIsArr ? color[0] : color,
        type: 0,
      };

      this.drawPoint(toX, toY, config);
      this.drawLine(x, y, toX, toY, config);
    }

    this.prevCoor.x = e.clientX || (e.changedTouches && e.changedTouches[0].pageX);
    this.prevCoor.y = e.clientY || (e.changedTouches && e.changedTouches[0].pageY);
  };

  penUp = () => {
    if (this.isDown) this.states.redo.push({ type: 'redo', data: this.getCanvasImg() });

    this.isDown = false;
    this.prevCoor.x = this.prevCoor.y = undefined;
  };

  // Line Functions
  lineDown = (e: any) => {
    this.undoAdd();

    this.isDown = true;
    this.prevCoor.x = e.clientX || (e.changedTouches && e.changedTouches[0].pageX);
    this.prevCoor.y = e.clientY || (e.changedTouches && e.changedTouches[0].pageY);
  };

  lineMove = (e: any) => {
    const { x, y, toX, toY } = this.getMousePos(e);

    if (this.isDown) {
      this.undoDraw('line');

      const size = this.get.size();
      const color = this.get.color();
      const colorIsArr = Array.isArray(color);

      this.drawPoint(x, y, {
        size,
        color: colorIsArr ? color[0] : color,
        type: 0,
      });
      this.drawPoint(toX, toY, {
        size,
        color: colorIsArr ? color[color.length - 1] : color,
        type: 0,
      });
      this.drawLine(x, y, toX, toY, { size, color });
    }
  };

  lineUp = () => {
    if (this.isDown) this.states.redo.push({ type: 'redo', data: this.getCanvasImg() });

    this.isDown = false;
    this.prevCoor.x = this.prevCoor.y = undefined;
  };

  // Shapes Functions
  circleMove = (e: any) => {
    const { x, y, toX, toY } = this.getMousePos(e);

    const calcDist = ({ x, y }: any, { toX, toY }: any) => Math.sqrt((toX - x) ** 2 + (toY - y) ** 2);

    if (this.isDown) {
      this.undoDraw('line');

      const color = this.get.color() as string;
      this.drawCircle(x, y, toX, toY, {
        radius: calcDist({ x, y }, { toX, toY }),
        color,
      });
    }
  };

  rectMove = (e: any) => {
    const { x, y, toX, toY } = this.getMousePos(e);

    if (this.isDown) {
      this.undoDraw('line');

      const size = this.get.size();
      const color = this.get.color();
      this.drawRect(x, y, toX - x, toY - y, { size, color });
    }
  };

  // Move Space Functions
  moveDown = (e: any) => {
    this.isDown = true;
    this.prevCoor.x = e.clientX || (e.changedTouches && e.changedTouches[0].pageX);
    this.prevCoor.y = e.clientY || (e.changedTouches && e.changedTouches[0].pageY);
  };

  moving = (e: any) => {
    if (!this.isDown) return;

    const { x, y, toX, toY } = this.getMousePos(e);

    this.canvasEle.style.transform = `
		translate3d(
			${toX - x}px,
			${toY - y}px,
			0px
		)`;
  };

  moveUp = (e: any) => {
    if (!this.isDown) return;

    const { x, y, toX, toY } = this.getMousePos(e);
    const last = {
      left: +this.canvasEle.style.left.replace('px', ''),
      top: +this.canvasEle.style.top.replace('px', ''),
    };

    Object.assign(this.canvasEle.style, {
      left: `${last.left + toX - x}px`,
      top: `${last.top + toY - y}px`,
      transform: `translate3d(0px, 0px, 0px)`,
    });

    this.isDown = false;
    this.prevCoor.x = this.prevCoor.y = undefined;
  };

  // Undo - Redo Functions
  undoAdd = (type = 'undo') => {
    // if (this.states.undo.length >= this.UNDO_LIMIT) this.states.undo.splice(1, 1);
    this.states.undo.push({ type, data: this.getCanvasImg() });
    this.states.redo.pop();
  };

  undoDraw = (type = 'undo') => {
    if (this.states.undo.length) {
      this.clearCanvas();

      const prevState = type === 'undo' ? this.states.undo.pop() : this.states.undo[this.states.undo.length - 1];

      this.drawImage(prevState.data);

      if (this.states.undo.length === 0) {
        this.states.undo.push({ ...prevState, type: 'undo' });
        return;
      }

      if (type !== 'line') this.states.redo.push({ ...prevState, type: 'redo' });
    }
  };

  redoDraw = () => {
    if (this.states.redo.length) {
      this.clearCanvas();

      const prevState = this.states.redo.pop();
      this.drawImage(prevState.data);

      if (this.states.redo.length === 0) {
        this.states.redo.push({ ...prevState, type: 'redo' });
        return;
      }

      this.states.undo.push({ ...prevState, type: 'undo' });
    }
  };

  // Draw Usage
  removeAllEvent = () => {
    this.canvasEle.removeEventListener('click', this.drawUpload);
    this.devices.forEach((_) => {
      this.canvasEle.removeEventListener(_.down, this.lineDown);
      this.canvasEle.removeEventListener(_.down, this.moveDown);
      this.canvasEle.removeEventListener(_.down, this.penDown);

      this.canvasEle.removeEventListener(_.move, this.moving);
      this.canvasEle.removeEventListener(_.move, this.rectMove);
      document.removeEventListener(_.move, this.circleMove);
      document.removeEventListener(_.move, this.lineMove);
      document.removeEventListener(_.move, this.penMove);

      document.removeEventListener(_.up, this.lineUp);
      document.removeEventListener(_.up, this.moveUp);
      document.removeEventListener(_.up, this.penUp);
    });
  };

  resizeHandle = () => {
    const { width: a, height: b } = this.canvasEle;
    const x = +this.widthEle.value;
    const y = +this.heightEle.value;

    if (x === a && y === b) return;

    this.reset();
  };

  moveSpaceHandle = () => {
    this.removeAllEvent();
    this.devices.forEach((_) => {
      this.canvasEle.addEventListener(_.down, this.moveDown);
      this.canvasEle.addEventListener(_.move, this.moving);
      document.addEventListener(_.up, this.moveUp);
    });
  };

  drawUpload = (e: any) => {
    this.undoAdd();

    if (!this.imgData.img) return console.error('No image data');
    const { img, w, h } = this.imgData;
    const { x, y } = {
      x: e?.changedTouches ? e.changedTouches[0].pageX : e.offsetX,
      y: e?.changedTouches ? e.changedTouches[0].pageY : e.offsetY,
    };
    const szContainer = $('.file-size-container')!;
    const fileSize = {
      width: () => +(szContainer.querySelector('input.width')! as HTMLInputElement).value,
      height: () => +(szContainer.querySelector('input.height')! as HTMLInputElement).value,
    };

    const szW = fileSize.width();
    const szH = (szW * h) / w;

    this.drawImage(img, x, y, szW, szH);
  };

  drawUsePen = (type = 'pen') => {
    const inps = $$('input[name=colorType]') as NodeListOf<HTMLInputElement>;

    if (type === 'eraser') {
      !this.prevConfig.size && (this.prevConfig.size = this.get.size());
      !this.prevConfig.color && (this.prevConfig.color = this.colorGeneralEle.value || '');

      this.sizeEle.value = '' + Math.min(this.get.size() * 2, 400);
      this.colorGeneralEle.value = '#ffffff';

      if (inps[1].checked) {
        this.prevConfig.colorType = 1;

        inps[0].checked = true;
        inps[1].checked = false;
      }
    } else {
      this.sizeEle.value = this.prevConfig.size || this.get.size();
      this.colorGeneralEle.value = this.prevConfig.color || '#000000';

      this.prevConfig.size = '';
      this.prevConfig.color = '';

      if (this.prevConfig.colorType === 1) {
        this.prevConfig.colorType = 0;

        inps[0].checked = false;
        inps[1].checked = true;
      }
    }

    this.removeAllEvent();
    this.devices.forEach((_) => {
      this.canvasEle.addEventListener(_.down, this.penDown);
      document.addEventListener(_.move, this.penMove);
      document.addEventListener(_.up, this.penUp);
    });
  };

  drawUseLine = () => {
    this.removeAllEvent();
    this.devices.forEach((_) => {
      this.canvasEle.addEventListener(_.down, this.lineDown);
      document.addEventListener(_.move, this.lineMove);
      document.addEventListener(_.up, this.lineUp);
    });
  };

  drawUseCircle = () => {
    this.removeAllEvent();
    this.devices.forEach((_) => {
      this.canvasEle.addEventListener(_.down, this.lineDown);
      document.addEventListener(_.move, this.circleMove);
      document.addEventListener(_.up, this.lineUp);
    });
  };

  drawUseRect = () => {
    this.removeAllEvent();
    this.devices.forEach((_) => {
      this.canvasEle.addEventListener(_.down, this.lineDown);
      this.canvasEle.addEventListener(_.move, this.rectMove);
      document.addEventListener(_.up, this.lineUp);
    });
  };

  // App process
  actions = () => {
    onkeydown = (e: any) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey;
      // const shift = e.shiftKey;

      if (ctrl)
        switch (key) {
          case 's':
            e.preventDefault();
            break;

          case 'z':
            e.preventDefault();
            this.undoDraw();
            break;

          case 'y':
            e.preventDefault();
            this.redoDraw();
            break;

          default:
            e.preventDefault();
            break;
        }
      else
        switch (key) {
          case 'b':
            e.preventDefault();
            this.penEle.click();
            break;

          case 'l':
            e.preventDefault();
            this.lineEle.click();
            break;

          case 'c':
            e.preventDefault();
            this.circleEle.click();
            break;

          case 'r':
            e.preventDefault();
            this.rectEle.click();
            break;

          case 'e':
            e.preventDefault();
            this.eraserEle.click();
            break;

          case ' ':
            e.preventDefault();
            this.moveEle.click();
            break;

          case '=':
            e.preventDefault();
            this.sizeEle.value = '' + (+this.sizeEle.value + 1);
            break;

          case '-':
            e.preventDefault();
            if (+this.sizeEle.value > 1) this.sizeEle.value = '' + (+this.sizeEle.value - 1);
            break;

          default:
            break;
        }
    };

    this.themeSwitchEle.onclick = () => {
      this.isDark = !this.isDark;
      !this.isDark ? (this.themeSwitchEle.innerHTML = 'Dark') : (this.themeSwitchEle.innerHTML = 'Light');

      document.body.classList.toggle('dark', this.isDark);
    };

    this.devices.forEach((_) => {
      this.canvasEle.addEventListener(_.move, () => {
        this.isDown && this.menuIconEle.classList.remove('active');
      });
      this.canvasEle.addEventListener(_.up, () => {
        this.toolState && this.menuIconEle.classList.add('active');
      });
    });

    ($('.tool-container')! as HTMLElement).ondblclick = () => {
      this.menuIconEle.classList.remove('active');
      this.toolState = false;
    };

    ($$('.btn--change') as NodeListOf<HTMLElement>).forEach((_: HTMLElement) => {
      _.addEventListener('click', function () {
        const last = $('.btn--active');
        last && last.classList.remove('btn--active');

        this.classList.add('btn--active');
      });
    });

    ($$('.tool-btn') as NodeListOf<HTMLElement>).forEach((_: HTMLElement) => {
      _.ondblclick = (e: any) => e.stopPropagation();
    });
  };

  init = () => {
    this.penEle.onclick = () => this.drawUsePen();
    this.lineEle.onclick = this.drawUseLine;
    this.circleEle.onclick = this.drawUseCircle;
    this.rectEle.onclick = this.drawUseRect;
    this.resetEle.onclick = this.resetHandle;
    this.resizeEle.onclick = this.resizeHandle;
    this.moveEle.onclick = this.moveSpaceHandle;
    this.eraserEle.onclick = () => this.drawUsePen('eraser');

    this.menuIconEle.addEventListener('click', (e: any) => {
      e.target.classList.toggle('active');
      this.toolState = this.menuIconEle.className.includes('active');
    });
    this.colorEle &&
      ((this.colorEle.querySelector('.add-point')! as HTMLElement).onclick = () => {
        const colors = this.colorGradientEle.querySelector('.colors');
        const inps = [...this.colorGradientEle.querySelectorAll('input[type=color]')] as HTMLInputElement[];

        if (colors)
          colors.innerHTML += `
			<input
				type="color"
				value="${inps.length ? inps[inps.length - 1].value : '#ffffff'}"
				onchange="app.colorInputHandle.onchange(event)"
				oncontextmenu="app.colorInputHandle.oncontextmenu(event)"
			/>`;
      });
    this.fileUploadEle.onchange = (e: any) => {
      const { files } = e.target;
      const addImgBtn = $('.add-img')!;
      const filePreview = $('.file-preview')!;

      [...files].forEach((file) => {
        const item = document.createElement('div');
        const itemPreview = document.createElement('div');
        const url = URL.createObjectURL(file);

        const configEle = (el: any, className: any) => {
          el.className = className;
          el.dataset.imgurl = url;

          el.style.background = `url(${url})`;
          el.style.backgroundSize = 'cover';
          el.style.backgroundPosition = 'center';
          el.style.backgroundRepeat = 'no-repeat';
        };

        configEle(item, 'item');
        configEle(itemPreview, 'item-preview');

        item.onclick = (e: any) => {
          const last = filePreview.querySelector('.item.select');
          last && last.classList.remove('select');

          e.target.classList.add('select');
        };

        item.appendChild(itemPreview);
        filePreview.appendChild(item);
      });

      (addImgBtn as HTMLElement).onclick = () => {
        const selectImg = filePreview.querySelector('.item.select');
        if (!selectImg) return;

        this.removeAllEvent();

        const img = new Image();
        img.src = (selectImg as HTMLElement).dataset.imgurl || '';
        img.onload = (e: any) => {
          const w = e.target.width;
          const h = e.target.height;

          this.imgData = { img, w, h };
          this.canvasEle.addEventListener('click', this.drawUpload);
        };
      };
    };
  };
}

export const initApp = () => {
  const app = new Brusha({
    canvas: $('#draw')!,
    color: $('#color')!,
    size: $('#size')!,
    move: $('#move')!,
    pen: $('#pen')!,
    line: $('#line')!,
    circle: $('#circle')!,
    rect: $('#rect')!,
    eraser: $('#eraser')!,
    reset: $('#reset')!,
    resize: $('#resize')!,
    width: $('#w-size')!,
    height: $('#h-size')!,
    gradientAngle: $('#gradientAngle')!,
    fileUpload: $('#file-upload')!,
    themeSwitch: $('#switch-mode')!,
  });

  app.init();
  app.actions();

  console.log(app);
};
