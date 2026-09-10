// Original homepage typography and noise field, adapted only for the shared sticky transition.
export function createOriginalHeroField(fluidHero: HTMLElement, fluidCanvas: HTMLCanvasElement, identityName: HTMLElement) {
    // —— simplex noise 3D（Gustavson 经典实现，公有领域）——
    const grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
    const permBase = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
    const perm = new Array<number>(512);
    const permMod12 = new Array<number>(512);
    for (let i = 0; i < 512; i += 1) {
      perm[i] = permBase[i & 255];
      permMod12[i] = perm[i] % 12;
    }
    const F3 = 1 / 3;
    const G3 = 1 / 6;

    const noise3 = (xin: number, yin: number, zin: number) => {
      let n0 = 0;
      let n1 = 0;
      let n2 = 0;
      let n3 = 0;
      const s = (xin + yin + zin) * F3;
      const i = Math.floor(xin + s);
      const j = Math.floor(yin + s);
      const k = Math.floor(zin + s);
      const t = (i + j + k) * G3;
      const x0 = xin - (i - t);
      const y0 = yin - (j - t);
      const z0 = zin - (k - t);
      let i1: number; let j1: number; let k1: number;
      let i2: number; let j2: number; let k2: number;
      if (x0 >= y0) {
        if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
        else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
        else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
      } else {
        if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
        else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
        else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      }
      const x1 = x0 - i1 + G3;
      const y1 = y0 - j1 + G3;
      const z1 = z0 - k1 + G3;
      const x2 = x0 - i2 + 2 * G3;
      const y2 = y0 - j2 + 2 * G3;
      const z2 = z0 - k2 + 2 * G3;
      const x3 = x0 - 1 + 3 * G3;
      const y3 = y0 - 1 + 3 * G3;
      const z3 = z0 - 1 + 3 * G3;
      const ii = i & 255;
      const jj = j & 255;
      const kk = k & 255;
      const gi0 = permMod12[ii + perm[jj + perm[kk]]];
      const gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]];
      const gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]];
      const gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]];
      let t0 = .6 - x0 * x0 - y0 * y0 - z0 * z0;
      if (t0 > 0) { t0 *= t0; n0 = t0 * t0 * (grad3[gi0][0] * x0 + grad3[gi0][1] * y0 + grad3[gi0][2] * z0); }
      let t1 = .6 - x1 * x1 - y1 * y1 - z1 * z1;
      if (t1 > 0) { t1 *= t1; n1 = t1 * t1 * (grad3[gi1][0] * x1 + grad3[gi1][1] * y1 + grad3[gi1][2] * z1); }
      let t2 = .6 - x2 * x2 - y2 * y2 - z2 * z2;
      if (t2 > 0) { t2 *= t2; n2 = t2 * t2 * (grad3[gi2][0] * x2 + grad3[gi2][1] * y2 + grad3[gi2][2] * z2); }
      let t3 = .6 - x3 * x3 - y3 * y3 - z3 * z3;
      if (t3 > 0) { t3 *= t3; n3 = t3 * t3 * (grad3[gi3][0] * x3 + grad3[gi3][1] * y3 + grad3[gi3][2] * z3); }
      return 32 * (n0 + n1 + n2 + n3);
    };

    // —— 跳动文字场 ——
    const MASK_WORD = "ANSYN";
    const FLUID_TEXT = "proof motion signal build system ".repeat(8);

    const fluidCtx = fluidCanvas.getContext("2d");
    const overprint = fluidHero.querySelector<HTMLCanvasElement>("[data-field-overprint]");
    const overprintCtx = overprint?.getContext("2d");
    const foregroundWords = [...fluidHero.querySelectorAll<HTMLElement>(".hero-word")];
    const OVERPRINT_DENSITY = .16;
    const OVERPRINT_OPACITY = .3;
    const STEP = 4;           // 采样半径（格）
    const FREQ = .01;         // 噪声空间频率（每格），与 2xa 一致
    const TIME_SCALE = 1e-4;  // 噪声时间流速，与 2xa 一致
    const COLOR_FIELD = "#bdbdbd";  // Slightly darker than the designer’s #cbcbcb field.
    const COLOR_WORD = "#1a1a1a";   // "Ansyn" 轮廓内（深，近黑但仍是跳动的字）

    let viewWidth = 0;
    let viewHeight = 0;
    let dpr = 1;
    let cellWidth = 0;
    let cellHeight = 0;
    let gridCols = 0;
    let gridRows = 0;
    let grid: string[] = [];
    let paraCells: boolean[] = [];
    let maskPixels: Uint8ClampedArray | null = null;
    let maskCX = 0;
    let maskCY = 0;
    let flyScale = 1;
    let flyTargetX = 0;
    let flyTargetYBase = 0;
    let atlasField: HTMLCanvasElement | null = null;
    let atlasWord: HTMLCanvasElement | null = null;
    let atlasCellWidth = 0;
    let charToIndex = new Map<string, number>();

    const buildAtlas = (font: string, fontSize: number, color: string) => {
      const atlas = document.createElement("canvas");
      atlas.width = Math.max(1, Math.round(charToIndex.size * atlasCellWidth * dpr));
      atlas.height = Math.max(1, Math.round(cellHeight * dpr));
      const atlasCtx = atlas.getContext("2d");
      if (!atlasCtx) return null;
      atlasCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      atlasCtx.font = font;
      atlasCtx.fillStyle = color;
      atlasCtx.textBaseline = "top";
      charToIndex.forEach((index, char) => {
        atlasCtx.fillText(char, index * atlasCellWidth + 1, (cellHeight - fontSize) / 2);
      });
      return atlas;
    };

    const setupField = () => {
      if (!fluidCtx) return;
      viewWidth = fluidHero.clientWidth;
      viewHeight = fluidHero.clientHeight;
      if (viewWidth < 2 || viewHeight < 2) return;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const fontSize = viewWidth < 700 ? 11 : 13;
      const font = `400 ${fontSize}px "Space Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;

      fluidCanvas.width = Math.round(viewWidth * dpr);
      fluidCanvas.height = Math.round(viewHeight * dpr);
      fluidCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (overprint && overprintCtx) {
        overprint.width = fluidCanvas.width; overprint.height = fluidCanvas.height;
        overprintCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      fluidCtx.font = font;
      cellWidth = fluidCtx.measureText("M").width;
      cellHeight = Math.round(fontSize * 1.45);
      gridCols = Math.ceil(viewWidth / cellWidth) + 4;
      gridRows = Math.ceil(viewHeight / cellHeight) + 2;

      // 掩码：离屏逐字母画出巨大的 "ANSYN"（每个字母轻微错位、倾斜，排版不那么规整），
      // 轮廓内的格子用深色字 + 更慢的跳动，名字从字场中显出
      const mask = document.createElement("canvas");
      mask.width = viewWidth;
      mask.height = viewHeight;
      const maskCtx = mask.getContext("2d", { willReadFrequently: true });
      if (!maskCtx) return;
      const maskLetters = [...MASK_WORD];
      const LETTER_GAP = .03; // 字母间距（em）
      maskCtx.font = `800 100px Poppins, sans-serif`;
      const letterWidths = maskLetters.map((letter) => maskCtx.measureText(letter).width);
      const unit = letterWidths.reduce((sum, width) => sum + width, 0) + LETTER_GAP * 100 * (maskLetters.length - 1);
      const maskSize = Math.min((viewWidth * .94) / unit * 100, viewHeight * 1.05);
      maskCtx.font = `800 ${maskSize}px Poppins, sans-serif`;
      maskCtx.textAlign = "left";
      maskCtx.textBaseline = "middle";
      maskCtx.fillStyle = "#000";
      const totalWidth = unit * maskSize / 100;
      let cursorX = (viewWidth - totalWidth) / 2;
      const jitters = [-.02, .21, 0, .13, -.03];  // 各字母纵向错位（em）：N 大沉、S 不动、Y 略沉、尾 N 略抬
      const tilts = [-2, 1.5, -1.2, 1.8, -1.5];      // 各字母倾斜（度）
      maskLetters.forEach((letter, index) => {
        const letterWidth = letterWidths[index] * maskSize / 100;
        maskCtx.save();
        maskCtx.translate(cursorX + letterWidth / 2, viewHeight / 2 + jitters[index % jitters.length] * maskSize);
        maskCtx.rotate(tilts[index % tilts.length] * Math.PI / 180);
        maskCtx.fillText(letter, -letterWidth / 2, 0);
        maskCtx.restore();
        cursorX += letterWidth + LETTER_GAP * maskSize;
      });
      const maskData = maskCtx.getImageData(0, 0, viewWidth, viewHeight).data;

      // 飞行参数：滚动时整幅掩码向视口左上角品牌位缩放平移，粒子字母"变成" Ansyn 标识
      maskPixels = maskData;
      maskCX = viewWidth / 2;
      maskCY = viewHeight / 2;
      const brand = identityName.getBoundingClientRect();
      const canvasBounds = fluidCanvas.getBoundingClientRect();
      flyScale = brand.width / totalWidth;
      flyTargetX = brand.left - canvasBounds.left + brand.width / 2;
      // The field animates while the stage is pinned at the viewport top.
      flyTargetYBase = brand.top + brand.height / 2;

      // 段落块：Ansyn 之外的小字按原站排成 4 列段落，段落之间留白；
      // 每行末尾随机缩进 0-7 格，模拟自然段落的参差右边缘
      const paraCols = viewWidth < 700
        ? [[.02, .48], [.52, .98]]
        : [[.005, .235], [.265, .495], [.525, .755], [.785, .995]];
      const paraBands = viewWidth < 700
        ? [[[.08, .30], [.37, .56], [.63, .95]], [[.08, .34], [.41, .62], [.69, .92]]]
        : [[[.15, .42], [.48, .97]], [[.15, .38], [.44, .62], [.68, .95]], [[.15, .40], [.46, .66], [.72, .93]], [[.15, .36], [.42, .70], [.76, .94]]];
      paraCells = new Array<boolean>(gridRows * gridCols).fill(false);
      paraCols.forEach((range, colIndex) => {
        const colStart = Math.floor(range[0] * gridCols);
        const colEnd = Math.floor(range[1] * gridCols);
        paraBands[colIndex].forEach((band) => {
          const rowStart = Math.floor(band[0] * gridRows);
          const rowEnd = Math.floor(band[1] * gridRows);
          for (let row = rowStart; row <= rowEnd; row += 1) {
            const trim = Math.floor(Math.random() * 8);
            for (let col = colStart; col <= colEnd - trim; col += 1) {
              paraCells[row * gridCols + col] = true;
            }
          }
        });
      });

      // 整格填满宣言文本：字母飞到哪里都有字符可用
      grid = [];
      let textPointer = 0;
      for (let row = 0; row < gridRows; row += 1) {
        let line = "";
        for (let col = 0; col < gridCols; col += 1) {
          line += FLUID_TEXT[textPointer % FLUID_TEXT.length];
          textPointer += 1;
        }
        grid.push(line);
      }

      charToIndex = new Map();
      grid.forEach((gridLine) => {
        for (const char of gridLine) {
          if (char !== " " && !charToIndex.has(char)) charToIndex.set(char, charToIndex.size);
        }
      });
      atlasCellWidth = Math.ceil(cellWidth) + 2;
      atlasField = buildAtlas(font, fontSize, COLOR_FIELD);
      atlasWord = buildAtlas(font, fontSize, COLOR_WORD);
    };

    const draw = (now: number, exit: number, reduced: boolean) => {
      if (!fluidCtx || !atlasField || !atlasWord) return;
      fluidCtx.clearRect(0, 0, viewWidth, viewHeight);
      overprintCtx?.clearRect(0, 0, viewWidth, viewHeight);
      // Only a few of the existing field characters cross the large words.
      // Read their live bounds so the overlay follows the scroll exit exactly.
      const overprintFade = reduced ? 0 : Math.max(0, 1 - exit * 3);
      const origin = overprintFade > 0 ? fluidHero.getBoundingClientRect() : null;
      const wordBounds = origin ? foregroundWords.map(word => {
        const rect = word.getBoundingClientRect();
        return { left: rect.left - origin.left, right: rect.right - origin.left,
          top: rect.top - origin.top, bottom: rect.bottom - origin.top,
          opacity: Number(word.style.opacity || 1) };
      }) : [];
      let overprinted = 0;
      if (exit >= 1 && !reduced) return;
      const time = reduced ? 0 : now * TIME_SCALE;
      // 与原站一致：滚动把噪声场垂直推移，跳动图案随滚动流动
      const scrollShift = exit * viewHeight * .05;
      // 滚动觉醒梯度：往下滑字场逐渐「冷静」（原站 threshold 思路）
      const calm = Math.max(0, 1 - exit);
      const fieldStep = STEP * (.25 + .75 * calm);
      // ANSYN 飞行：滚动一整屏，整幅掩码向左上角品牌位缩放平移；
      // 飞行途中字场压暗，让字母成为唯一焦点；到位后粒子淡出、DOM 标识淡入
      const fly = exit;
      const flyEase = fly < .5 ? 4 * fly * fly * fly : 1 - Math.pow(-2 * fly + 2, 3) / 2;
      const flyS = 1 + (flyScale - 1) * flyEase;
      const flyCX = maskCX + (flyTargetX - maskCX) * flyEase;
      // 目标点跟踪视口左上角（hero 随滚动上移，品牌位在屏幕中的位置 = hero 坐标 scrollY + 顶栏高）
      const flyCY = maskCY + (flyTargetYBase - maskCY) * flyEase;
      const wordAlpha = fly < .9 ? 1 : Math.max(0, 1 - (fly - .9) / .1);
      const paraAlpha = 1 - flyEase;
      for (let row = 0; row < gridRows; row += 1) {
        const baseY = row * cellHeight;
        const noiseY = (row + scrollShift) * FREQ;
        const sampleY = ((row + .5) * cellHeight - flyCY) / flyS + maskCY;
        const maskRow = sampleY >= 0 && sampleY < viewHeight ? Math.round(sampleY) : -1;
        for (let col = 0; col < gridCols; col += 1) {
          const flat = row * gridCols + col;
          let isWord = false;
          if (maskPixels && maskRow >= 0) {
            const sampleX = ((col + .5) * cellWidth - flyCX) / flyS + maskCX;
            if (sampleX >= 0 && sampleX < viewWidth) {
              isWord = maskPixels[(maskRow * viewWidth + Math.round(sampleX)) * 4 + 3] > 100;
            }
          }
          if (!isWord && !paraCells[flat]) continue;
          let char: string;
          if (isWord) {
            // ANSYN 字母区：只和相邻格偶尔换字，取到空格就用回自己的字符
            // —— 字母始终饱满、微微颤动，在剧烈跳动的字场中自然显出形状
            const angle = Math.PI * 2 * noise3(col * FREQ, noiseY, time * .5);
            const srcCol = Math.min(gridCols - 1, Math.max(0, col + Math.round(Math.cos(angle))));
            const srcRow = Math.min(gridRows - 1, Math.max(0, row + Math.round(Math.sin(angle))));
            char = grid[srcRow][srcCol];
            if (char === " ") char = grid[row][col];
          } else {
            const angle = Math.PI * 2 * noise3(col * FREQ, noiseY, time);
            const srcCol = Math.min(gridCols - 1, Math.max(0, col + Math.round(Math.cos(angle) * fieldStep)));
            const srcRow = Math.min(gridRows - 1, Math.max(0, row + Math.round(Math.sin(angle) * fieldStep)));
            // 段落区只从段落内的格子取字，取到空白这一帧就消失（保持忽隐忽现的跳感）
            char = paraCells[srcRow * gridCols + srcCol] ? grid[srcRow][srcCol] : " ";
          }
          if (char === " ") continue;
          const atlasIndex = charToIndex.get(char);
          if (atlasIndex === undefined) continue;
          const atlas = isWord ? atlasWord : atlasField;
          fluidCtx.globalAlpha = isWord ? wordAlpha : paraAlpha;
          fluidCtx.drawImage(
            atlas,
            atlasIndex * atlasCellWidth * dpr, 0, atlasCellWidth * dpr, cellHeight * dpr,
            col * cellWidth - 1, baseY, atlasCellWidth, cellHeight
          );
          fluidCtx.globalAlpha = 1;
          const overprintHash = ((col * 73 + row * 139) % 100) / 100;
          if (overprintCtx && overprintFade > 0 && overprintHash < OVERPRINT_DENSITY) {
            const x = col * cellWidth, y = baseY + cellHeight / 2;
            const word = wordBounds.find(bounds => x >= bounds.left && x + cellWidth <= bounds.right && y >= bounds.top && y <= bounds.bottom);
            if (word) {
              overprintCtx.globalAlpha = OVERPRINT_OPACITY * overprintFade * word.opacity;
              overprintCtx.drawImage(atlasField,
                atlasIndex * atlasCellWidth * dpr, 0, atlasCellWidth * dpr, cellHeight * dpr,
                x - 1, baseY, atlasCellWidth, cellHeight);
              overprinted++;
            }
          }
        }
      }
      if (overprint) overprint.dataset.visibleCharacters = String(overprinted);
    };


return {resize: setupField, draw};
}
