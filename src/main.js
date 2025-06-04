const upload = document.getElementById('upload');
const scaleSelect = document.getElementById('scale');
const resizeBtn = document.getElementById('resize');
const canvas = document.getElementById('canvas');
const output = document.getElementById('output');

let image = new Image();

upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});

resizeBtn.addEventListener('click', () => {
  const scale = parseFloat(scaleSelect.value);
  const ctx = canvas.getContext('2d');

  const width = image.width * scale;
  const height = image.height * scale;

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0, width, height);

  output.src = canvas.toDataURL('image/jpeg');
});
