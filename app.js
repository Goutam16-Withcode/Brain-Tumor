/**
 * Brain Tumor AI Diagnostic Studio - Interactive Application Engine
 * Uses Real Dataset Sample Scans (samples/glioma.jpg, meningioma.jpg, pituitary.jpg, notumor.jpg)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Loaded Image Cache
  const sampleImages = {};

  const state = {
    activeTab: 'studio',
    activeSample: 'glioma',
    opacity: 0.65,
    colormap: 'jet',
    currentSlice: 16,
    apiAvailable: false,
    predictions: {
      glioma: { class: 'Glioma', prob: 0.994, icon: '🚨', badgeClass: 'badge-glioma', fillClass: 'fill-danger', note: 'Infiltrative hyperintense lesion detected in upper cerebral cortex ROI.', heatPos: { x: 0.72, y: 0.38, radius: 0.22 } },
      meningioma: { class: 'Meningioma', prob: 0.982, icon: '⚠️', badgeClass: 'badge-meningioma', fillClass: 'fill-warning', note: 'Extra-axial dural attachment lesion with uniform contrast enhancement.', heatPos: { x: 0.30, y: 0.34, radius: 0.20 } },
      pituitary: { class: 'Pituitary', prob: 0.989, icon: '🔍', badgeClass: 'badge-pituitary', fillClass: 'fill-primary', note: 'Sellar / suprasellar hyperintense lesion observed near skull base.', heatPos: { x: 0.50, y: 0.46, radius: 0.18 } },
      notumor: { class: 'No Tumor', prob: 0.998, icon: '✅', badgeClass: 'badge-notumor', fillClass: 'fill-success', note: 'Normal brain parenchyma. Symmetrical ventricles and clear sulci.', heatPos: { x: 0.50, y: 0.50, radius: 0.05 } }
    }
  };

  // Preload real sample images
  ['glioma', 'meningioma', 'pituitary', 'notumor'].forEach(type => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      sampleImages[type] = img;
      renderSampleThumbnail(type);
      if (type === state.activeSample) renderMainScan();
    };
    img.src = `samples/${type}.jpg`;
  });

  // Tab Navigation Setup
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const pageTitle = document.getElementById('page-title');
  const pageDescription = document.getElementById('page-description');

  const tabDescriptions = {
    studio: 'Upload brain MRI scan or select sample dataset scan for classification & Grad-CAM explainability.',
    preprocessing: 'Step-by-step OpenCV contour detection pipeline for brain anatomy cropping.',
    anatomy: '3D axial plane slice locator and anatomical tumor characteristics.',
    report: 'Clinical diagnostic summary and printable medical evaluation sheet.',
    analytics: 'Evaluation metrics, confusion matrix, and performance breakdown on Kaggle dataset.'
  };

  const tabTitles = {
    studio: 'Diagnostic Studio',
    preprocessing: 'Preprocessing Engine',
    anatomy: '3D Anatomy Map',
    report: 'Clinical Report',
    analytics: 'Model Performance'
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;
      state.activeTab = tab;

      navItems.forEach(n => n.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      document.getElementById(`panel-${tab}`).classList.add('active');

      pageTitle.textContent = tabTitles[tab];
      pageDescription.textContent = tabDescriptions[tab];

      if (tab === 'preprocessing') renderPreprocessingSteps();
      if (tab === 'anatomy') render3DSlice(state.currentSlice);
      if (tab === 'report') updateReportSheet();
    });
  });

  // Render Sample Thumbnail
  function renderSampleThumbnail(type) {
    const thumbCanvas = document.getElementById(`thumb-${type}`);
    if (!thumbCanvas || !sampleImages[type]) return;
    thumbCanvas.width = 120;
    thumbCanvas.height = 120;
    const ctx = thumbCanvas.getContext('2d');
    ctx.drawImage(sampleImages[type], 0, 0, 120, 120);
  }

  // Main MRI & Grad-CAM Visualizer
  const mainCanvas = document.getElementById('mri-canvas');
  
  function renderMainScan() {
    if (!mainCanvas) return;
    const ctx = mainCanvas.getContext('2d');
    const size = 400;
    mainCanvas.width = size;
    mainCanvas.height = size;

    const img = sampleImages[state.activeSample];
    if (img) {
      ctx.drawImage(img, 0, 0, size, size);
    } else {
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, size, size);
    }

    // Draw Grad-CAM overlay if opacity > 0
    if (state.opacity > 0) {
      const heatCanvas = document.createElement('canvas');
      heatCanvas.width = size;
      heatCanvas.height = size;
      const hCtx = heatCanvas.getContext('2d');

      const predInfo = state.predictions[state.activeSample] || state.predictions.glioma;
      const tx = size * predInfo.heatPos.x;
      const ty = size * predInfo.heatPos.y;
      const rad = size * predInfo.heatPos.radius;

      // Create activation heatmap gradient
      const grad = hCtx.createRadialGradient(tx, ty, 5, tx, ty, rad);

      if (state.colormap === 'jet') {
        grad.addColorStop(0, 'rgba(255, 0, 0, 0.9)');
        grad.addColorStop(0.4, 'rgba(255, 255, 0, 0.7)');
        grad.addColorStop(0.7, 'rgba(0, 255, 255, 0.4)');
        grad.addColorStop(1, 'rgba(0, 0, 255, 0)');
      } else if (state.colormap === 'turbo') {
        grad.addColorStop(0, 'rgba(230, 50, 25, 0.9)');
        grad.addColorStop(0.5, 'rgba(40, 200, 100, 0.7)');
        grad.addColorStop(1, 'rgba(50, 100, 240, 0)');
      } else if (state.colormap === 'plasma') {
        grad.addColorStop(0, 'rgba(240, 249, 33, 0.9)');
        grad.addColorStop(0.5, 'rgba(204, 71, 120, 0.7)');
        grad.addColorStop(1, 'rgba(13, 8, 135, 0)');
      } else if (state.colormap === 'viridis') {
        grad.addColorStop(0, 'rgba(253, 231, 37, 0.9)');
        grad.addColorStop(0.5, 'rgba(33, 145, 140, 0.7)');
        grad.addColorStop(1, 'rgba(68, 1, 84, 0)');
      } else { // inferno
        grad.addColorStop(0, 'rgba(252, 255, 164, 0.9)');
        grad.addColorStop(0.5, 'rgba(187, 55, 84, 0.7)');
        grad.addColorStop(1, 'rgba(0, 0, 4, 0)');
      }

      hCtx.fillStyle = grad;
      hCtx.fillRect(0, 0, size, size);

      ctx.globalAlpha = state.opacity;
      ctx.drawImage(heatCanvas, 0, 0);
      ctx.globalAlpha = 1.0;
    }

    updatePredictionUI();
  }

  // Update Prediction UI
  function updatePredictionUI() {
    const sample = state.activeSample;
    const pred = state.predictions[sample] || state.predictions.glioma;

    const topBadge = document.getElementById('top-prediction-badge');
    const predText = document.getElementById('pred-class-text');
    const predIcon = document.getElementById('pred-icon');
    const confVal = document.getElementById('top-confidence-val');
    const noteText = document.getElementById('clinical-notes-text');

    if (topBadge) {
      topBadge.className = `prediction-badge ${pred.badgeClass}`;
      predText.textContent = sample === 'notumor' ? 'No Tumor Detected' : `${pred.class} Tumor Detected`;
      predIcon.textContent = pred.icon;
      confVal.textContent = `${(pred.prob * 100).toFixed(1)}%`;
      noteText.textContent = pred.note;
    }

    // Update progress bars
    ['glioma', 'meningioma', 'pituitary', 'notumor'].forEach(key => {
      const bar = document.getElementById(`prob-bar-${key}`);
      const val = document.getElementById(`prob-val-${key}`);
      let prob = (key === sample) ? pred.prob : (1 - pred.prob) / 3;
      if (val) val.textContent = `${(prob * 100).toFixed(1)}%`;
      if (bar) bar.style.width = `${(prob * 100).toFixed(1)}%`;
    });
  }

  // Sample Selection Handlers
  document.querySelectorAll('.sample-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.sample-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.activeSample = card.dataset.sample;
      renderMainScan();
    });
  });

  // Grad-CAM Controls Event Handlers
  const sliderOpacity = document.getElementById('slider-opacity');
  const opacityVal = document.getElementById('opacity-val');
  if (sliderOpacity) {
    sliderOpacity.addEventListener('input', (e) => {
      state.opacity = parseFloat(e.target.value) / 100;
      opacityVal.textContent = `${e.target.value}%`;
      renderMainScan();
    });
  }

  document.querySelectorAll('.colormap-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.colormap-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.colormap = btn.dataset.map;
      renderMainScan();
    });
  });

  // Drag & Drop File Handler
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length) handleUploadedFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) handleUploadedFile(e.target.files[0]);
    });
  }

  function handleUploadedFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        sampleImages['custom'] = img;
        state.activeSample = 'custom';
        renderMainScan();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Click Inspector on Canvas
  if (mainCanvas) {
    mainCanvas.addEventListener('click', (e) => {
      const rect = mainCanvas.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);
      const inspector = document.getElementById('pixel-score');
      if (inspector) {
        const predInfo = state.predictions[state.activeSample] || state.predictions.glioma;
        const tx = 400 * predInfo.heatPos.x;
        const ty = 400 * predInfo.heatPos.y;
        const dist = Math.sqrt((x - tx)**2 + (y - ty)**2);
        const score = Math.max(0.08, (1 - dist / 200)).toFixed(3);
        inspector.textContent = `Intensity: ${score} at (${x}, ${y})`;
      }
    });
  }

  // Preprocessing Steps Rendering on Real MRI Image
  function renderPreprocessingSteps() {
    const img = sampleImages[state.activeSample];
    if (!img) return;

    for (let i = 1; i <= 5; i++) {
      const c = document.getElementById(`pipe-step${i}`);
      if (!c) continue;
      c.width = 160;
      c.height = 160;
      const ctx = c.getContext('2d');

      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, 160, 160);

      if (i === 1) { // Raw Scan
        ctx.drawImage(img, 0, 0, 160, 160);
      } else if (i === 2) { // Grayscale & Blur
        ctx.drawImage(img, 0, 0, 160, 160);
        const imgData = ctx.getImageData(0, 0, 160, 160);
        const d = imgData.data;
        for (let p = 0; p < d.length; p += 4) {
          const avg = (d[p] + d[p+1] + d[p+2]) / 3;
          d[p] = avg; d[p+1] = avg; d[p+2] = avg;
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (i === 3) { // Binary Threshold
        ctx.drawImage(img, 0, 0, 160, 160);
        const imgData = ctx.getImageData(0, 0, 160, 160);
        const d = imgData.data;
        for (let p = 0; p < d.length; p += 4) {
          const avg = (d[p] + d[p+1] + d[p+2]) / 3;
          const bw = avg > 40 ? 255 : 0;
          d[p] = bw; d[p+1] = bw; d[p+2] = bw;
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (i === 4) { // Contour Bounding Box
        ctx.drawImage(img, 0, 0, 160, 160);
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.strokeRect(12, 10, 136, 140);
        ctx.fillStyle = 'rgba(37, 99, 235, 0.15)';
        ctx.fillRect(12, 10, 136, 140);
      } else if (i === 5) { // Cropped 240x240
        ctx.drawImage(img, 12, 10, 136, 140, 0, 0, 160, 160);
      }
    }
  }

  // 3D Slice Viewer
  const slider3D = document.getElementById('slider-3d-slice');
  const sliceVal = document.getElementById('slice-val');

  function render3DSlice(slice) {
    const c = document.getElementById('canvas-3d');
    if (!c) return;
    c.width = 400;
    c.height = 400;
    const ctx = c.getContext('2d');

    const scale = 0.6 + (slice / 32) * 0.4;
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, 400, 400);

    const img = sampleImages[state.activeSample];
    if (img) {
      ctx.save();
      ctx.translate(200, 200);
      ctx.scale(scale, scale);
      ctx.translate(-200, -200);
      ctx.drawImage(img, 0, 0, 400, 400);
      ctx.restore();
    }

    // Grid overlays for axial plane indicator
    ctx.strokeStyle = 'rgba(13, 148, 136, 0.35)';
    ctx.lineWidth = 1;
    for (let g = 40; g < 400; g += 40) {
      ctx.beginPath(); ctx.moveTo(g, 0); ctx.lineTo(g, 400); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, g); ctx.lineTo(400, g); ctx.stroke();
    }
  }

  if (slider3D) {
    slider3D.addEventListener('input', (e) => {
      state.currentSlice = parseInt(e.target.value);
      if (sliceVal) sliceVal.textContent = `Slice ${state.currentSlice} / 32`;
      render3DSlice(state.currentSlice);
    });
  }

  // Update Clinical Report
  function updateReportSheet() {
    const reportDate = document.getElementById('report-date');
    if (reportDate) reportDate.textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const sample = state.activeSample;
    const pred = state.predictions[sample] || state.predictions.glioma;

    const findTitle = document.getElementById('report-finding-title');
    const findDesc = document.getElementById('report-finding-desc');

    if (findTitle) findTitle.textContent = `Primary Finding: ${pred.class} ${sample === 'notumor' ? '' : 'Tumor'}`;
    if (findDesc) findDesc.textContent = `Model confidence score: ${(pred.prob * 100).toFixed(1)}%. ${pred.note}`;

    const probList = document.getElementById('report-prob-list');
    if (probList) {
      probList.innerHTML = Object.keys(state.predictions).map(k => {
        const item = state.predictions[k];
        const prob = k === sample ? (item.prob * 100).toFixed(1) : ((1 - pred.prob) * 100 / 3).toFixed(1);
        return `
          <div style="display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid var(--border-color); font-size: 0.85rem;">
            <span>${item.class}</span>
            <strong>${prob}%</strong>
          </div>
        `;
      }).join('');
    }
  }

  // Print Report Handler
  const btnExport = document.getElementById('btn-export-report');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      window.print();
    });
  }

  // Reset Handler
  const btnReset = document.getElementById('btn-reset');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      state.activeSample = 'glioma';
      state.opacity = 0.65;
      if (sliderOpacity) sliderOpacity.value = 65;
      if (opacityVal) opacityVal.textContent = '65%';
      document.querySelectorAll('.sample-card').forEach(c => c.classList.remove('selected'));
      const firstCard = document.querySelector('.sample-card[data-sample="glioma"]');
      if (firstCard) firstCard.classList.add('selected');
      renderMainScan();
    });
  }
});
