# 🧠 Brain Tumor Classification & Diagnostic Studio

![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.10%2B-FF6F00.svg)
![Accuracy](https://img.shields.io/badge/Test_Accuracy-99.08%25-brightgreen.svg)
![UI Theme](https://img.shields.io/badge/UI_Theme-Clean_Light_Medical-2563eb.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

An advanced deep learning framework and **interactive Web Diagnostic Studio** for classifying brain tumors from MRI scans using **EfficientNetB1** and visualizing model decision rationale with **Gradient-weighted Class Activation Mapping (Grad-CAM)**.

---

## 🌟 Key Features

- 🏥 **Minimal & Clean Light Medical UI**: Built with a clean slate aesthetic, subtle shadows, high readability, and responsive design for clinical clarity.
- 🔬 **Interactive Diagnostic Studio**: Drag-and-drop custom MRI scans or select curated sample scans (Glioma, Meningioma, Pituitary, No Tumor).
- 🎨 **Grad-CAM Heatmap Explorer**:
  - Live opacity slider control
  - Multiple colormap themes (*Jet, Turbo, Plasma, Viridis, Inferno*)
  - Click-to-inspect pixel activation intensity scores
- ✂️ **OpenCV Contour Crop Preprocessor Visualizer**: Step-by-step visual inspection of raw scans, grayscale blur, binary thresholding, bounding box extraction, and 240x240 normalization.
- 🧩 **3D Brain Anatomical Region Map**: Axial plane slice locator showing tumor origin regions across brain anatomical structures.
- 📄 **Clinical PDF Report Generator**: One-click printable medical summary containing patient ID, scan metadata, class confidence breakdown, and radiologist disclaimer.
- 🐍 **Python Flask API Server (`app.py`)**: Production-ready backend for serving live TensorFlow `model.keras` inference and Grad-CAM generation over REST endpoints.

---

## 🎯 Classification Categories

The system accurately classifies MRI scans into four distinct clinical categories:

| Category | Description | Model Test Metrics |
| :--- | :--- | :--- |
| **Glioma** | Tumors originating in glial cells of the brain/spinal cord | 99% Precision / 98% Recall |
| **Meningioma** | Tumors arising from the meningeal membranes surrounding brain | 97% Precision / 98% Recall |
| **Pituitary** | Tumors forming within the pituitary gland at the skull base | 99% Precision / 99% Recall |
| **No Tumor** | Healthy MRI scans with clear brain parenchyma | 100% Precision / 100% Recall |

---

## 🚀 Quickstart & Local Setup

### Option 1: Direct Browser Launch (Standalone Frontend)
No complex backend installation required! Open `index.html` directly in any web browser or serve with a lightweight HTTP server:

```bash
# Using Python built-in HTTP server
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

---

### Option 2: Full Python Backend API Server (`app.py`)

1. **Install Dependencies**:
```bash
pip install -r requirements.txt
```

2. **Run Python Flask Server**:
```bash
python app.py
```
The application will launch on `http://localhost:5000` with live REST API capabilities!

---

## 🌐 Where & How to Deploy

### 1. **Vercel / GitHub Pages (Free Frontend Hosting)**
- **GitHub Pages**: Go to Repo **Settings** $\rightarrow$ **Pages** $\rightarrow$ Select `main` branch $\rightarrow$ Save. Your site will be live at `https://<your-username>.github.io/Brain-Tumor/`.
- **Vercel**: Import repository on [Vercel.com](https://vercel.com) and click **Deploy**.

### 2. **Render / Railway (Full Python API Server + Frontend)**
- **Render**: Connect repository on [Render.com](https://render.com), set Build Command to `pip install -r requirements.txt`, and Start Command to `gunicorn app:app`.

### 3. **Hugging Face Spaces (Machine Learning Hosting)**
- Create a new Space on [Hugging Face Spaces](https://huggingface.co/spaces) with **Docker** or **Flask** SDK and sync with your GitHub repo.

### 4. **Docker Container Deployment**
```bash
# Build Docker image
docker build -t brain-tumor-ai .

# Run container
docker run -p 5000:5000 brain-tumor-ai
```

---

## 🔌 API Documentation

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/` | `GET` | Serves the interactive Diagnostic Studio Web UI |
| `/api/predict` | `POST` | Upload MRI image file to get class predictions & probabilities |
| `/api/health` | `GET` | Health check endpoint returning backend status & model load state |

### Sample API Response (`POST /api/predict`)

```json
{
  "success": true,
  "predicted_class": "glioma",
  "confidence": 0.994,
  "probabilities": {
    "glioma": 0.994,
    "meningioma": 0.004,
    "notumor": 0.001,
    "pituitary": 0.001
  }
}
```

---

## 📊 Dataset & Model Architecture

- **Dataset Source**: [Brain Tumor MRI Dataset](https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset) on Kaggle.
- **Model Backbone**: EfficientNetB1 (pretrained on ImageNet, fine-tuned).
- **Pooling & Regularization**: Global Max Pooling 2D + Dropout (0.5).
- **Test Performance**: **99.08% overall accuracy** on 1,311 test scans.

```
EfficientNetB1 (Pretrained Backbone)
         ↓
  GlobalMaxPooling2D
         ↓
    Dropout (0.5)
         ↓
Dense (4 Units, Softmax)
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

This project is created for research and educational purposes. It should not replace professional radiological evaluation or clinical medical diagnosis.